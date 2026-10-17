import json
import logging
import ssl
from typing import Optional, Dict, Any
import paho.mqtt.client as mqtt

from app.core.config import settings
from app.mqtt.topics import (
    TOPIC_SENSORS_SUB,
    TOPIC_STATUS_SUB,
    TOPIC_COMMAND_ACK_SUB,
    get_command_topic,
    get_mode_topic,
    get_forecast_topic,
    get_forecast_status_topic,
)
from app.mqtt.handlers import (
    handle_sensor_message,
    handle_status_message,
    handle_command_ack_message,
)

logger = logging.getLogger("mqtt_client")


class MQTTService:
    def __init__(self):
        self.client: Optional[mqtt.Client] = None
        self._is_connected = False
        self._enabled = settings.MQTT_ENABLED

    def start(self):
        """Memulai koneksi MQTT jika diaktifkan dalam konfigurasi."""
        if not self._enabled:
            logger.info("MQTT Service dinonaktifkan melalui konfigurasi (MQTT_ENABLED=false).")
            return

        try:
            # Paho-MQTT v2 compatibility check
            protocol = mqtt.MQTTv311
            self.client = mqtt.Client(
                client_id=settings.MQTT_CLIENT_ID,
                protocol=protocol
            )

            if settings.MQTT_USERNAME and settings.MQTT_PASSWORD:
                self.client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD)

            if settings.MQTT_USE_TLS:
                self.client.tls_set(cert_reqs=ssl.CERT_REQUIRED)

            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            self.client.on_message = self._on_message

            logger.info(f"Menghubungkan ke broker MQTT: {settings.MQTT_HOST}:{settings.MQTT_PORT}...")
            self.client.connect_async(settings.MQTT_HOST, settings.MQTT_PORT, keepalive=settings.MQTT_KEEP_ALIVE)
            self.client.loop_start()
        except Exception as e:
            logger.warning(f"Gagal menginisialisasi koneksi broker MQTT: {e}. Backend tetap beroperasi dalam mode fallback.")
            self._is_connected = False

    def stop(self):
        """Menghentikan loop MQTT dan memutuskan koneksi secara bersih."""
        if self.client:
            try:
                self.client.loop_stop()
                self.client.disconnect()
            except Exception as e:
                logger.debug(f"Error saat menutup koneksi MQTT: {e}")
            finally:
                self._is_connected = False
                logger.info("Koneksi MQTT service ditutup.")

    def is_connected(self) -> bool:
        return self._is_connected

    def _on_connect(self, client, userdata, flags, rc, properties=None):
        if rc == 0:
            self._is_connected = True
            logger.info("Berhasil terhubung ke broker MQTT.")
            # Berlangganan ke topik yang relevan
            client.subscribe([(TOPIC_SENSORS_SUB, 1), (TOPIC_STATUS_SUB, 1), (TOPIC_COMMAND_ACK_SUB, 1)])
            logger.info(f"Berlangganan ke: {TOPIC_SENSORS_SUB}, {TOPIC_STATUS_SUB}, {TOPIC_COMMAND_ACK_SUB}")
        else:
            self._is_connected = False
            logger.error(f"Koneksi broker MQTT ditolak dengan return code: {rc}")

    def _on_disconnect(self, client, userdata, rc, properties=None):
        self._is_connected = False
        if rc != 0:
            logger.warning(f"Koneksi MQTT terputus tidak terduga (rc={rc}). Mencoba menyambung kembali...")
        else:
            logger.info("MQTT terputus normal.")

    def _on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload_str = msg.payload.decode("utf-8")
            if topic.endswith("/sensors"):
                handle_sensor_message(topic, payload_str)
            elif topic.endswith("/status"):
                handle_status_message(topic, payload_str)
            elif topic.endswith("/command_ack"):
                handle_command_ack_message(topic, payload_str)
        except Exception as e:
            logger.error(f"Error delegasi pesan MQTT pada topik {msg.topic}: {e}")

    def publish_command(self, device_id: str, command: str, command_id: str) -> bool:
        """Mempublikasikan perintah kendali ke ESP8266."""
        if not self._is_connected or not self.client:
            logger.warning("Tidak dapat mempublikasikan perintah: MQTT client tidak terhubung.")
            return False

        topic = get_command_topic(device_id)
        payload = json.dumps({"command": command, "command_id": command_id})
        try:
            res = self.client.publish(topic, payload, qos=1)
            return res.rc == mqtt.MQTT_ERR_SUCCESS
        except Exception as e:
            logger.error(f"Gagal mempublikasikan command ke topic {topic}: {e}")
            return False

    def publish_mode_change(self, device_id: str, mode: str) -> bool:
        """Mempublikasikan perubahan mode operasi (auto/manual) ke ESP8266."""
        if not self._is_connected or not self.client:
            return False

        topic = get_mode_topic(device_id)
        payload = json.dumps({"mode": mode})
        try:
            res = self.client.publish(topic, payload, qos=1)
            return res.rc == mqtt.MQTT_ERR_SUCCESS
        except Exception as e:
            logger.error(f"Gagal mempublikasikan mode change: {e}")
            return False

    def publish_forecast(self, device_id: str, forecast_data: Dict[str, Any]) -> bool:
        """Mempublikasikan ringkasan prediksi cuaca ke ESP8266."""
        if not self._is_connected or not self.client:
            return False

        topic = get_forecast_topic(device_id)
        payload = json.dumps(forecast_data)
        try:
            res = self.client.publish(topic, payload, qos=1)
            return res.rc == mqtt.MQTT_ERR_SUCCESS
        except Exception as e:
            logger.error(f"Gagal mempublikasikan forecast ke {topic}: {e}")
            return False

    def publish_forecast_status(self, device_id: str, status_data: Dict[str, Any]) -> bool:
        """Mempublikasikan status ketersediaan prakiraan cuaca ke ESP8266."""
        if not self._is_connected or not self.client:
            return False

        topic = get_forecast_status_topic(device_id)
        payload = json.dumps(status_data)
        try:
            res = self.client.publish(topic, payload, qos=1)
            return res.rc == mqtt.MQTT_ERR_SUCCESS
        except Exception as e:
            logger.error(f"Gagal mempublikasikan forecast status: {e}")
            return False


# Singleton MQTT Service
mqtt_service = MQTTService()
