from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Index
from app.db.session import Base
from app.utils.datetime import now_jakarta


class WeatherForecast(Base):
    __tablename__ = "weather_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False, index=True)  # "bmkg" or "openweathermap"
    location = Column(String(100), nullable=False, default="DKI Jakarta")
    
    probability_of_rain = Column(Float, nullable=False)  # 0 to 100 (%)
    forecast_horizon_minutes = Column(Integer, nullable=False, default=60)
    
    # Waktu prediksi ini berlaku
    forecast_at = Column(DateTime(timezone=True), nullable=False, index=True)
    # Waktu data diambil dari provider
    fetched_at = Column(DateTime(timezone=True), default=now_jakarta, nullable=False, index=True)
    
    weather_condition = Column(String(100), nullable=True)  # "Hujan Ringan", "Cerah Berawan", etc.
    temperature = Column(Float, nullable=True)  # Celcius
    humidity = Column(Float, nullable=True)  # %
    
    is_stale = Column(Boolean, default=False, nullable=False)
    status = Column(String(20), default="success", nullable=False)  # "success", "cached", "fallback", "stale"
    raw_payload = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_forecast_time", "forecast_at", "fetched_at"),
    )
