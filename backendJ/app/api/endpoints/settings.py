from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user, get_current_admin
from app.models.user import User
from app.schemas.settings import SettingsResponse, SettingsUpdateRequest
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=SettingsResponse)
def get_system_settings(db: Session = Depends(get_db)):
    """Mengambil konfigurasi sistem, ambang early-close, dan parameter operasional."""
    return SettingsService.get_settings(db)


@router.patch("", response_model=SettingsResponse)
def update_system_settings(
    update_data: SettingsUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Memperbarui pengaturan sistem (ambang early-close, jeda stabilisasi, interval polling).
    Memerlukan autentikasi. Validasi nilai dilakukan otomatis melalui Pydantic.
    """
    return SettingsService.update_settings(db, update_data)
