from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class WeatherDataPoint(BaseModel):
    time: datetime
    weather_condition: Optional[str] = None
    probability_of_rain: Optional[float] = None  # 0-100%
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    precipitation: Optional[float] = None  # tp (mm)
    cloud_cover: Optional[float] = None  # tcc (%)
    wind_speed: Optional[float] = None  # ws
    wind_direction: Optional[str] = None  # wd
    weather_code: Optional[int] = None  # BMKG weather code
    icon_url: Optional[str] = None  # URL icon SVG resmi BMKG
    local_datetime: Optional[str] = None


class WeatherResponse(BaseModel):
    provider: str
    location: str
    adm4: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    subdistrict: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    probability_of_rain: Optional[float] = Field(None, description="Persentase probabilitas hujan 0-100%, atau null jika tidak tersedia")
    weather_condition: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    precipitation: Optional[float] = None  # Curah hujan mm
    cloud_cover: Optional[float] = None  # Tutupan awan %
    wind_speed: Optional[float] = None
    wind_direction: Optional[str] = None
    weather_code: Optional[int] = None
    icon_url: Optional[str] = None
    forecast_horizon_minutes: int
    forecast_at: datetime
    fetched_at: datetime
    is_stale: bool
    is_cached: bool = False
    status: str = "success"  # "success", "fallback", "stale", "unavailable"


class WeatherForecastDetailResponse(WeatherResponse):
    hourly_forecasts: List[WeatherDataPoint] = []


class BMKGRegionItem(BaseModel):
    adm4: str
    label: str
    subdistrict: str
    district: str
    city: str
    province: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class UserCoordinates(BaseModel):
    latitude: float
    longitude: float


class NearestRegionResponse(BaseModel):
    nearest_region: BMKGRegionItem
    distance_km: float
    user_coordinates: UserCoordinates


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
    adm4: Optional[str] = None


class WeatherRefreshResponse(BaseModel):
    success: bool
    message: str
    weather: Optional[WeatherResponse] = None
