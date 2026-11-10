from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class DeviceBase(BaseModel):
    id: str
    name: str
    device_type: str = "roof"
    is_simulation: bool = False
    roof_status: str = Field(..., description="open, closed, opening, closing, unknown")
    mode: str = Field(..., description="auto, manual")


class DeviceStatusResponse(BaseModel):
    device_id: str
    roof_status: str  # "open", "closed", "opening", "closing", "unknown"
    mode: str  # "auto", "manual"
    rain_sensor: str  # "dry", "rain_detected", "unknown"
    rain_detected: bool
    light_status: Optional[str] = None  # "bright", "dark", "unknown"
    light_lux: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    connection_status: str  # "online", "offline", "unknown"
    is_simulation: bool
    last_updated: Optional[datetime] = None


class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    device_type: str
    is_simulation: bool
    roof_status: str
    mode: str
    connection_status: str
    last_heartbeat: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class TelemetryPayload(BaseModel):
    rain_detected: bool = Field(..., description="Status sensor hujan (true jika mendeteksi air/presipitasi)")
    rain_analog_value: Optional[float] = Field(None, description="Nilai ADC analog sensor (0-1023)")
    light_lux: Optional[float] = Field(None, description="Intensitas cahaya lux LDR")
    temperature: Optional[float] = Field(None, description="Suhu lingkungan Celcius")
    humidity: Optional[float] = Field(None, description="Kelembapan relatif persen")

