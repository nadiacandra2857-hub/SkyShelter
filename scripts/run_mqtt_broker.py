import asyncio
import logging
from amqtt.broker import Broker

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

config = {
    'listeners': {
        'default': {
            'type': 'tcp',
            'bind': '0.0.0.0:1883',
            'max_connections': 100
        }
    },
    'sys_interval': 0,
    'auth': {
        'allow-anonymous': True
    },
    'topic-check': {
        'enabled': True,
        'acl': {
            'anonymous': ['#']
        }
    }
}

async def main():
    broker = Broker(config)
    await broker.start()
    print("\n=======================================================")
    print(" [MQTT BROKER] Berjalan lokal di 0.0.0.0:1883")
    print(" Siap menerima koneksi ESP8266 & Backend SkyShelter!")
    print("=======================================================\n")
    while True:
        await asyncio.sleep(3600)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        print("\n[MQTT BROKER] Dihentikan.")

