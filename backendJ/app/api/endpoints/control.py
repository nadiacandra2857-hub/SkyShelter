from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.mqtt.client import mqtt_service
from app.schemas.command import CommandRequest, CommandResponse, ModeUpdateRequest, ModeUpdateResponse
from app.services.control_service import ControlService

router = APIRouter(prefix="/devices", tags=["Roof Control"])


@router.post("/{device_id}/commands", response_model=CommandResponse, status_code=status.HTTP_200_OK)
def send_roof_command(
    device_id: str,
    request: CommandRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mengirimkan perintah fisik kendali atap ('open' atau 'close').
    - Memvalidasi hak akses pengguna & status koneksi perangkat.
    - Menolak perintah 'open' jika sensor hujan lokal aktif mendeteksi air/hujan.
    - Menerbitkan perintah melalui MQTT jika real device aktif, atau mensimulasikannya jika mode simulasi.
    """
    return ControlService.execute_command(
        db=db,
        device_id=device_id,
        command_type=request.command,
        user=current_user,
        mqtt_service=mqtt_service
    )


@router.patch("/{device_id}/mode", response_model=ModeUpdateResponse, status_code=status.HTTP_200_OK)
def update_operation_mode(
    device_id: str,
    request: ModeUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mengubah mode operasi perangkat ('auto' atau 'manual').
    """
    return ControlService.update_mode(
        db=db,
        device_id=device_id,
        new_mode=request.mode,
        user=current_user,
        mqtt_service=mqtt_service
    )
