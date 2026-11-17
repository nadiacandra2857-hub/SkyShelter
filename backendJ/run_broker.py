"""
SkyShelter V2.0 - Local MQTT Broker Service
Menggunakan AMQTT (AsyncIO MQTT Broker) untuk komunikasi langsung dengan perangkat keras ESP8266 / NodeMCU / ESP32.
Mendukung koneksi TCP di port 1883 dan WebSocket di port 9001.
"""

import sys
import asyncio
import logging
from amqtt.broker import Broker

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("skyshelter_mqtt_broker")

BROKER_CONFIG = {
    "listeners": {
        "default": {
            "type": "tcp",
            "bind": "0.0.0.0:1883",
            "max_connections": 100,
        },
        "ws": {
            "type": "ws",
            "bind": "0.0.0.0:9001",
            "max_connections": 100,
        }
    },
    "sys_interval": 10,
    "auth": {
        "allow-anonymous": True,
    },
    "topic-check": {
        "enabled": False
    }
}


async def main():
    broker = Broker(BROKER_CONFIG)
    logger.info("==================================================================")
    logger.info("  SkyShelter V2.0 - Layanan Broker MQTT Hardware Aktif")
    logger.info("==================================================================")
    logger.info("  Port TCP (ESP8266 / Arduino): 1883 (bind: 0.0.0.0:1883)")
    logger.info("  Port WebSocket (Web / Dashboard): 9001 (bind: 0.0.0.0:9001)")
    logger.info("  Autentikasi: Anonymous (Bebas tanpa password untuk prototipe)")
    logger.info("==================================================================")
    logger.info("Broker siap menerima koneksi dari ESP8266 dan backend SkyShelter...")

    await broker.start()
    try:
        while True:
            await asyncio.sleep(1)
    except (KeyboardInterrupt, asyncio.CancelledError):
        logger.info("\nMenutup broker MQTT secara bersih...")
        await broker.shutdown()
        logger.info("Broker MQTT telah dimatikan.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)

