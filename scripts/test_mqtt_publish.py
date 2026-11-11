#!/usr/bin/env python3
"""
Test script untuk menguji koneksi MQTT broker dan memverifikasi integrasi dengan SkyShelter backend.
Jalankan:
  python scripts/test_mqtt_publish.py
"""

import json
import time
import paho.mqtt.client as mqtt

MQTT_HOST = "broker.emqx.io"   # Public cloud broker
MQTT_PORT = 1883
DEVICE_ID = "roof-001"

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print(f"[*] Berhasil terhubung ke broker MQTT di {MQTT_HOST}:{MQTT_PORT}")
        # Subscribe ke perintah dari web
        cmd_topic = f"atap/{DEVICE_ID}/command"
        client.subscribe(cmd_topic)
        print(f"[*] Menunggu perintah kendali dari Web di topik: {cmd_topic}")
    else:
        print(f"[!] Gagal terhubung ke MQTT broker. Return code: {rc}")

def on_message(client, userdata, msg):
    print(f"\n[<] PERINTAH DITERIMA DARI WEB: {msg.topic}")
    try:
        data = json.loads(msg.payload.decode())
        print(f"    Payload: {data}")
        command = data.get("command")
        cmd_id = data.get("command_id", "sim-id")
        
        # Kirim Ack balik ke backend
        ack_payload = {
            "command_id": cmd_id,
            "status": "succeeded",
            "roof_status": command,
            "detail": f"Simulasi eksekusi atap berhasil ke posisi: {command}"
        }
        client.publish(f"atap/{DEVICE_ID}/command_ack", json.dumps(ack_payload))
        print(f"[>] Ack konfirmasi dikirim ke atap/{DEVICE_ID}/command_ack\n")
    except Exception as e:
        print(f"[!] Error parsing command: {e}")

def main():
    client = mqtt.Client(client_id="SkyShelter-Simulator")
    client.on_connect = on_connect
    client.on_message = on_message

    print(f"[*] Menghubungkan ke broker MQTT {MQTT_HOST}:{MQTT_PORT}...")
    try:
        client.connect(MQTT_HOST, MQTT_PORT, 60)
    except Exception as e:
        print(f"[!] Error koneksi ke broker: {e}")
        print("    Pastikan Broker MQTT (misal Mosquitto) sudah aktif.")
        return

    client.loop_start()

    print("[*] Mulai mengirimkan status heartbeat dan telemetri sensor...")
    print("    Tekan Ctrl+C untuk berhenti.\n")

    counter = 0
    try:
        while True:
            # 1. Kirim Heartbeat
            status_payload = {
                "roof_status": "closed",
                "mode": "auto",
                "rssi": -65
            }
            client.publish(f"atap/{DEVICE_ID}/status", json.dumps(status_payload))
            print(f"[>] Heartbeat dikirim: {status_payload}")

            # 2. Kirim Sensor Data
            sensor_payload = {
                "rain_detected": False,
                "rain_analog": 1012,
                "light_lux": 480.0,
                "temperature": 29.5 + (counter % 3) * 0.5,
                "humidity": 65.0
            }
            client.publish(f"atap/{DEVICE_ID}/sensors", json.dumps(sensor_payload))
            print(f"[>] Telemetri Sensor dikirim: {sensor_payload}")

            counter += 1
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n[*] Simulator dihentikan.")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()

