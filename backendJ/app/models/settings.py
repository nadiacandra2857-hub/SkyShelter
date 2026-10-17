from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.db.session import Base
from app.utils.datetime import now_jakarta


class AppSettingsModel(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, default=1)
    
    # Ambang batas Early-Close (misal 80%)
    early_close_threshold = Column(Float, default=80.0, nullable=False)
    # Horizon prediksi (misal 60 menit)
    forecast_horizon_minutes = Column(Integer, default=60, nullable=False)
    # Jeda stabilisasi pembukaan atap (detik, misal 30 detik setelah hujan reda sebelum boleh buka)
    roof_stabilization_delay_seconds = Column(Integer, default=30, nullable=False)
    # Interval polling cuaca (menit)
    weather_poll_interval_minutes = Column(Integer, default=15, nullable=False)
    # Lokasi instalasi
    installation_location = Column(String(100), default="DKI Jakarta", nullable=False)
    # Status fitur prediksi aktif/tidak
    forecast_feature_enabled = Column(Boolean, default=True, nullable=False)
    
    updated_at = Column(DateTime(timezone=True), default=now_jakarta, onupdate=now_jakarta, nullable=False)
