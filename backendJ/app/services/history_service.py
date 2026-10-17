import math
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.core.config import settings
from app.models.activity import RoofActivity
from app.models.sensor import SensorReading
from app.models.forecast import WeatherForecast
from app.schemas.history import (
    PaginatedResponse,
    ActivityHistoryItem,
    SensorHistoryItem,
    ForecastHistoryItem,
    ForecastEvaluationResponse,
    ForecastEvaluationMetrics,
)
from app.utils.datetime import now_jakarta, to_jakarta_iso
from app.utils.csv_export import generate_csv


class HistoryService:
    @staticmethod
    def get_activities(
        db: Session,
        device_id: Optional[str] = None,
        event_type: Optional[str] = None,
        source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20
    ) -> PaginatedResponse[ActivityHistoryItem]:
        query = db.query(RoofActivity)
        if device_id:
            query = query.filter(RoofActivity.device_id == device_id)
        if event_type:
            query = query.filter(RoofActivity.event_type == event_type)
        if source:
            query = query.filter(RoofActivity.source == source)
        if start_date:
            query = query.filter(RoofActivity.created_at >= start_date)
        if end_date:
            query = query.filter(RoofActivity.created_at <= end_date)

        total = query.count()
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        items = (
            query.order_by(desc(RoofActivity.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return PaginatedResponse(
            items=[ActivityHistoryItem.model_validate(i) for i in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def get_sensors(
        db: Session,
        device_id: Optional[str] = None,
        rain_detected: Optional[bool] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20
    ) -> PaginatedResponse[SensorHistoryItem]:
        query = db.query(SensorReading)
        if device_id:
            query = query.filter(SensorReading.device_id == device_id)
        if rain_detected is not None:
            query = query.filter(SensorReading.rain_detected == rain_detected)
        if start_date:
            query = query.filter(SensorReading.recorded_at >= start_date)
        if end_date:
            query = query.filter(SensorReading.recorded_at <= end_date)

        total = query.count()
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        items = (
            query.order_by(desc(SensorReading.recorded_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return PaginatedResponse(
            items=[SensorHistoryItem.model_validate(i) for i in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def get_forecasts(
        db: Session,
        provider: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20
    ) -> PaginatedResponse[ForecastHistoryItem]:
        query = db.query(WeatherForecast)
        if provider:
            query = query.filter(WeatherForecast.provider == provider)
        if start_date:
            query = query.filter(WeatherForecast.fetched_at >= start_date)
        if end_date:
            query = query.filter(WeatherForecast.fetched_at <= end_date)

        total = query.count()
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        items = (
            query.order_by(desc(WeatherForecast.fetched_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return PaginatedResponse(
            items=[ForecastHistoryItem.model_validate(i) for i in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def evaluate_forecasts(
        db: Session,
        threshold: Optional[float] = None,
        horizon_minutes: Optional[int] = None
    ) -> ForecastEvaluationResponse:
        """
        Evaluasi Kinerja Prediksi Cuaca V2.0:
        Membandingkan prediksi cuaca di masa lalu dengan rekaman sensor hujan lokal aktual.
        Hanya mengevaluasi data prediksi yang horizon waktunya sudah terlewati secara nyata.
        """
        eval_threshold = threshold if threshold is not None else settings.EARLY_CLOSE_THRESHOLD
        eval_horizon = horizon_minutes if horizon_minutes is not None else settings.EARLY_CLOSE_HORIZON_MINUTES
        now = now_jakarta()

        # Ambil semua forecast yang horizon waktunya sudah selesai (telah terjadi di masa lalu)
        cutoff_time = now - timedelta(minutes=eval_horizon)
        past_forecasts = (
            db.query(WeatherForecast)
            .filter(WeatherForecast.forecast_at <= cutoff_time)
            .order_by(WeatherForecast.forecast_at.asc())
            .all()
        )

        if len(past_forecasts) < 5:
            return ForecastEvaluationResponse(
                status="insufficient_data",
                message="Data historis aktual belum mencukupi untuk evaluasi (minimal 5 data masa lalu yang telah terlewati masa berlakunya).",
                threshold_used=eval_threshold,
                horizon_minutes_used=eval_horizon,
                evaluated_records_count=len(past_forecasts),
                metrics=None,
                evaluation_period={"earliest": None, "latest": None}
            )

        tp = 0  # Prediksi Hujan & Aktual Hujan
        fp = 0  # Prediksi Hujan & Aktual Tidak Hujan
        tn = 0  # Prediksi Kering & Aktual Tidak Hujan
        fn = 0  # Prediksi Kering & Aktual Hujan

        for fc in past_forecasts:
            predicted_rain = (fc.probability_of_rain or 0.0) >= eval_threshold
            window_start = fc.forecast_at
            window_end = fc.forecast_at + timedelta(minutes=fc.forecast_horizon_minutes)

            # Cek apakah sensor lokal mendeteksi hujan pada jendela waktu tersebut
            rain_count = (
                db.query(func.count(SensorReading.id))
                .filter(
                    SensorReading.recorded_at >= window_start,
                    SensorReading.recorded_at <= window_end,
                    SensorReading.rain_detected == True
                )
                .scalar()
            ) or 0

            actual_rain = rain_count > 0

            if predicted_rain and actual_rain:
                tp += 1
            elif predicted_rain and not actual_rain:
                fp += 1
            elif not predicted_rain and not actual_rain:
                tn += 1
            elif not predicted_rain and actual_rain:
                fn += 1

        total = tp + fp + tn + fn
        accuracy = round((tp + tn) / total, 4) if total > 0 else 0.0
        precision = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0
        recall = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0
        f1_score = round(2 * (precision * recall) / (precision + recall), 4) if (precision + recall) > 0 else 0.0

        metrics = ForecastEvaluationMetrics(
            total_evaluated=total,
            true_positives=tp,
            false_positives=fp,
            true_negatives=tn,
            false_negatives=fn,
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            f1_score=f1_score
        )

        return ForecastEvaluationResponse(
            status="evaluated",
            message="Evaluasi prediksi cuaca terhadap kejadian sensor fisik lokal berhasil dihitung.",
            threshold_used=eval_threshold,
            horizon_minutes_used=eval_horizon,
            evaluated_records_count=total,
            metrics=metrics,
            evaluation_period={
                "earliest": past_forecasts[0].forecast_at if past_forecasts else None,
                "latest": past_forecasts[-1].forecast_at if past_forecasts else None,
            }
        )

    @staticmethod
    def export_activities_csv(db: Session, device_id: Optional[str] = None) -> str:
        query = db.query(RoofActivity)
        if device_id:
            query = query.filter(RoofActivity.device_id == device_id)
        activities = query.order_by(desc(RoofActivity.created_at)).all()

        headers = ["ID", "Device ID", "Event Type", "Source", "Cause", "Result", "Timestamp (WIB)"]
        rows = [
            [
                a.id,
                a.device_id,
                a.event_type,
                a.source,
                a.cause,
                a.result,
                to_jakarta_iso(a.created_at)
            ]
            for a in activities
        ]
        return generate_csv(headers, rows)

    @staticmethod
    def export_sensors_csv(db: Session, device_id: Optional[str] = None) -> str:
        query = db.query(SensorReading)
        if device_id:
            query = query.filter(SensorReading.device_id == device_id)
        readings = query.order_by(desc(SensorReading.recorded_at)).all()

        headers = ["ID", "Device ID", "Rain Detected", "Rain Status", "Rain Analog Value", "Light Status", "Light Lux", "Temperature", "Humidity", "Recorded At (WIB)"]
        rows = [
            [
                r.id,
                r.device_id,
                r.rain_detected,
                r.rain_status,
                r.rain_analog_value,
                r.light_status,
                r.light_lux,
                r.temperature,
                r.humidity,
                to_jakarta_iso(r.recorded_at)
            ]
            for r in readings
        ]
        return generate_csv(headers, rows)
