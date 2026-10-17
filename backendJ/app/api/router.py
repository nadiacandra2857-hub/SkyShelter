from fastapi import APIRouter
from app.api.endpoints import (
    auth,
    dashboard,
    devices,
    control,
    weather,
    history,
    settings,
)

api_router = APIRouter()

# Health check endpoint
@api_router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Weather-Responsive Roofing System V2.0 Backend",
        "api_version": "v1"
    }

api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(devices.router)
api_router.include_router(control.router)
api_router.include_router(weather.router)
api_router.include_router(history.router)
api_router.include_router(settings.router)
