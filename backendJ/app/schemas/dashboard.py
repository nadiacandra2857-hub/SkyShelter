from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.weather import WeatherResponse


class ActivitySummaryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    source: str
    cause: str
    result: str
    created_at: datetime


class DashboardStatusResponse(BaseModel):
    device_id: str
    roof_status: str = Field(..., description="open, closed, opening, closing, unknown")
    mode: str = Field(..., description="auto, manual")
    rain_sensor: str = Field(..., description="dry, rain_detected, unknown")
    rain_detected: bool
    light_status: Optional[str] = None  # bright, dark, unknown
    light_lux: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    connection_status: str = Field(..., description="online, offline, unknown")
    decision: str = Field(..., description="normal, standby, early_close, rain_detected, unavailable")
    decision_reason: str
    early_close_recommended: bool
    last_updated: Optional[datetime] = None


class DashboardSummaryResponse(DashboardStatusResponse):
    is_simulation: bool
    weather_summary: Optional[WeatherResponse] = None
    recent_activities: List[ActivitySummaryItem] = []
