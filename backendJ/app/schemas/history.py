from typing import Optional, List, Generic, TypeVar, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class ActivityHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    device_id: str
    event_type: str
    source: str
    cause: str
    result: str
    created_at: datetime


class SensorHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    device_id: str
    rain_detected: bool
    rain_status: str
    rain_analog_value: Optional[float] = None
    light_status: Optional[str] = None
    light_lux: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    recorded_at: datetime


class ForecastHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    provider: str
    location: str
    probability_of_rain: Optional[float] = None
    forecast_horizon_minutes: int
    weather_condition: Optional[str] = None
    temperature: Optional[float] = None
    forecast_at: datetime
    fetched_at: datetime
    is_stale: bool
    status: str


class ForecastEvaluationMetrics(BaseModel):
    total_evaluated: int
    true_positives: int
    false_positives: int
    true_negatives: int
    false_negatives: int
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None


class ForecastEvaluationResponse(BaseModel):
    status: str  # "evaluated", "insufficient_data"
    message: str
    threshold_used: float
    horizon_minutes_used: int
    evaluated_records_count: int
    metrics: Optional[ForecastEvaluationMetrics] = None
    evaluation_period: Optional[Dict[str, Optional[datetime]]] = None
