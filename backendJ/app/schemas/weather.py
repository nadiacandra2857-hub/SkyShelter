from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class WeatherDataPoint(BaseModel):
    time: datetime
    weather_condition: Optional[str] = None
    probability_of_rain: Optional[float] = None  # None jika provider tidak menyediakan
    temperature: Optional[float] = None
    humidity: Optional[float] = None


class WeatherResponse(BaseModel):
    provider: str
    location: str
    probability_of_rain: Optional[float] = Field(None, description="Persentase probabilitas hujan 0-100%, atau null jika tidak tersedia")
    weather_condition: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    forecast_horizon_minutes: int
    forecast_at: datetime
    fetched_at: datetime
    is_stale: bool
    is_cached: bool = False
    status: str = "success"  # "success", "fallback", "stale", "unavailable"


class WeatherForecastDetailResponse(WeatherResponse):
    hourly_forecasts: List[WeatherDataPoint] = []


class WeatherStatusResponse(BaseModel):
    provider: str
    configured_provider: str
    is_available: bool
    last_successful_fetch: Optional[datetime] = None
    cache_expires_at: Optional[datetime] = None
    is_stale: bool
    refresh_cooldown_remaining_seconds: int = 0
    poll_interval_minutes: int
    location: str


class WeatherRefreshResponse(BaseModel):
    success: bool
    message: str
    weather: Optional[WeatherResponse] = None
