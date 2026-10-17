from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class SettingsResponse(BaseModel):
    # Pengaturan logika atap & prediksi cuaca
    early_close_threshold: float = Field(..., ge=0.0, le=100.0, description="Ambang probabilitas hujan early-close (%)")
    forecast_horizon_minutes: int = Field(..., ge=10, le=360, description="Horizon waktu prediksi (menit)")
    roof_stabilization_delay_seconds: int = Field(..., ge=5, le=600, description="Jeda stabilisasi sebelum atap boleh dibuka kembali setelah hujan reda (detik)")
    weather_poll_interval_minutes: int = Field(..., ge=1, le=120, description="Interval polling API cuaca eksternal (menit)")
    installation_location: str = Field(..., description="Lokasi geografis perangkat/instalasi")
    forecast_feature_enabled: bool = Field(..., description="Status pengaktifan fitur prediksi cuaca V2.0")
    
    # Keterangan perbedaan scope pengaturan
    device_synced_fields: list[str] = ["roof_stabilization_delay_seconds"]
    backend_logic_fields: list[str] = ["early_close_threshold", "forecast_horizon_minutes", "weather_poll_interval_minutes", "forecast_feature_enabled", "installation_location"]
    
    updated_at: datetime


class SettingsUpdateRequest(BaseModel):
    early_close_threshold: Optional[float] = Field(None, ge=0.0, le=100.0, description="Ambang probabilitas hujan early-close (%)")
    forecast_horizon_minutes: Optional[int] = Field(None, ge=10, le=360, description="Horizon waktu prediksi (menit)")
    roof_stabilization_delay_seconds: Optional[int] = Field(None, ge=5, le=600, description="Jeda stabilisasi setelah hujan reda (detik)")
    weather_poll_interval_minutes: Optional[int] = Field(None, ge=1, le=120, description="Interval polling cuaca (menit)")
    installation_location: Optional[str] = Field(None, min_length=2, max_length=100, description="Lokasi instalasi")
    forecast_feature_enabled: Optional[bool] = Field(None, description="Aktifkan/nonaktifkan fitur prediksi V2.0")
