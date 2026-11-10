import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    # --- Application Settings ---
    APP_NAME: str = "Weather-Responsive Roofing System V2.0"
    APP_ENV: str = "development"
    APP_HOST: str = "127.0.0.1"
    APP_PORT: int = 8000
    DEBUG: bool = True

    # --- Database ---
    DATABASE_URL: str = "sqlite:///./weather_roofing.db"

    # --- CORS Frontend Origins ---
    FRONTEND_ORIGINS: Union[str, List[str]] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("FRONTEND_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    # --- Security & JWT ---
    JWT_SECRET_KEY: str = "replace-with-a-very-strong-and-secure-random-secret-key-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # --- Initial Admin User ---
    ADMIN_INITIAL_USERNAME: str = "admin"
    ADMIN_INITIAL_EMAIL: str = "admin@jemuran.local"
    ADMIN_INITIAL_PASSWORD: str = "adminPassword123!"
    ADMIN_INITIAL_FULL_NAME: str = "System Administrator"

    # --- Device & Simulation ---
    DEVICE_MODE: str = "simulation"  # "simulation" or "real"
    DEVICE_OFFLINE_TIMEOUT_SECONDS: int = 120
    DEFAULT_DEVICE_ID: str = "roof-001"
    ENABLE_ESP_RAIN_SENSOR: bool = False  # Dinonaktifkan sementara karena perangkat ESP belum ada

    # --- MQTT Broker ---
    MQTT_ENABLED: bool = False
    MQTT_HOST: str = "localhost"
    MQTT_PORT: int = 1883
    MQTT_USERNAME: str = ""
    MQTT_PASSWORD: str = ""
    MQTT_CLIENT_ID: str = "weather-roofing-backend"
    MQTT_USE_TLS: bool = False
    MQTT_KEEP_ALIVE: int = 60

    # --- Weather Provider ---
    WEATHER_PROVIDER: str = "open-meteo"  # "open-meteo", "bmkg", or "openweathermap"
    OPEN_METEO_API_BASE_URL: str = "https://api.open-meteo.com/v1/forecast"
    BMKG_API_BASE_URL: str = "https://api.bmkg.go.id/publik/prakiraan-cuaca"
    BMKG_DEFAULT_ADM4: str = "35.78.07.1001"
    WEATHER_LOCATION: str = "Surabaya, Jawa Timur"
    OPENWEATHER_API_KEY: str = ""
    OPENWEATHER_API_BASE_URL: str = "https://api.openweathermap.org/data/2.5"

    WEATHER_POLL_INTERVAL_MINUTES: int = 15
    WEATHER_CACHE_MINUTES: int = 10
    WEATHER_REFRESH_COOLDOWN_SECONDS: int = 60

    # --- Early-Close Logic ---
    EARLY_CLOSE_THRESHOLD: float = 80.0  # percentage (0 - 100)
    EARLY_CLOSE_HORIZON_MINUTES: int = 60  # minutes horizon


settings = Settings()
