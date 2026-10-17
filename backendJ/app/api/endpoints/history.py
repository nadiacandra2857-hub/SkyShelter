from datetime import datetime
from typing import Optional, Literal
from fastapi import APIRouter, Depends, Query, Response, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.history import (
    PaginatedResponse,
    ActivityHistoryItem,
    SensorHistoryItem,
    ForecastHistoryItem,
    ForecastEvaluationResponse,
)
from app.services.history_service import HistoryService

router = APIRouter(prefix="/history", tags=["History & Evaluation"])


@router.get("/activities", response_model=PaginatedResponse[ActivityHistoryItem])
def get_activity_history(
    device_id: Optional[str] = Query(None, description="Filter ID Perangkat"),
    event_type: Optional[str] = Query(None, description="Filter jenis kejadian (e.g., roof_open, roof_close)"),
    source: Optional[str] = Query(None, description="Filter sumber (user, rain_sensor, early_close_forecast)"),
    start_date: Optional[datetime] = Query(None, description="Format ISO 8601 batas awal"),
    end_date: Optional[datetime] = Query(None, description="Format ISO 8601 batas akhir"),
    page: int = Query(1, ge=1, description="Nomor halaman"),
    page_size: int = Query(20, ge=1, le=100, description="Jumlah data per halaman"),
    db: Session = Depends(get_db)
):
    """Mengambil riwayat aktivitas dan pergerakan atap jemuran dengan filter dan paginasi."""
    return HistoryService.get_activities(
        db=db,
        device_id=device_id,
        event_type=event_type,
        source=source,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size
    )


@router.get("/sensors", response_model=PaginatedResponse[SensorHistoryItem])
def get_sensor_history(
    device_id: Optional[str] = Query(None, description="Filter ID Perangkat"),
    rain_detected: Optional[bool] = Query(None, description="Filter kondisi hujan (true/false)"),
    start_date: Optional[datetime] = Query(None, description="Format ISO 8601 batas awal"),
    end_date: Optional[datetime] = Query(None, description="Format ISO 8601 batas akhir"),
    page: int = Query(1, ge=1, description="Nomor halaman"),
    page_size: int = Query(20, ge=1, le=100, description="Jumlah data per halaman"),
    db: Session = Depends(get_db)
):
    """Mengambil riwayat telemetri log sensor fisik (hujan, cahaya LDR, dll)."""
    return HistoryService.get_sensors(
        db=db,
        device_id=device_id,
        rain_detected=rain_detected,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size
    )


@router.get("/forecasts", response_model=PaginatedResponse[ForecastHistoryItem])
def get_forecast_history(
    provider: Optional[str] = Query(None, description="Filter penyedia (bmkg, openweathermap)"),
    start_date: Optional[datetime] = Query(None, description="Batas awal tanggal"),
    end_date: Optional[datetime] = Query(None, description="Batas akhir tanggal"),
    page: int = Query(1, ge=1, description="Nomor halaman"),
    page_size: int = Query(20, ge=1, le=100, description="Jumlah data per halaman"),
    db: Session = Depends(get_db)
):
    """Mengambil riwayat rekaman prediksi cuaca eksternal yang tersimpan di database."""
    return HistoryService.get_forecasts(
        db=db,
        provider=provider,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size
    )


@router.get("/evaluation", response_model=ForecastEvaluationResponse)
def evaluate_forecast_performance(
    threshold: Optional[float] = Query(None, ge=0.0, le=100.0, description="Override ambang early-close"),
    horizon_minutes: Optional[int] = Query(None, ge=10, le=360, description="Override horizon waktu"),
    db: Session = Depends(get_db)
):
    """
    Evaluasi Kinerja Prediksi Cuaca V2.0:
    Membandingkan prediksi hujan di masa lalu dengan rekaman sensor hujan lokal aktual.
    Menghitung akurasi, presisi, recall, dan F1-score jika data mencukupi.
    """
    return HistoryService.evaluate_forecasts(
        db=db,
        threshold=threshold,
        horizon_minutes=horizon_minutes
    )


@router.get("/export")
def export_history_to_csv(
    data_type: Literal["activities", "sensors"] = Query("activities", description="Tipe data yang diekspor"),
    device_id: Optional[str] = Query(None, description="ID Perangkat"),
    db: Session = Depends(get_db)
):
    """
    Mengekspor data riwayat ke file CSV yang dapat langsung diunduh oleh browser frontend.
    """
    if data_type == "activities":
        csv_content = HistoryService.export_activities_csv(db, device_id=device_id)
        filename = f"roof_activities_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    else:
        csv_content = HistoryService.export_sensors_csv(db, device_id=device_id)
        filename = f"sensor_readings_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
