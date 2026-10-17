"""
Definisi Topik MQTT untuk Komunikasi ESP8266 & Weather-Responsive Roofing System Backend.

Kontrak Topik:
1. ESP8266 -> Backend (Telemetri & Heartbeat):
   - atap/{device_id}/sensors       : Data telemetri sensor hujan dan sensor cahaya.
   - atap/{device_id}/status        : Heartbeat status fisik atap dan mode operasi.
   - atap/{device_id}/command_ack   : Konfirmasi penyelesaian perintah oleh firmware fisik.

2. Backend -> ESP8266 (Kendali & Ringkasan Prediksi Cuaca):
   - atap/{device_id}/command       : Perintah buka / tutup atap manual dari dashboard.
   - atap/{device_id}/mode          : Perintah pergantian mode auto / manual.
   - atap/{device_id}/forecast      : Ringkasan probabilitas hujan untuk early-close lokal.
   - atap/{device_id}/forecast_status: Status ketersediaan layanan prediksi cuaca.
"""

# Prefix topic pattern
TOPIC_SENSORS_SUB = "atap/+/sensors"
TOPIC_STATUS_SUB = "atap/+/status"
TOPIC_COMMAND_ACK_SUB = "atap/+/command_ack"


def get_sensors_topic(device_id: str) -> str:
    return f"atap/{device_id}/sensors"


def get_status_topic(device_id: str) -> str:
    return f"atap/{device_id}/status"


def get_command_topic(device_id: str) -> str:
    return f"atap/{device_id}/command"


def get_command_ack_topic(device_id: str) -> str:
    return f"atap/{device_id}/command_ack"


def get_mode_topic(device_id: str) -> str:
    return f"atap/{device_id}/mode"


def get_forecast_topic(device_id: str) -> str:
    return f"atap/{device_id}/forecast"


def get_forecast_status_topic(device_id: str) -> str:
    return f"atap/{device_id}/forecast_status"
