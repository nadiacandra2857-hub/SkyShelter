import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch

from app.core.config import settings
from app.models.device import Device
from app.models.sensor import SensorReading
from app.models.forecast import WeatherForecast
from app.models.activity import RoofActivity
from app.models.settings import AppSettingsModel
from app.services.device_service import DeviceService
from app.services.decision_service import DecisionService
from app.services.weather_service import weather_service, BMKGAdapter, OpenWeatherMapAdapter, OpenMeteoAdapter
from app.mqtt.handlers import handle_sensor_message, handle_status_message
from app.utils.datetime import now_jakarta


# 1. Health check
def test_01_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["api_version"] == "v1"

    root_resp = client.get("/")
    assert root_resp.status_code == 200
    assert root_resp.json()["status"] == "running"


# 2. Login berhasil dan gagal
def test_02_login_success_and_failure(client):
    # Gagal: password salah
    res_fail = client.post("/api/v1/auth/login", json={
        "username": "admin",
        "password": "wrongPassword"
    })
    assert res_fail.status_code == 401
    assert res_fail.json()["detail"]["code"] == "INVALID_CREDENTIALS"

    # Berhasil
    res_ok = client.post("/api/v1/auth/login", json={
        "username": "admin",
        "password": "adminPassword123!"
    })
    assert res_ok.status_code == 200
    data = res_ok.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "admin"


# 3. Endpoint yang memerlukan autentikasi
def test_03_authenticated_endpoints_protection(client, auth_headers):
    # Tanpa token -> 401
    res_no_auth = client.get("/api/v1/auth/me")
    assert res_no_auth.status_code == 401
    assert res_no_auth.json()["detail"]["code"] == "UNAUTHORIZED"

    # Dengan token -> 200
    res_auth = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res_auth.status_code == 200
    assert res_auth.json()["username"] == "admin"


# 4. Mengambil dashboard summary
def test_04_get_dashboard_summary(client):
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "roof_status" in data
    assert "mode" in data
    assert "rain_sensor" in data
    assert "connection_status" in data
    assert "decision" in data
    assert "weather_summary" in data
    assert "recent_activities" in data


# 5. Mengambil status perangkat
def test_05_get_device_status(client):
    response = client.get("/api/v1/devices/roof-001/status")
    assert response.status_code == 200
    data = response.json()
    assert data["device_id"] == "roof-001"
    assert data["roof_status"] in ["open", "closed", "opening", "closing", "unknown"]
    assert data["mode"] in ["auto", "manual"]
    assert data["rain_sensor"] in ["dry", "rain_detected", "unknown"]


# 6. Mengubah mode operasi
def test_06_change_operation_mode(client, auth_headers):
    # Ubah ke manual
    res = client.patch(
        "/api/v1/devices/roof-001/mode",
        json={"mode": "manual"},
        headers=auth_headers
    )
    assert res.status_code == 200
    assert res.json()["mode"] == "manual"

    # Verifikasi status perangkat
    st = client.get("/api/v1/devices/roof-001/status").json()
    assert st["mode"] == "manual"

    # Kembalikan ke auto
    res_auto = client.patch(
        "/api/v1/devices/roof-001/mode",
        json={"mode": "auto"},
        headers=auth_headers
    )
    assert res_auto.status_code == 200
    assert res_auto.json()["mode"] == "auto"


# 7. Validasi perintah buka/tutup
def test_07_validate_open_close_commands(client, auth_headers, db_session):
    # Pastikan kondisi sensor kering agar perintah valid
    DeviceService.record_sensor_telemetry(db_session, "roof-001", rain_detected=False)

    # Perintah tidak valid
    res_invalid = client.post(
        "/api/v1/devices/roof-001/commands",
        json={"command": "fly"},
        headers=auth_headers
    )
    assert res_invalid.status_code == 422

    # Perintah open (sukses dalam simulasi)
    res_open = client.post(
        "/api/v1/devices/roof-001/commands",
        json={"command": "open"},
        headers=auth_headers
    )
    assert res_open.status_code == 200
    assert res_open.json()["status"] == "succeeded"
    assert res_open.json()["command"] == "open"

    # Perintah close (sukses dalam simulasi)
    res_close = client.post(
        "/api/v1/devices/roof-001/commands",
        json={"command": "close"},
        headers=auth_headers
    )
    assert res_close.status_code == 200
    assert res_close.json()["status"] == "succeeded"
    assert res_close.json()["command"] == "close"


# 8. Perangkat offline
def test_08_device_offline_handling(client, db_session):
    device = db_session.query(Device).filter(Device.id == "roof-001").first()
    # Set waktu heartbeat jauh di masa lalu (lebih dari 120 detik)
    old_time = now_jakarta() - timedelta(seconds=500)
    device.last_heartbeat = old_time
    # Set non-simulasi untuk menguji deteksi offline murni
    device.is_simulation = False
    db_session.commit()

    conn_status = DeviceService.determine_connection_status(device)
    assert conn_status == "offline"

    # Endpoint status harus mencerminkan status offline
    res = client.get("/api/v1/devices/roof-001/status")
    assert res.json()["connection_status"] == "offline"

    # Kembalikan ke mode simulasi untuk pengujian selanjutnya
    device.is_simulation = True
    device.last_heartbeat = now_jakarta()
    db_session.commit()


# 9. Sensor hujan terdeteksi & Safety Lock
def test_09_rain_detected_safety_lock(client, auth_headers, db_session):
    # Simulasikan sensor hujan mendeteksi air/hujan
    DeviceService.record_sensor_telemetry(db_session, "roof-001", rain_detected=True, rain_analog_value=350.0)

    # Cek status sensor
    st = client.get("/api/v1/devices/roof-001/status").json()
    assert st["rain_sensor"] == "rain_detected"
    assert st["rain_detected"] is True

    # Coba kirim perintah 'open' -> HARUS DITOLAK karena safety policy
    res_blocked = client.post(
        "/api/v1/devices/roof-001/commands",
        json={"command": "open"},
        headers=auth_headers
    )
    assert res_blocked.status_code == 400
    data = res_blocked.json()
    assert data["detail"]["code"] == "RAIN_SAFETY_LOCK"
    assert "hujan" in data["detail"]["message"].lower()

    # Perintah 'close' tetap diizinkan untuk mengamankan jemuran
    res_close = client.post(
        "/api/v1/devices/roof-001/commands",
        json={"command": "close"},
        headers=auth_headers
    )
    assert res_close.status_code == 200

    # Bersihkan kembali kondisi sensor menjadi kering
    DeviceService.record_sensor_telemetry(db_session, "roof-001", rain_detected=False, rain_analog_value=1023.0)


# 10. Prediksi di atas ambang early-close
def test_10_forecast_early_close_threshold():
    # Evaluasi logika keputusan saat probabilitas hujan >= 80% dan sensor kering
    res = DecisionService.evaluate(
        rain_detected=False,
        probability_of_rain=85.0,
        weather_available=True,
        threshold=80.0
    )
    assert res.decision == "early_close"
    assert res.early_close_recommended is True
    assert res.rain_priority_active is False

    # Standby jika probabilitas sedang (e.g. 60%)
    res_standby = DecisionService.evaluate(
        rain_detected=False,
        probability_of_rain=60.0,
        weather_available=True,
        threshold=80.0
    )
    assert res_standby.decision == "standby"
    assert res_standby.early_close_recommended is False

    # Normal jika probabilitas rendah (e.g. 20%)
    res_normal = DecisionService.evaluate(
        rain_detected=False,
        probability_of_rain=20.0,
        weather_available=True,
        threshold=80.0
    )
    assert res_normal.decision == "normal"


# 11. Kegagalan API cuaca dan fallback
@pytest.mark.asyncio
async def test_11_weather_api_failure_and_fallback(db_session):
    # Simulasikan semua provider cuaca gagal
    with patch.object(OpenMeteoAdapter, "fetch", side_effect=Exception("Open-Meteo Error")):
        with patch.object(BMKGAdapter, "fetch", side_effect=Exception("BMKG Timeout")):
            with patch.object(OpenWeatherMapAdapter, "fetch", side_effect=Exception("OWM Rate Limit")):
                res = await weather_service.get_current_weather(db_session, force_refresh=True)
            # Karena API gagal, harus mengembalikan data lama (stale) atau status unavailable
            assert res.status in ["stale", "unavailable"]
            assert res.is_stale is True


# 12. Data historis kosong
def test_12_empty_history_data(client):
    # Panggil evaluasi ketika data historis tidak ada atau kurang dari 5
    res = client.get("/api/v1/history/evaluation")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "insufficient_data"
    assert data["metrics"] is None


# 13. Filter riwayat
def test_13_history_filtering(client, db_session):
    # Tambah aktivitas pengujian
    now = now_jakarta()
    act = RoofActivity(
        device_id="roof-001",
        event_type="test_event",
        source="system",
        cause="Unit test trigger",
        result="succeeded",
        created_at=now
    )
    db_session.add(act)
    db_session.commit()

    # Query dengan filter event_type
    res = client.get("/api/v1/history/activities?event_type=test_event")
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 1
    assert items[0]["event_type"] == "test_event"

    # Query dengan filter event_type yang tidak ada
    res_empty = client.get("/api/v1/history/activities?event_type=non_existent")
    assert res_empty.status_code == 200
    assert len(res_empty.json()["items"]) == 0


# 14. Ekspor CSV
def test_14_export_csv(client):
    res_act = client.get("/api/v1/history/export?data_type=activities")
    assert res_act.status_code == 200
    assert "text/csv" in res_act.headers["content-type"]
    assert "ID,Device ID,Event Type" in res_act.text

    res_sensor = client.get("/api/v1/history/export?data_type=sensors")
    assert res_sensor.status_code == 200
    assert "text/csv" in res_sensor.headers["content-type"]
    assert "ID,Device ID,Rain Detected" in res_sensor.text


# 15. Pengaturan dengan nilai tidak valid
def test_15_invalid_settings_validation(client, auth_headers):
    # Ambang batas > 100% -> harus ditolak (422)
    res_invalid_threshold = client.patch(
        "/api/v1/settings",
        json={"early_close_threshold": 150.0},
        headers=auth_headers
    )
    assert res_invalid_threshold.status_code == 422

    # Horizon waktu < 10 menit -> harus ditolak (422)
    res_invalid_horizon = client.patch(
        "/api/v1/settings",
        json={"forecast_horizon_minutes": 2},
        headers=auth_headers
    )
    assert res_invalid_horizon.status_code == 422

    # Nilai valid -> harus berhasil (200)
    res_valid = client.patch(
        "/api/v1/settings",
        json={"early_close_threshold": 75.0, "forecast_horizon_minutes": 45},
        headers=auth_headers
    )
    assert res_valid.status_code == 200
    assert res_valid.json()["early_close_threshold"] == 75.0
    assert res_valid.json()["forecast_horizon_minutes"] == 45


# 16. Koneksi MQTT tidak tersedia
def test_16_mqtt_unavailable_handling(client, auth_headers, db_session):
    device = db_session.query(Device).filter(Device.id == "roof-001").first()
    # Atur perangkat ke mode nyata (bukan simulasi)
    device.is_simulation = False
    device.last_heartbeat = now_jakarta()
    db_session.commit()

    # Ketika mode real aktif dan MQTT offline, perintah harus mengembalikan 503 Service Unavailable
    with patch("app.mqtt.client.mqtt_service.is_connected", return_value=False):
        res = client.post(
            "/api/v1/devices/roof-001/commands",
            json={"command": "close"},
            headers=auth_headers
        )
        assert res.status_code == 503
        assert res.json()["detail"]["code"] == "MQTT_UNAVAILABLE"

    # Kembalikan perangkat ke mode simulasi
    device.is_simulation = True
    db_session.commit()


# 17. Penanganan payload MQTT yang tidak valid
def test_17_mqtt_invalid_payload_handling():
    # String JSON rusak / broken syntax
    # Handler tidak boleh memicu unhandled exception yang menghentikan aplikasi
    try:
        handle_sensor_message("atap/roof-001/sensors", "BROKEN_JSON_STRING{{{")
        handle_status_message("atap/roof-001/status", "{'invalid_quotes': 123}")
    except Exception as e:
        pytest.fail(f"MQTT handler melempar unhandled exception pada payload rusak: {e}")
