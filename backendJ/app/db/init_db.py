import logging
from datetime import timedelta
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import engine, Base
from app.models.user import User
from app.models.device import Device
from app.models.settings import AppSettingsModel
from app.models.sensor import SensorReading
from app.models.activity import RoofActivity
from app.models.forecast import WeatherForecast
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

    # 6. Buat riwayat aktivitas awal, telemetri sensor 24 jam, dan arsip cuaca (hanya jika bukan testing)
    if settings.APP_ENV != "testing":
        act_count = db.query(RoofActivity).filter(RoofActivity.device_id == default_dev_id).count()
        if act_count == 0:
            sample_activities = [
                RoofActivity(
                    device_id=default_dev_id,
                    event_type="roof_close",
                    source="system",
                    cause="Sistem cerdas SkyShelter diinisialisasi untuk pertama kali.",
                    result="Kanopi atap diposisikan tertutup aman (standby).",
                    created_at=now - timedelta(hours=20),
                ),
                RoofActivity(
                    device_id=default_dev_id,
                    event_type="mode_change",
                    source="user",
                    cause="Administrator mengaktifkan mode pemantauan cerdas otomatis.",
                    result="Sistem beralih ke Mode Otomatis (Early-Close + Sensor Lokal).",
                    created_at=now - timedelta(hours=18),
                ),
                RoofActivity(
                    device_id=default_dev_id,
                    event_type="roof_open",
                    source="user",
                    cause="Cuaca pagi cerah berawan (29.2°C, kelembapan 62%, probabilitas hujan 15%).",
                    result="Kanopi berhasil dibuka penuh 100% untuk penjemuran pakaian.",
                    created_at=now - timedelta(hours=14),
                ),
                RoofActivity(
                    device_id=default_dev_id,
                    event_type="forecast_update",
                    source="early_close_forecast",
                    cause="Radar satelit BMKG memprediksi probabilitas presipitasi tinggi (86% >= 80%).",
                    result="Algoritma Early-Close mengeluarkan rekomendasi penutupan atap lebih awal.",
                    created_at=now - timedelta(hours=6),
                ),
                RoofActivity(
                    device_id=default_dev_id,
                    event_type="rain_event",
                    source="local_sensor",
                    cause="Sensor hujan fisik pelat lokal mendeteksi presipitasi air hujan aktif (Nilai ADC: 310).",
                    result="Atap otomatis ditutup darurat oleh sistem demi melindungi cucian pakaian.",
                    created_at=now - timedelta(hours=5),
                ),
                RoofActivity(
                    device_id=default_dev_id,
                    event_type="rain_event",
                    source="local_sensor",
                    cause="Permukaan pelat sensor kembali kering setelah jeda stabilisasi keselamatan.",
                    result="Deteksi presipitasi hujan fisik selesai.",
                    created_at=now - timedelta(hours=3),
                ),
                RoofActivity(
                    device_id=default_dev_id,
                    event_type="roof_open",
                    source="user",
                    cause="Kondisi cuaca kembali kondusif dan sensor kering.",
                    result="Kanopi atap dibuka kembali oleh pengguna.",
                    created_at=now - timedelta(hours=1, minutes=30),
                ),
            ]
            db.add_all(sample_activities)
            db.commit()
            logger.info("Riwayat aktivitas awal (RoofActivity) berhasil diinisialisasi.")

        if sensor_count < 5:
            sample_readings = []
            for h in range(24, 0, -1):
                t = now - timedelta(hours=h)
                is_rain_hour = (h in [5, 4])
                reading = SensorReading(
                    device_id=default_dev_id,
                    rain_detected=is_rain_hour,
                    rain_status="rain_detected" if is_rain_hour else "dry",
                    rain_analog_value=310.0 if is_rain_hour else 1023.0,
                    light_status="dark" if (h > 18 or h < 6) else ("dark" if is_rain_hour else "bright"),
                    light_lux=45.0 if (h > 18 or h < 6) else (90.0 if is_rain_hour else (650.0 + (h % 3) * 30.0)),
                    temperature=24.5 if is_rain_hour else (28.0 + (h % 4) * 0.8),
                    humidity=88.0 if is_rain_hour else (64.0 + (h % 5) * 2.0),
                    recorded_at=t,
                )
                sample_readings.append(reading)
            db.add_all(sample_readings)
            db.commit()
            logger.info("Rekaman telemetri sensor 24 jam berhasil diinisialisasi.")

        fc_count = db.query(WeatherForecast).count()
        if fc_count < 5:
            sample_forecasts = []
            forecast_configs = [
                (24, 25.0, "Cerah Berawan", 29.5, 65.0),
                (20, 20.0, "Cerah", 30.5, 60.0),
                (16, 35.0, "Berawan Tebal", 29.0, 70.0),
                (12, 45.0, "Berawan", 28.5, 74.0),
                (8, 75.0, "Mendung Tebal", 27.5, 78.0),
                (6, 86.0, "Hujan Sedang", 25.0, 85.0),
                (5, 88.0, "Hujan Lebat", 24.0, 90.0),
                (4, 82.0, "Hujan Ringan", 24.5, 88.0),
                (3, 40.0, "Berawan Tebal", 26.5, 80.0),
                (2, 20.0, "Cerah Berawan", 28.0, 72.0),
            ]
            for hours_ago, prob, cond, temp, hum in forecast_configs:
                f_time = now - timedelta(hours=hours_ago)
                fc = WeatherForecast(
                    provider="bmkg",
                    location=settings.WEATHER_LOCATION,
                    probability_of_rain=prob,
                    forecast_horizon_minutes=settings.EARLY_CLOSE_HORIZON_MINUTES,
                    forecast_at=f_time,
                    fetched_at=f_time - timedelta(minutes=15),
                    weather_condition=cond,
                    temperature=temp,
                    humidity=hum,
                    is_stale=False,
                    status="success",
                    raw_payload=None,
                )
                sample_forecasts.append(fc)
            db.add_all(sample_forecasts)
            db.commit()
            logger.info("Arsip prakiraan cuaca evaluasi berhasil diinisialisasi.")
