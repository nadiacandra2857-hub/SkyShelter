# Panduan Integrasi Hardware ESP8266 & Broker MQTT SkyShelter V2.0

Dokumen ini menjelaskan tata cara menghubungkan mikrokontroler fisik (ESP8266 NodeMCU / ESP32) ke **SkyShelter Backend** menggunakan **Broker MQTT**.

---

## 1. Arsitektur Komunikasi MQTT

Komunikasi antara perangkat keras dan backend menggunakan pola Publisher/Subscriber:

```
+---------------------+                +-------------------------+                +-------------------------+
|   ESP8266 / ESP32   | <--- (WiFi) -> |    MQTT Broker          | <--- (TCP) --> |    Backend SkyShelter   |
|   (Hardware Atap)   |                |    (Port 1883 / 9001)   |                |    (FastAPI / Python)   |
+---------------------+                +-------------------------+                +-------------------------+
```

### Kontrak Topik:
| Arah | Topik | Deskripsi |
| :--- | :--- | :--- |
| **ESP -> Backend** | `atap/{device_id}/sensors` | Telemetri sensor hujan (digital + ADC) dan lux/suhu |
| **ESP -> Backend** | `atap/{device_id}/status` | Heartbeat perangkat & status kanopi terkini |
| **ESP -> Backend** | `atap/{device_id}/command_ack` | Konfirmasi keberhasilan motor fisik menjalankan perintah |
| **Backend -> ESP** | `atap/{device_id}/command` | Perintah buka/tutup kanopi dari dashboard |
| **Backend -> ESP** | `atap/{device_id}/mode` | Perintah perpindahan mode (auto/manual) |
| **Backend -> ESP** | `atap/{device_id}/forecast` | Peringatan prediksi cuaca untuk otomasi *Early-Close* lokal |

---

## 2. Menjalankan Broker MQTT Lokal

Broker MQTT AMQTT bawaan telah disediakan dan dapat langsung dijalankan tanpa instalasi software pihak ketiga tambahan:

### Cara 1: Menggunakan Script 1-Klik
Cukup jalankan:
```cmd
start_broker.bat
```

### Cara 2: Melalui Terminal Python
```powershell
cd backendJ
.\.venv\Scripts\python.exe run_broker.py
```
Broker akan otomatis aktif pada:
- **Port TCP (ESP8266)**: `0.0.0.0:1883`
- **Port WebSocket (Web UI)**: `0.0.0.0:9001`
- **Autentikasi**: *Anonymous* (bebas tanpa username/password untuk mempermudah perakitan prototipe)

---

## 3. Skema Rangkaian Wiring Hardware (NodeMCU ESP8266)

| Komponen | Pin Sensor / Modul | Pin ESP8266 | Keterangan |
| :--- | :--- | :--- | :--- |
| **Sensor Hujan FC-37** | `VCC` | `3V3` atau `VIN` | Tegangan modul komparator |
| | `GND` | `GND` | Ground bersama |
| | `D0` (Digital Out) | `D5` (GPIO14) | Sinyal digital (LOW saat terkena tetesan air) |
| | `A0` (Analog Out) | `A0` (ADC0) | Nilai analog kebasahan air (0 - 1023) |
| **Servo Motor (SG90/MG996R)** | `VCC (Merah)` | `VIN` (5V) | Daya motor kanopi |
| | `GND (Cokelat/Hitam)`| `GND` | Ground bersama |
| | `PWM (Kuning/Oranye)`| `D4` (GPIO2) | Sinyal PWM sudut buka/tutup kanopi |
| **Indikator LED** | Anoda (+) | `D0` (GPIO16) | Indikator status koneksi WiFi & MQTT |
| | Katoda (-) | `GND` via 220Ω | Ground |

---

## 4. Cara Flash Firmware ke ESP8266

1. Buka Arduino IDE.
2. Pasang library berikut melalui **Library Manager** (`Sketch -> Include Library -> Manage Libraries...`):
   - `PubSubClient` by Nick O'Leary
   - `ArduinoJson` by Benoit Blanchon (Versi 6.x)
3. Buka file sketsa firmware di:
   [`firmware/skyshelter_esp8266/skyshelter_esp8266.ino`](skyshelter_esp8266/skyshelter_esp8266.ino)
4. Sesuaikan konfigurasi di bagian atas kode:
   ```cpp
   const char* WIFI_SSID     = "NAMA_WIFI_RUMAH";
   const char* WIFI_PASSWORD = "PASSWORD_WIFI";
   const char* MQTT_BROKER   = "192.168.1.10"; // IP Laptop/Komputer server Anda
   ```
5. Pilih Board: **NodeMCU 1.0 (ESP-12E Module)** dan port COM yang sesuai.
6. Klik **Upload**.

Setelah proses upload selesai, buka **Serial Monitor** pada baudrate `115200`. Anda akan melihat log koneksi dan pengiriman telemetri sensor langsung ke dashboard SkyShelter!

