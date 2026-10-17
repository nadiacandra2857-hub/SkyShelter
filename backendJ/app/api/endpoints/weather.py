from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.weather import (
    WeatherResponse,
    WeatherForecastDetailResponse,
    WeatherStatusResponse,
    WeatherRefreshResponse,
)
from app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Weather Forecast"])


@router.get("/current", response_model=WeatherResponse)
async def get_current_weather(db: Session = Depends(get_db)):
    """
    Mengambil data cuaca dan probabilitas hujan terkini.
    Menggunakan caching otomatis (10-15 menit) untuk meminimalkan beban ke API eksternal BMKG/OpenWeatherMap.
    """
    return await weather_service.get_current_weather(db, force_refresh=False)


@router.get("/forecast", response_model=WeatherForecastDetailResponse)
async def get_weather_forecast(db: Session = Depends(get_db)):
    """
    Mengambil data prakiraan cuaca detail untuk horizon waktu yang dikonfigurasi.
    """
    base_weather = await weather_service.get_current_weather(db, force_refresh=False)
    # Detail response memperluas WeatherResponse dengan data time-series
    return WeatherForecastDetailResponse(
        provider=base_weather.provider,
        location=base_weather.location,
        probability_of_rain=base_weather.probability_of_rain,
        weather_condition=base_weather.weather_condition,
        temperature=base_weather.temperature,
        humidity=base_weather.humidity,
        forecast_horizon_minutes=base_weather.forecast_horizon_minutes,
        forecast_at=base_weather.forecast_at,
        fetched_at=base_weather.fetched_at,
        is_stale=base_weather.is_stale,
        is_cached=base_weather.is_cached,
        status=base_weather.status,
        hourly_forecasts=[]
    )


@router.get("/status", response_model=WeatherStatusResponse)
def get_weather_service_status():
    """
    Mengambil metadata status teknis layanan cuaca, cache expiry, dan status rate-limit.
    """
    info = weather_service.get_status_info()
    return WeatherStatusResponse(**info)


@router.post("/refresh", response_model=WeatherRefreshResponse)
async def refresh_weather_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Memicu pembaruan paksa data cuaca dari penyedia eksternal secara manual.
    Dibatasi oleh interval cooldown untuk mencegah spam atau rate-limit dari provider.
    """
    can_refresh, remaining_sec = weather_service.check_refresh_rate_limit()
    if not can_refresh:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "REFRESH_RATE_LIMIT",
                "message": f"Terlalu sering merefresh. Silakan tunggu {remaining_sec} detik lagi.",
                "retry_after_seconds": remaining_sec
            }
        )

    weather_service.record_refresh_request()
    new_weather = await weather_service.get_current_weather(db, force_refresh=True)

    return WeatherRefreshResponse(
        success=True,
        message="Pembaruan data cuaca berhasil dilakukan.",
        weather=new_weather
    )
