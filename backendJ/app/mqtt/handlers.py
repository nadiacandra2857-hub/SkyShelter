import json
import logging
from typing import Dict, Any
from app.db.session import SessionLocal
from app.services.device_service import DeviceService
from app.models.activity import DeviceCommand, RoofActivity
from app.utils.datetime import now_jakarta

logger = logging.getLogger("mqtt_handlers")


def handle_sensor_message(topic: str, payload_str: str):
    """
    Memproses payload telemetri sensor dari ESP8266:
    Topik: atap/{device_id}/sensors
    Format JSON yang diharapkan:
    {
        "rain_detected": false,
        "rain_analog": 1024,
        "light_lux": 450.5,
        "temperature": 29.2,
        "humidity": 68.0
    }
    """
    parts = topic.split("/")
    if len(parts) < 3:
        return
    device_id = parts[1]

    try:
        data = json.loads(payload_str)
        if not isinstance(data, dict):
            logger.warning(f"Payload sensor bukan JSON object: {payload_str}")
            return

        rain_detected = bool(data.get("rain_detected", False))
        rain_analog = float(data.get("rain_analog")) if data.get("rain_analog") is not None else None
        light_lux = float(data.get("light_lux")) if data.get("light_lux") is not None else None
        temp = float(data.get("temperature")) if data.get("temperature") is not None else None
        hum = float(data.get("humidity")) if data.get("humidity") is not None else None

        db = SessionLocal()
        try:
            DeviceService.record_sensor_telemetry(
                db=db,
                device_id=device_id,
                rain_detected=rain_detected,
                rain_analog_value=rain_analog,
                light_lux=light_lux,
                temperature=temp,
                humidity=hum
            )
        finally:
            db.close()
    except json.JSONDecodeError:
        logger.warning(f"MQTT: Pesan JSON sensor rusak pada topik {topic}: {payload_str}")
    except Exception as e:
        logger.error(f"Error memproses pesan sensor MQTT: {e}")


def handle_status_message(topic: str, payload_str: str):
    """
    Memproses pesan status perangkat & heartbeat dari ESP8266:
    Topik: atap/{device_id}/status
    Format JSON:
    {
        "roof_status": "closed",  # "open", "closed", "opening", "closing"
        "mode": "auto",           # "auto", "manual"
        "rssi": -65
    }
    """
    parts = topic.split("/")
    if len(parts) < 3:
        return
    device_id = parts[1]

    try:
        data = json.loads(payload_str)
        if not isinstance(data, dict):
            return

        roof_status = data.get("roof_status")
        mode = data.get("mode")

        db = SessionLocal()
        try:
            DeviceService.update_heartbeat(
                db=db,
                device_id=device_id,
                roof_status=roof_status,
                mode=mode
            )
        finally:
            db.close()
    except json.JSONDecodeError:
        logger.warning(f"MQTT: Pesan status rusak pada topik {topic}: {payload_str}")
    except Exception as e:
        logger.error(f"Error memproses pesan status MQTT: {e}")


def handle_command_ack_message(topic: str, payload_str: str):
    """
    Memproses konfirmasi eksekusi perintah fisik dari firmware ESP8266:
    Topik: atap/{device_id}/command_ack
    Format JSON:
    {
        "command_id": "uuid-string",
        "status": "succeeded",    # "succeeded", "failed", "blocked_by_safety"
        "roof_status": "open",
        "detail": "Motor stepper selesai membuka atap."
    }
    """
    parts = topic.split("/")
    if len(parts) < 3:
        return
    device_id = parts[1]

    try:
        data = json.loads(payload_str)
        command_id = data.get("command_id")
        ack_status = data.get("status", "succeeded")
        roof_status = data.get("roof_status")
        detail = data.get("detail", "")

        if not command_id:
            return

        db = SessionLocal()
        try:
            cmd = db.query(DeviceCommand).filter(DeviceCommand.id == command_id).first()
            if cmd:
                cmd.status = ack_status
                cmd.executed_at = now_jakarta()
                if detail:
                    cmd.detail = detail
                db.commit()

            if roof_status:
                DeviceService.update_heartbeat(db, device_id, roof_status=roof_status)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error memproses command ACK MQTT: {e}")
