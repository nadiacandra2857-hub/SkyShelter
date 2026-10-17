from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.settings import AppSettingsModel
from app.schemas.settings import SettingsResponse, SettingsUpdateRequest
from app.utils.datetime import now_jakarta


class SettingsService:
    @staticmethod
    def get_or_create_settings(db: Session) -> AppSettingsModel:
        app_settings = db.query(AppSettingsModel).filter(AppSettingsModel.id == 1).first()
        if not app_settings:
            app_settings = AppSettingsModel(
                id=1,
                early_close_threshold=settings.EARLY_CLOSE_THRESHOLD,
                forecast_horizon_minutes=settings.EARLY_CLOSE_HORIZON_MINUTES,
                roof_stabilization_delay_seconds=30,
                weather_poll_interval_minutes=settings.WEATHER_POLL_INTERVAL_MINUTES,
                installation_location=settings.WEATHER_LOCATION,
                forecast_feature_enabled=True,
                updated_at=now_jakarta()
            )
            db.add(app_settings)
            db.commit()
            db.refresh(app_settings)
        return app_settings

    @staticmethod
    def get_settings(db: Session) -> SettingsResponse:
        s = SettingsService.get_or_create_settings(db)
        return SettingsResponse(
            early_close_threshold=s.early_close_threshold,
            forecast_horizon_minutes=s.forecast_horizon_minutes,
            roof_stabilization_delay_seconds=s.roof_stabilization_delay_seconds,
            weather_poll_interval_minutes=s.weather_poll_interval_minutes,
            installation_location=s.installation_location,
            forecast_feature_enabled=s.forecast_feature_enabled,
            updated_at=s.updated_at
        )

    @staticmethod
    def update_settings(db: Session, update_data: SettingsUpdateRequest) -> SettingsResponse:
        s = SettingsService.get_or_create_settings(db)
        data = update_data.model_dump(exclude_unset=True)

        for key, value in data.items():
            if hasattr(s, key) and value is not None:
                setattr(s, key, value)

        s.updated_at = now_jakarta()
        db.commit()
        db.refresh(s)

        return SettingsResponse(
            early_close_threshold=s.early_close_threshold,
            forecast_horizon_minutes=s.forecast_horizon_minutes,
            roof_stabilization_delay_seconds=s.roof_stabilization_delay_seconds,
            weather_poll_interval_minutes=s.weather_poll_interval_minutes,
            installation_location=s.installation_location,
            forecast_feature_enabled=s.forecast_feature_enabled,
            updated_at=s.updated_at
        )
