from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.services.device_service import DeviceService
from app.schemas.device import DeviceResponse, DeviceStatusResponse, TelemetryPayload

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.get("", response_model=List[DeviceResponse])
def list_devices(db: Session = Depends(get_db)):
    """Mengambil daftar seluruh perangkat atap jemuran yang terdaftar."""
    # Pastikan minimal ada perangkat default
    DeviceService.get_or_create_default_device(db)
    return DeviceService.list_devices(db)


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device_detail(device_id: str, db: Session = Depends(get_db)):
    """Mengambil informasi detail spesifik perangkat berdasarkan ID."""
    device = DeviceService.get_device(db, device_id)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "DEVICE_NOT_FOUND", "message": f"Perangkat dengan ID '{device_id}' tidak ditemukan."}
        )

    conn_status = DeviceService.determine_connection_status(device)
    return DeviceResponse(
        id=device.id,
        name=device.name,
        device_type=device.device_type,
        is_simulation=device.is_simulation,
        roof_status=device.roof_status,
        mode=device.mode,
        connection_status=conn_status,
        last_heartbeat=device.last_heartbeat,
        created_at=device.created_at,
        updated_at=device.updated_at,
    )


@router.get("/{device_id}/status", response_model=DeviceStatusResponse)
def get_device_status(device_id: str, db: Session = Depends(get_db)):
    """Mengambil status operasional terkini dan telemetri sensor terakhir perangkat."""
    status_resp = DeviceService.get_device_status(db, device_id)
    if not status_resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "DEVICE_NOT_FOUND", "message": f"Perangkat dengan ID '{device_id}' tidak ditemukan."}
        )
    return status_resp


@router.post("/{device_id}/telemetry", response_model=DeviceStatusResponse)
def post_device_telemetry(
    device_id: str,
    payload: TelemetryPayload,
    db: Session = Depends(get_db)
):
    """
    Menerima rekaman data telemetri sensor (hujan, LDR, suhu, kelembapan) via HTTP REST.
    Dapat digunakan oleh firmware ESP8266 HTTP client maupun pengujian simulator frontend.
    Jika mode 'auto' aktif dan terdeteksi hujan, atap otomatis ditutup oleh Safety Lock.
    """
    DeviceService.record_sensor_telemetry(
        db=db,
        device_id=device_id,
        rain_detected=payload.rain_detected,
        rain_analog_value=payload.rain_analog_value,
        light_lux=payload.light_lux,
        temperature=payload.temperature,
        humidity=payload.humidity,
    )
    status_resp = DeviceService.get_device_status(db, device_id)
    if not status_resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "DEVICE_NOT_FOUND", "message": f"Perangkat '{device_id}' tidak ditemukan."}
        )
    return status_resp

