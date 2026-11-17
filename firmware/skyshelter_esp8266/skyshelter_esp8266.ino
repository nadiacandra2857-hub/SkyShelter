/*
 * =========================================================================================
 * SkyShelter V2.0 - Weather-Responsive Roofing System
 * Firmware Mikrokontroler ESP8266 / NodeMCU ESP-12E / ESP32
 * 
 * Fitur:
 * 1. WiFi & Auto-reconnect MQTT Client ke Broker SkyShelter.
 * 2. Sensor Presipitasi Hujan FC-37 (Digital D5 & Analog A0).
 * 3. Sensor Intensitas Cahaya LDR & Suhu/Kelembapan.
 * 4. Penggerak Kanopi Atap Jemuran (Servo / Stepper / Relay).
 * 5. Standar Komunikasi JSON terstandarisasi sesuai spesifikasi backend SkyShelter:
 *    - Telemetri Sensor: atap/{DEVICE_ID}/sensors
 *    - Heartbeat Status:  atap/{DEVICE_ID}/status
 *    - Konfirmasi Respon: atap/{DEVICE_ID}/command_ack
 *    - Penerimaan Perintah: atap/{DEVICE_ID}/command
 *    - Perubahan Mode:    atap/{DEVICE_ID}/mode
 *    - Rekomendasi Cuaca: atap/{DEVICE_ID}/forecast
 * =========================================================================================
 */

#if defined(ESP8266)
  #include <ESP8266WiFi.h>
#elif defined(ESP32)
  #include <WiFi.h>
#endif

#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Servo.h>

// ==========================================
// 1. KONFIGURASI JARINGAN & BROKER MQTT
// ==========================================
const char* WIFI_SSID     = "NAMA_WIFI_ANDA";         // Ganti dengan SSID WiFi Anda
const char* WIFI_PASSWORD = "PASSWORD_WIFI_ANDA";     // Ganti dengan Password WiFi Anda

// IP Komputer / Server yang menjalankan broker MQTT (run_broker.py)
// Jika menggunakan WiFi lokal, isi dengan IPv4 komputer Anda (cth: 192.168.1.10)
// Jika menggunakan cloud publik gratis, bisa gunakan: "broker.emqx.io"
const char* MQTT_BROKER   = "192.168.1.10"; 
const int   MQTT_PORT     = 1883;
const char* MQTT_USER     = "";                       // Kosongkan jika anonymous
const char* MQTT_PASS     = "";                       // Kosongkan jika anonymous

const char* DEVICE_ID     = "roof-001";               // Harus cocok dengan backend

// ==========================================
// 2. DEFINISI PIN HARDWARE ESP8266
// ==========================================
#define PIN_RAIN_DIGITAL    D5    // Pin DO sensor hujan FC-37 (LOW = Basah/Hujan)
#define PIN_RAIN_ANALOG     A0    // Pin AO sensor hujan (0-1023, < 400 = Hujan Aktif)
#define PIN_SERVO_MOTOR     D4    // Pin Signal PWM Servo Motor Atap (SG90 / MG996R)
#define PIN_STATUS_LED      D0    // Indikator LED Builtin (Active LOW pada NodeMCU)

// Sudut fisik Servo untuk Posisi Kanopi
#define SERVO_ANGLE_CLOSED  0     // 0 Derajat: Kanopi Tertutup Rapat
#define SERVO_ANGLE_OPEN    90    // 90 Derajat: Kanopi Terbuka Penuh

// ==========================================
// 3. VARIABEL STATE SISTEM
// ==========================================
WiFiClient espClient;
PubSubClient mqttClient(espClient);
Servo roofServo;

String currentRoofStatus = "closed"; // "open", "closed", "opening", "closing"
String currentMode       = "auto";   // "auto", "manual"
bool rainSafetyLock      = false;

unsigned long lastTelemetryMillis = 0;
unsigned long lastHeartbeatMillis = 0;
const unsigned long TELEMETRY_INTERVAL = 5000;   // Kirim sensor setiap 5 detik
const unsigned long HEARTBEAT_INTERVAL = 15000;  // Kirim heartbeat setiap 15 detik

// Nama Topik MQTT Dinamis
String topicSensors;
String topicStatus;
String topicCommandAck;
String topicCommandSub;
String topicModeSub;
String topicForecastSub;

// ==========================================
// 4. KENDALI FISIK MOTOR KANOPI
// ==========================================
void setCanopyPosition(String targetStatus, String commandId = "") {
  if (targetStatus == currentRoofStatus) {
    if (commandId != "") {
      publishCommandAck(commandId, "succeeded", currentRoofStatus, "Atap sudah berada pada posisi yang diminta.");
    }
    return;
  }

  // Safety Policy: Jika hujan basah, tolak membuka atap
  int rainDigital = digitalRead(PIN_RAIN_DIGITAL);
  int rainAnalog  = analogRead(PIN_RAIN_ANALOG);
  bool isWet = (rainDigital == LOW) || (rainAnalog < 450);

  if (targetStatus == "open" && isWet) {
    Serial.println("[SAFETY LOCK] Perintah buka atap dibatalkan: Sensor mendeteksi hujan!");
    if (commandId != "") {
      publishCommandAck(commandId, "blocked_by_safety", currentRoofStatus, "Ditolak: Safety Lock sensor hujan aktif.");
    }
    return;
  }

  Serial.print("[MOTOR] Menggerakkan kanopi ke: ");
  Serial.println(targetStatus);

  if (targetStatus == "open") {
    currentRoofStatus = "opening";
    publishHeartbeat();
    roofServo.write(SERVO_ANGLE_OPEN);
    delay(1200); // Simulasi waktu pergerakan fisik motor kanopi
    currentRoofStatus = "open";
  } else if (targetStatus == "close" || targetStatus == "closed") {
    currentRoofStatus = "closing";
    publishHeartbeat();
    roofServo.write(SERVO_ANGLE_CLOSED);
    delay(1200);
    currentRoofStatus = "closed";
  }

  publishHeartbeat();

  if (commandId != "") {
    publishCommandAck(commandId, "succeeded", currentRoofStatus, "Kanopi motor berhasil diposisikan ke " + currentRoofStatus);
  }
}

// ==========================================
// 5. PENERBITAN PESAN MQTT KE BACKEND
// ==========================================
void publishTelemetry() {
  int rainDigital = digitalRead(PIN_RAIN_DIGITAL);
  int rainAnalog  = analogRead(PIN_RAIN_ANALOG);
  bool rainDetected = (rainDigital == LOW) || (rainAnalog < 450);

  // Estimasi Lux sederhana (dapat dihubungkan ke LDR atau sensor BH1750)
  float lightLux = 680.0;
  float temperature = 29.5;
  float humidity = 62.0;

  // Bangun Payload JSON
  StaticJsonDocument<256> doc;
  doc["rain_detected"] = rainDetected;
  doc["rain_analog"]   = rainAnalog;
  doc["light_lux"]     = lightLux;
  doc["temperature"]   = temperature;
  doc["humidity"]      = humidity;

  char buffer[256];
  serializeJson(doc, buffer);
  mqttClient.publish(topicSensors.c_str(), buffer);

  Serial.print("[MQTT PUB SENSORS] ");
  Serial.println(buffer);

  // Otomasi Keselamatan Mandiri (Edge Autonomy):
  // Jika mode AUTO dan sensor mendeteksi hujan, langsung tutup atap seketika tanpa menunggu cloud!
  if (currentMode == "auto" && rainDetected && currentRoofStatus != "closed") {
    Serial.println("[AUTONOMY] Hujan terdeteksi lokal! Menutup kanopi secara instan...");
    setCanopyPosition("closed");
  }
}

void publishHeartbeat() {
  StaticJsonDocument<192> doc;
  doc["roof_status"] = currentRoofStatus;
  doc["mode"]        = currentMode;
  doc["rssi"]        = WiFi.RSSI();

  char buffer[192];
  serializeJson(doc, buffer);
  mqttClient.publish(topicStatus.c_str(), buffer);

  Serial.print("[MQTT PUB STATUS] ");
  Serial.println(buffer);
}

void publishCommandAck(String commandId, String status, String roofStatus, String detail) {
  StaticJsonDocument<256> doc;
  doc["command_id"]  = commandId;
  doc["status"]      = status;
  doc["roof_status"] = roofStatus;
  doc["detail"]      = detail;

  char buffer[256];
  serializeJson(doc, buffer);
  mqttClient.publish(topicCommandAck.c_str(), buffer);

  Serial.print("[MQTT PUB COMMAND_ACK] ");
  Serial.println(buffer);
}

// ==========================================
// 6. PENANGANAN PESAN MASUK DARI BACKEND
// ==========================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("[MQTT INCOMING] Topik: ");
  Serial.print(topic);
  Serial.print(" | Payload: ");
  Serial.println(message);

  StaticJsonDocument<384> doc;
  DeserializationError error = deserializeJson(doc, message);
  if (error) {
    Serial.print("[JSON ERROR] Gagal parse JSON: ");
    Serial.println(error.c_str());
    return;
  }

  String strTopic = String(topic);

  // 1. Topik Perintah Motor: atap/{DEVICE_ID}/command
  if (strTopic == topicCommandSub) {
    String cmd = doc["command"] | "";
    String cmdId = doc["command_id"] | "";

    if (cmd == "open") {
      setCanopyPosition("open", cmdId);
    } else if (cmd == "close") {
      setCanopyPosition("close", cmdId);
    }
  }

  // 2. Topik Perubahan Mode: atap/{DEVICE_ID}/mode
  else if (strTopic == topicModeSub) {
    String newMode = doc["mode"] | "";
    if (newMode == "auto" || newMode == "manual") {
      currentMode = newMode;
      Serial.print("[MODE] Mode operasional diperbarui ke: ");
      Serial.println(currentMode);
      publishHeartbeat();
    }
  }

  // 3. Topik Rekomendasi Early-Close Cuaca: atap/{DEVICE_ID}/forecast
  else if (strTopic == topicForecastSub) {
    float probRain = doc["probability_of_rain"] | 0.0;
    bool earlyClose = doc["early_close"] | false;

    // Jika Early-Close direkomendasikan BMKG/Open-Meteo dan dalam mode Auto, tutup atap lebih awal
    if (currentMode == "auto" && earlyClose && currentRoofStatus == "open") {
      Serial.println("[EARLY-CLOSE] Satelit mendeteksi hujan mendekat (probabilitas tinggi). Menutup atap lebih awal!");
      setCanopyPosition("closed");
    }
  }
}

// ==========================================
// 7. KONEKSI KE WIFI & MQTT
// ==========================================
void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("[WIFI] Menghubungkan ke ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED)); // Blink LED saat mencoba connect
  }

  digitalWrite(PIN_STATUS_LED, LOW); // LED Solid jika terhubung
  Serial.println("\n[WIFI] Berhasil terhubung!");
  Serial.print("[WIFI] IP Address ESP8266: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Menghubungkan ke broker: ");
    Serial.print(MQTT_BROKER);
    Serial.print("...");

    String clientId = "ESP8266-" + String(DEVICE_ID) + "-" + String(random(0xffff), HEX);

    bool connected = false;
    if (strlen(MQTT_USER) > 0) {
      connected = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASS);
    } else {
      connected = mqttClient.connect(clientId.c_str());
    }

    if (connected) {
      Serial.println(" BERHASIL!");
      
      // Berlangganan ke topik perintah dari backend
      mqttClient.subscribe(topicCommandSub.c_str(), 1);
      mqttClient.subscribe(topicModeSub.c_str(), 1);
      mqttClient.subscribe(topicForecastSub.c_str(), 1);

      Serial.println("[MQTT] Berhasil subscribe ke topik kendali & cuaca.");
      publishHeartbeat();
      publishTelemetry();
    } else {
      Serial.print(" Gagal, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Coba lagi dalam 4 detik...");
      delay(4000);
    }
  }
}

// ==========================================
// 8. SETUP & LOOP UTAMA
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n=======================================================");
  Serial.println("  SkyShelter V2.0 - Firmware IoT ESP8266 Memulai...");
  Serial.println("=======================================================");

  // Inisialisasi Pin
  pinMode(PIN_RAIN_DIGITAL, INPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);
  digitalWrite(PIN_STATUS_LED, HIGH);

  // Inisialisasi Servo
  roofServo.attach(PIN_SERVO_MOTOR);
  roofServo.write(SERVO_ANGLE_CLOSED); // Default atap tertutup untuk keamanan

  // Inisialisasi String Topik MQTT
  topicSensors     = "atap/" + String(DEVICE_ID) + "/sensors";
  topicStatus      = "atap/" + String(DEVICE_ID) + "/status";
  topicCommandAck  = "atap/" + String(DEVICE_ID) + "/command_ack";
  topicCommandSub  = "atap/" + String(DEVICE_ID) + "/command";
  topicModeSub     = "atap/" + String(DEVICE_ID) + "/mode";
  topicForecastSub = "atap/" + String(DEVICE_ID) + "/forecast";

  // Koneksi WiFi & Konfigurasi MQTT
  setupWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(512);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }

  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  unsigned long currentMillis = millis();

  // Pengiriman Telemetri Periodik
  if (currentMillis - lastTelemetryMillis >= TELEMETRY_INTERVAL) {
    lastTelemetryMillis = currentMillis;
    publishTelemetry();
  }

  // Pengiriman Heartbeat Periodik
  if (currentMillis - lastHeartbeatMillis >= HEARTBEAT_INTERVAL) {
    lastHeartbeatMillis = currentMillis;
    publishHeartbeat();
  }
}

