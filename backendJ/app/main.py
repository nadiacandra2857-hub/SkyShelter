import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.mqtt.client import mqtt_service
from app.services.weather_service import weather_service
from app.services.device_service import DeviceService
from app.api.router import api_router

# Setup logger
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")


async def periodic_weather_poller():
    """Background task untuk polling prakiraan cuaca secara berkala (default 15 menit)."""
    while True:
        try:
            await asyncio.sleep(settings.WEATHER_POLL_INTERVAL_MINUTES * 60)
            logger.info("Menjalankan periodic weather polling...")
            db = SessionLocal()
            try:
                await weather_service.get_current_weather(db, force_refresh=True)
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error dalam periodic_weather_poller: {e}")


async def simulation_device_worker():
    """Background task untuk mensimulasikan heartbeat dan telemetri perangkat jika dalam mode simulasi."""
    while True:
        try:
            await asyncio.sleep(30)  # Kirim heartbeat setiap 30 detik
            if settings.DEVICE_MODE == "simulation":
                db = SessionLocal()
                try:
                    DeviceService.update_heartbeat(db, settings.DEFAULT_DEVICE_ID)
                finally:
                    db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.debug(f"Simulation worker error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manajemen Lifecycle Aplikasi FastAPI."""
    logger.info("Memulai backend Weather-Responsive Roofing System V2.0...")

    # 1. Inisialisasi Database
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()

    # 2. Mulai MQTT Client jika diaktifkan
    if settings.MQTT_ENABLED:
        mqtt_service.start()

    # 3. Mulai Background Workers
    weather_task = asyncio.create_task(periodic_weather_poller())
    simulation_task = None
    if settings.DEVICE_MODE == "simulation":
        simulation_task = asyncio.create_task(simulation_device_worker())

    yield

    # Shutdown
    logger.info("Mematikan background tasks dan memutus koneksi...")
    weather_task.cancel()
    if simulation_task:
        simulation_task.cancel()

    if settings.MQTT_ENABLED:
        mqtt_service.stop()

    logger.info("Backend berhasil dinonaktifkan secara bersih.")


app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    description="REST API Backend untuk Weather-Responsive Roofing System V2.0 yang terintegrasi dengan Frontend React & ESP8266.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Konfigurasi CORS
origins = settings.FRONTEND_ORIGINS if isinstance(settings.FRONTEND_ORIGINS, list) else [settings.FRONTEND_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


# Exception Handler untuk Starlette/FastAPI HTTPException
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail
    if isinstance(detail, dict):
        return JSONResponse(status_code=exc.status_code, content={"detail": detail})
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": {
                "code": "HTTP_ERROR",
                "message": str(detail)
            }
        }
    )


# Exception Handler untuk Request Validation Error (Pydantic 422)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    msg = first_error.get("msg", "Validasi input gagal.")
    loc = " -> ".join([str(x) for x in first_error.get("loc", [])])
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": {
                "code": "VALIDATION_ERROR",
                "message": f"{loc}: {msg}" if loc else msg,
                "errors": errors
            }
        }
    )


# Exception Handler untuk Generic Unhandled Exception (500)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Terjadi kesalahan internal pada server backend."
            }
        }
    )


# Register API Router
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
def root():
    return {
        "name": settings.APP_NAME,
        "version": "2.0.0",
        "status": "running",
        "docs_url": "/docs",
        "api_v1": "/api/v1"
    }
