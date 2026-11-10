import logging
import uuid
from datetime import datetime
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.device import Device
from app.models.activity import DeviceCommand, RoofActivity
from app.models.user import User
from app.schemas.command import CommandResponse, ModeUpdateResponse
from app.services.device_service import DeviceService
from app.utils.datetime import now_jakarta

logger = logging.getLogger("control_service")


class ControlService:
    @staticmethod
    def execute_command(
        db: Session,
        device_id: str,
        command_type: str,  # "open" or "close"
        user: Optional[User] = None,
        mqtt_service=None
    ) -> CommandResponse:
        """
        Alur Eksekusi Perintah Kendali Atap:
        1. Validasi keberadaan perangkat.
        2. Periksa status koneksi perangkat (online/offline).
        3. Periksa aturan keselamatan: Jika hujan aktif terdeteksi sensor lokal, perintah 'open' DITOLAK.
        4. Buat record DeviceCommand dengan ID unik (UUID).
        5. Eksekusi via simulasi atau publikasi ke MQTT.
        6. Catat riwayat aktivitas RoofActivity.
        7. Kembalikan respons status perintah yang valid.
        """
        device = DeviceService.get_device(db, device_id)
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "DEVICE_NOT_FOUND", "message": f"Perangkat {device_id} tidak ditemukan."}
            )

        conn_status = DeviceService.determine_connection_status(device)
        if conn_status == "offline" and not device.is_simulation:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "DEVICE_OFFLINE", "message": "Perangkat IoT fisik sedang offline/tidak terhubung."}
            )

        # 3. Pemeriksaan Kebijakan Keselamatan (Safety Policy)
        latest_sensor = DeviceService.get_latest_sensor_reading(db, device_id)
        is_raining = bool(latest_sensor and latest_sensor.rain_detected)

        if command_type == "open" and is_raining:
            # Perintah membuka atap diblokir oleh kebijakan keselamatan hujan
            command_id = str(uuid.uuid4())
            now = now_jakarta()

            # Catat perintah yang diblokir
            cmd_record = DeviceCommand(
                id=command_id,
                device_id=device_id,
                user_id=user.id if user else None,
                command=command_type,
                mode=device.mode,
                source="manual_web",
                status="failed",
                detail="Ditolak oleh kebijakan keselamatan: Sensor mendeteksi hujan aktif.",
                issued_at=now,
                executed_at=now,
            )
            db.add(cmd_record)

            # Catat aktivitas penolakan keselamatan
            activity = RoofActivity(
                device_id=device_id,
                event_type="command_blocked",
                source="user" if user else "system",
                cause=f"Permintaan membuka atap manual saat sensor hujan basah.",
                result="blocked_by_safety",
                created_at=now,
            )
            db.add(activity)
            db.commit()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "RAIN_SAFETY_LOCK",
                    "message": "Atap tidak dapat dibuka karena sensor lokal mendeteksi hujan aktif. Keselamatan jemuran diutamakan.",
                    "command_id": command_id
                }
            )

        # 4. Buat record DeviceCommand baru
        command_id = str(uuid.uuid4())
        now = now_jakarta()

        cmd_record = DeviceCommand(
            id=command_id,
            device_id=device_id,
            user_id=user.id if user else None,
            command=command_type,
            mode=device.mode,
            source="manual_web",
            status="pending",
            detail=f"Perintah {command_type} dikirim oleh {user.username if user else 'anonymous'}",
            issued_at=now,
        )
        db.add(cmd_record)
        db.commit()
        db.refresh(cmd_record)

        # 5. Eksekusi Perintah
        if device.is_simulation:
            # Mode Simulasi: Transisi status atap langsung disimulasikan
            new_status = "open" if command_type == "open" else "closed"
            device.roof_status = new_status
            device.updated_at = now
            device.last_heartbeat = now

            cmd_record.status = "succeeded"
            cmd_record.executed_at = now
            cmd_record.detail = f"Simulasi berhasil: Atap telah {new_status}."

            activity = RoofActivity(
                device_id=device_id,
                event_type=f"roof_{command_type}",
                source="user" if user else "simulation",
                cause=f"Perintah manual {command_type} melalui web (mode simulasi).",
                result="succeeded",
                created_at=now,
            )
            db.add(activity)
            db.commit()

            return CommandResponse(
                command_id=cmd_record.id,
                device_id=device_id,
                command=command_type,
                mode=device.mode,
                status="succeeded",
                detail=cmd_record.detail,
                issued_at=cmd_record.issued_at,
                executed_at=cmd_record.executed_at,
            )

        # Mode Perangkat Nyata (Real Device dengan MQTT)
        if mqtt_service and mqtt_service.is_connected():
            mqtt_published = mqtt_service.publish_command(device_id, command_type, command_id)
            if mqtt_published:
                cmd_record.status = "accepted"
                cmd_record.detail = f"Perintah diteruskan ke broker MQTT (atap/{device_id}/command)."
                db.commit()

                return CommandResponse(
                    command_id=cmd_record.id,
                    device_id=device_id,
                    command=command_type,
                    mode=device.mode,
                    status="accepted",
                    detail=cmd_record.detail,
                    issued_at=cmd_record.issued_at,
                    executed_at=None,
                )
            else:
                cmd_record.status = "failed"
                cmd_record.detail = "Gagal mempublikasikan pesan perintah ke broker MQTT."
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail={"code": "MQTT_PUBLISH_ERROR", "message": "Gagal mengirimkan perintah ke broker MQTT."}
                )
        else:
            cmd_record.status = "failed"
            cmd_record.detail = "Layanan MQTT tidak aktif atau broker terputus."
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "MQTT_UNAVAILABLE", "message": "Broker MQTT sedang offline atau tidak terhubung ke perangkat."}
            )

    @staticmethod
    def update_mode(
        db: Session,
        device_id: str,
        new_mode: str,  # "auto" or "manual"
        user: Optional[User] = None,
        mqtt_service=None
    ) -> ModeUpdateResponse:
        device = DeviceService.get_device(db, device_id)
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "DEVICE_NOT_FOUND", "message": f"Perangkat {device_id} tidak ditemukan."}
            )

        old_mode = device.mode
        now = now_jakarta()
        device.mode = new_mode
        device.updated_at = now

        # Catat aktivitas pergantian mode
        activity = RoofActivity(
            device_id=device_id,
            event_type="mode_change",
            source="user" if user else "system",
            cause=f"Pengguna mengubah mode operasi dari {old_mode} ke {new_mode}.",
            result="succeeded",
            created_at=now,
        )
        db.add(activity)
        db.commit()

        # Jika MQTT aktif, publikasikan update mode ke perangkat
        if mqtt_service and mqtt_service.is_connected():
            mqtt_service.publish_mode_change(device_id, new_mode)

        return ModeUpdateResponse(
            device_id=device_id,
            mode=new_mode,
            message=f"Mode operasi berhasil diubah ke {new_mode}.",
            updated_at=now,
        )
