import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.config import settings
from app.models.device import Device
from app.models.sensor import SensorReading
from app.models.activity import RoofActivity
from app.schemas.device import DeviceResponse, DeviceStatusResponse
from app.utils.datetime import now_jakarta

logger = logging.getLogger("device_service")


class DeviceService:
    @staticmethod
    def get_or_create_default_device(db: Session, device_id: Optional[str] = None) -> Device:
        """Mengambil perangkat default (misal roof-001) atau membuatnya jika belum ada."""
        dev_id = device_id or settings.DEFAULT_DEVICE_ID
        device = db.query(Device).filter(Device.id == dev_id).first()
        if not device:
            is_sim = settings.DEVICE_MODE == "simulation"
            device = Device(
                id=dev_id,
                name="Atap Jemuran Utama",
                device_type="roof",
                is_simulation=is_sim,
                roof_status="closed",
                mode="auto",
                last_heartbeat=now_jakarta() if is_sim else None,
            )
            db.add(device)
            db.commit()
            db.refresh(device)
        return device

    @staticmethod
    def determine_connection_status(device: Optional[Device]) -> str:
        """
        Menentukan status koneksi perangkat berdasarkan batas waktu heartbeat terakhir.
        Bukan hanya karena broker MQTT hidup, tetapi perangkat harus benar-benar mengirim sinyal.
        """
        if not device or not device.last_heartbeat:
            return "offline"

        now = now_jakarta()
        heartbeat = device.last_heartbeat
        if heartbeat.tzinfo is None:
            heartbeat = heartbeat.replace(tzinfo=now.tzinfo)

        elapsed_seconds = (now - heartbeat).total_seconds()
        if elapsed_seconds <= settings.DEVICE_OFFLINE_TIMEOUT_SECONDS:
            return "online"
        return "offline"

    @staticmethod
    def get_device(db: Session, device_id: str) -> Optional[Device]:
        return db.query(Device).filter(Device.id == device_id).first()

    @staticmethod
    def list_devices(db: Session) -> List[DeviceResponse]:
        devices = db.query(Device).all()
        result = []
        for d in devices:
            conn_status = DeviceService.determine_connection_status(d)
            resp = DeviceResponse(
                id=d.id,
                name=d.name,
                device_type=d.device_type,
                is_simulation=d.is_simulation,
                roof_status=d.roof_status,
                mode=d.mode,
                connection_status=conn_status,
                last_heartbeat=d.last_heartbeat,
                created_at=d.created_at,
                updated_at=d.updated_at,
            )
            result.append(resp)
        return result

    @staticmethod
    def get_latest_sensor_reading(db: Session, device_id: str) -> Optional[SensorReading]:
        return (
            db.query(SensorReading)
            .filter(SensorReading.device_id == device_id)
            .order_by(desc(SensorReading.recorded_at))
            .first()
        )

    @staticmethod
    def record_sensor_telemetry(
        db: Session,
        device_id: str,
        rain_detected: bool,
        rain_analog_value: Optional[float] = None,
        light_lux: Optional[float] = None,
        temperature: Optional[float] = None,
        humidity: Optional[float] = None,
        recorded_at: Optional[datetime] = None
    ) -> SensorReading:
        """Menyimpan data telemetri sensor baru ke database dan memperbarui heartbeat perangkat."""
        device = DeviceService.get_device(db, device_id)
        if not device:
            device = DeviceService.get_or_create_default_device(db, device_id)

        now = recorded_at or now_jakarta()
        device.last_heartbeat = now
        device.updated_at = now

        # Status string sensor hujan
        rain_status = "rain_detected" if rain_detected else "dry"

        # Status string sensor cahaya
        light_status = "bright"
        if light_lux is not None:
            light_status = "dark" if light_lux < 100 else "bright"

        reading = SensorReading(
            device_id=device_id,
            rain_detected=rain_detected,
            rain_status=rain_status,
            rain_analog_value=rain_analog_value,
            light_status=light_status,
            light_lux=light_lux,
            temperature=temperature,
            humidity=humidity,
            recorded_at=now,
        )
        db.add(reading)

        # Otomasi Keamanan: Jika mode 'auto' dan sensor mendeteksi hujan aktif, tutup kanopi atap
        if rain_detected and device.mode == "auto" and device.roof_status != "closed":
            device.roof_status = "closed"
            activity = RoofActivity(
                device_id=device_id,
                event_type="rain_event",
                source="local_sensor",
                cause=f"Sensor hujan fisik mendeteksi presipitasi aktif (ADC: {rain_analog_value or 310}).",
                result="Atap otomatis ditutup oleh sistem demi melindungi jemuran pakaian.",
                created_at=now,
            )
            db.add(activity)

        db.commit()
        db.refresh(reading)
        return reading

    @staticmethod
    def update_heartbeat(db: Session, device_id: str, roof_status: Optional[str] = None, mode: Optional[str] = None):
        device = DeviceService.get_device(db, device_id)
        if not device:
            device = DeviceService.get_or_create_default_device(db, device_id)

        now = now_jakarta()
        device.last_heartbeat = now
        if roof_status and roof_status in ["open", "closed", "opening", "closing", "unknown"]:
            device.roof_status = roof_status
        if mode and mode in ["auto", "manual"]:
            device.mode = mode
        device.updated_at = now
        db.commit()

    @staticmethod
    def get_device_status(db: Session, device_id: str) -> Optional[DeviceStatusResponse]:
        device = DeviceService.get_device(db, device_id)
        if not device:
            return None

        conn_status = DeviceService.determine_connection_status(device)
        latest_sensor = DeviceService.get_latest_sensor_reading(db, device_id)

        if latest_sensor:
            rain_detected = latest_sensor.rain_detected
            rain_status = latest_sensor.rain_status
        else:
            rain_detected = False
            rain_status = "unknown"
        light_status = latest_sensor.light_status if latest_sensor else "unknown"
        light_lux = latest_sensor.light_lux if latest_sensor else None
        temperature = latest_sensor.temperature if latest_sensor else None
        humidity = latest_sensor.humidity if latest_sensor else None
        last_updated = latest_sensor.recorded_at if latest_sensor else device.updated_at

        return DeviceStatusResponse(
            device_id=device.id,
            roof_status=device.roof_status,
            mode=device.mode,
            rain_sensor=rain_status,
            rain_detected=rain_detected,
            light_status=light_status,
            light_lux=light_lux,
            temperature=temperature,
            humidity=humidity,
            connection_status=conn_status,
            is_simulation=device.is_simulation,
            last_updated=last_updated,
        )
