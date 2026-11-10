from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.dependencies import get_db
from app.services.device_service import DeviceService
from app.services.weather_service import weather_service
from app.services.decision_service import DecisionService
from app.services.settings_service import SettingsService
from app.models.activity import RoofActivity
from app.schemas.dashboard import DashboardSummaryResponse, DashboardStatusResponse, ActivitySummaryItem
from sqlalchemy import desc

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/status", response_model=DashboardStatusResponse)
async def get_dashboard_status(
    device_id: Optional[str] = Query(None, description="ID Perangkat (default roof-001)"),
    adm4: Optional[str] = Query(None, description="Kode Wilayah ADM4 BMKG"),
    lat: Optional[float] = Query(None, description="Latitude GPS"),
    lon: Optional[float] = Query(None, description="Longitude GPS"),
    db: Session = Depends(get_db)
):
    """
    Mengambil status singkat atap, sensor lokal, koneksi, dan status keputusan V2.0.
    Cocok untuk polling cepat status indikator di frontend React.
    """
    device = DeviceService.get_or_create_default_device(db, device_id)
    dev_status = DeviceService.get_device_status(db, device.id)
    app_settings = SettingsService.get_or_create_settings(db)

    # Ambil data cuaca dari cache untuk lokasi yang aktif
    weather = await weather_service.get_current_weather(
        db,
        adm4=adm4,
        lat=lat,
        lon=lon,
        force_refresh=False
    )
    weather_available = weather.status in ["success", "fallback", "stale"]

    # Evaluasi logika keputusan V2.0
    decision_res = DecisionService.evaluate(
        rain_detected=dev_status.rain_detected,
        probability_of_rain=weather.probability_of_rain,
        weather_available=weather_available,
        threshold=app_settings.early_close_threshold,
        forecast_feature_enabled=app_settings.forecast_feature_enabled
    )

    return DashboardStatusResponse(
        device_id=device.id,
        roof_status=dev_status.roof_status,
        mode=dev_status.mode,
        rain_sensor=dev_status.rain_sensor,
        rain_detected=dev_status.rain_detected,
        light_status=dev_status.light_status,
        light_lux=dev_status.light_lux,
        temperature=dev_status.temperature,
        humidity=dev_status.humidity,
        connection_status=dev_status.connection_status,
        decision=decision_res.decision,
        decision_reason=decision_res.reason,
        early_close_recommended=decision_res.early_close_recommended,
        last_updated=dev_status.last_updated,
    )


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    device_id: Optional[str] = Query(None, description="ID Perangkat (default roof-001)"),
    adm4: Optional[str] = Query(None, description="Kode Wilayah ADM4 BMKG"),
    lat: Optional[float] = Query(None, description="Latitude GPS"),
    lon: Optional[float] = Query(None, description="Longitude GPS"),
    db: Session = Depends(get_db)
):
    """
    Mengambil ringkasan lengkap untuk Dashboard React:
    - Status atap & sensor fisik
    - Status koneksi perangkat (online/offline berdasarkan heartbeat)
    - Rekomendasi keputusan sistem cuaca V2.0
    - Ringkasan data prakiraan cuaca (BMKG/OpenWeatherMap)
    - 5 riwayat aktivitas terbaru
    """
    device = DeviceService.get_or_create_default_device(db, device_id)
    dev_status = DeviceService.get_device_status(db, device.id)
    app_settings = SettingsService.get_or_create_settings(db)

    # Dapatkan status cuaca untuk lokasi aktif
    weather = await weather_service.get_current_weather(
        db,
        adm4=adm4,
        lat=lat,
        lon=lon,
        force_refresh=False
    )
    weather_available = weather.status in ["success", "fallback", "stale"]

    # Evaluasi keputusan
    decision_res = DecisionService.evaluate(
        rain_detected=dev_status.rain_detected,
        probability_of_rain=weather.probability_of_rain,
        weather_available=weather_available,
        threshold=app_settings.early_close_threshold,
        forecast_feature_enabled=app_settings.forecast_feature_enabled
    )

    # Ambil 5 riwayat aktivitas terbaru
    activities = (
        db.query(RoofActivity)
        .filter(RoofActivity.device_id == device.id)
        .order_by(desc(RoofActivity.created_at))
        .limit(5)
        .all()
    )
    activity_items = [ActivitySummaryItem.model_validate(a) for a in activities]

    return DashboardSummaryResponse(
        device_id=device.id,
        is_simulation=device.is_simulation,
        roof_status=dev_status.roof_status,
        mode=dev_status.mode,
        rain_sensor=dev_status.rain_sensor,
        rain_detected=dev_status.rain_detected,
        light_status=dev_status.light_status,
        light_lux=dev_status.light_lux,
        temperature=dev_status.temperature,
        humidity=dev_status.humidity,
        connection_status=dev_status.connection_status,
        decision=decision_res.decision,
        decision_reason=decision_res.reason,
        early_close_recommended=decision_res.early_close_recommended,
        last_updated=dev_status.last_updated,
        weather_summary=weather,
        recent_activities=activity_items,
    )
