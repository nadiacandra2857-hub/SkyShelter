import logging
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import engine, Base
from app.models.user import User
from app.models.device import Device
from app.models.settings import AppSettingsModel
from app.models.sensor import SensorReading
from app.utils.datetime import now_jakarta

logger = logging.getLogger("init_db")


def init_db(db: Session) -> None:
    """Menginisialisasi seluruh skema tabel dan data awal sistem."""
    # 1. Buat seluruh tabel di database jika belum ada
    Base.metadata.create_all(bind=engine)
    logger.info("Tabel-tabel database berhasil diverifikasi/dibuat.")

    # 2. Buat Pengguna Administrator Awal jika belum ada
    admin = db.query(User).filter(User.username == settings.ADMIN_INITIAL_USERNAME).first()
    if not admin:
        admin = User(
            username=settings.ADMIN_INITIAL_USERNAME,
            email=settings.ADMIN_INITIAL_EMAIL,
            full_name=settings.ADMIN_INITIAL_FULL_NAME,
            hashed_password=get_password_hash(settings.ADMIN_INITIAL_PASSWORD),
            is_active=True,
            is_admin=True,
            created_at=now_jakarta(),
            updated_at=now_jakarta()
        )
        db.add(admin)
        db.commit()
        logger.info(f"Admin awal '{settings.ADMIN_INITIAL_USERNAME}' berhasil dibuat.")

    # 3. Buat Pengaturan Awal (Settings)
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
        logger.info("Pengaturan sistem awal berhasil diinisialisasi.")

    # 4. Buat Perangkat Atap Default (roof-001)
    default_dev_id = settings.DEFAULT_DEVICE_ID
    device = db.query(Device).filter(Device.id == default_dev_id).first()
    is_sim = settings.DEVICE_MODE == "simulation"
    now = now_jakarta()

    if not device:
        device = Device(
            id=default_dev_id,
            name="Atap Jemuran Utama",
            device_type="roof",
            is_simulation=is_sim,
            roof_status="closed",
            mode="auto",
            last_heartbeat=now if is_sim else None,
            created_at=now,
            updated_at=now,
        )
        db.add(device)
        db.commit()
        logger.info(f"Perangkat default '{default_dev_id}' berhasil dibuat.")

    # 5. Buat pembacaan sensor awal jika belum ada data telemetri
    sensor_count = db.query(SensorReading).filter(SensorReading.device_id == default_dev_id).count()
    if sensor_count == 0:
        initial_reading = SensorReading(
            device_id=default_dev_id,
            rain_detected=False,
            rain_status="dry",
            rain_analog_value=1023.0,
            light_status="bright",
            light_lux=450.0,
            temperature=29.0,
            humidity=65.0,
            recorded_at=now,
        )
        db.add(initial_reading)
        db.commit()
        logger.info("Data sensor awal (kondisi kering/cerah) berhasil disimpan.")
