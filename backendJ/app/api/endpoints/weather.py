from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.weather import (
    WeatherResponse,
    WeatherForecastDetailResponse,
    WeatherStatusResponse,
    WeatherRefreshResponse,
    BMKGRegionItem,
    NearestRegionResponse,
)
from app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Weather Forecast"])


@router.get("/regions", response_model=List[BMKGRegionItem])
def get_bmkg_popular_regions():
    """
    Mengambil daftar wilayah rekomendasi BMKG tingkat IV (ADM4)
    untuk memudahkan pengguna memilih lokasi stasiun cuaca.
    """
    return weather_service.get_popular_regions()


@router.get("/nearest", response_model=NearestRegionResponse)
def get_nearest_bmkg_region(
    lat: float = Query(..., description="Latitude GPS pengguna (contoh: -6.1754)"),
    lon: float = Query(..., description="Longitude GPS pengguna (contoh: 106.8272)")
):
    """
    Menemukan stasiun/kelurahan BMKG tingkat IV terdekat secara otomatis
    berdasarkan titik koordinat GPS pengguna menggunakan perhitungan Haversine.
    """
    return weather_service.get_nearest_region_info(lat, lon)


@router.get("/current", response_model=WeatherResponse)
async def get_current_weather(
    adm4: Optional[str] = Query(None, description="Kode wilayah tingkat IV BMKG (contoh: 35.78.07.1001 Surabaya / 35.24.22.2001 Lamongan)"),
    lat: Optional[float] = Query(None, description="Latitude GPS pengguna untuk auto-detect lokasi"),
    lon: Optional[float] = Query(None, description="Longitude GPS pengguna untuk auto-detect lokasi"),
    db: Session = Depends(get_db)
):
    """
    Mengambil data cuaca dan probabilitas hujan terkini dari BMKG.
    Bisa otomatis mendeteksi stasiun terdekat jika lat & lon diberikan.
    """
    return await weather_service.get_current_weather(
        db,
        force_refresh=False,
        adm4=adm4,
        lat=lat,
        lon=lon
    )


@router.get("/forecast", response_model=WeatherForecastDetailResponse)
async def get_weather_forecast(
    adm4: Optional[str] = Query(None, description="Kode wilayah tingkat IV BMKG (contoh: 35.78.07.1001 Surabaya / 35.24.22.2001 Lamongan)"),
    lat: Optional[float] = Query(None, description="Latitude GPS pengguna untuk auto-detect lokasi"),
    lon: Optional[float] = Query(None, description="Longitude GPS pengguna untuk auto-detect lokasi"),
    db: Session = Depends(get_db)
):
    """
    Mengambil data prakiraan cuaca detail BMKG dengan kurva suhu & presipitasi bertahap
    hingga 3 hari ke depan (19 slot waktu). Mendukung auto-input via GPS.
    """
    return await weather_service.get_weather_forecast_detail(
        db,
        adm4=adm4,
        lat=lat,
        lon=lon
    )


@router.get("/status", response_model=WeatherStatusResponse)
def get_weather_service_status(
    adm4: Optional[str] = Query(None, description="Kode wilayah tingkat IV BMKG")
):
    """
    Mengambil metadata status teknis layanan cuaca BMKG, cache expiry, dan status rate-limit.
    """
    info = weather_service.get_status_info(adm4=adm4)
    return WeatherStatusResponse(**info)


@router.post("/refresh", response_model=WeatherRefreshResponse)
async def refresh_weather_data(
    adm4: Optional[str] = Query(None, description="Kode wilayah tingkat IV BMKG"),
    lat: Optional[float] = Query(None, description="Latitude GPS pengguna"),
    lon: Optional[float] = Query(None, description="Longitude GPS pengguna"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Memicu pembaruan paksa data cuaca dari BMKG secara langsung untuk kode adm4 / koordinat terkait.
    Dibatasi oleh interval cooldown untuk mencegah rate-limit.
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
    new_weather = await weather_service.get_current_weather(
        db,
        force_refresh=True,
        adm4=adm4,
        lat=lat,
        lon=lon
    )

    return WeatherRefreshResponse(
        success=True,
        message=f"Pembaruan data cuaca ({new_weather.provider.upper()}) untuk wilayah {new_weather.location} berhasil.",
        weather=new_weather
    )
