/**
 * SkyShelter V2.0 - Firmware ESP8266 Terintegrasi dengan Hardware Riil
 * 
 * Hardware Pin Mapping:
 * - D0: Sensor Hujan Digital (LOW = Hujan, HIGH = Kering)
 * - D1: Motor Driver Pin Maju / A-IA / B-IA (Arah Menutup Atap)
 * - D2: Motor Driver Pin Mundur / A-IB / B-IB (Arah Membuka Atap)
 * - D3: Limit Switch Tutup (INPUT_PULLUP: LOW = Tertutup Penuh)
 * - D4: Limit Switch Buka (INPUT_PULLUP: LOW = Terbuka Penuh)
 * - A0: Sensor Hujan Analog
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ================= KONFIGURASI WIFI & MQTT =================
const char* WIFI_SSID     = "Raja suki";
const char* WIFI_PASS     = "anjlo123";

const char* MQTT_BROKER   = "broker.emqx.io";
const int   MQTT_PORT     = 1883;
const char* MQTT_USER     = "";
const char* MQTT_PASS     = "";
const char* DEVICE_ID     = "roof-001";

// ================= DEFINISI PIN HARDWARE ===================
const int pinSensorHujan = D0;  // Sensor hujan (Active LOW)
const int pinMotorMaju   = D1;  // Arah Menutup
const int pinMotorMundur = D2;  // Arah Membuka
const int pinLimitTutup  = D3;  // Tertekan saat atap tertutup penuh (INPUT_PULLUP)
const int pinLimitBuka   = D4;  // Tertekan saat atap terbuka penuh (INPUT_PULLUP)
const int pinAnalogHujan = A0;  // Analog input hujan

// ================= OBJEK & VARIABEL GLOBAL =================
WiFiClient espClient;
PubSubClient mqttClient(espClient);

String currentRoofStatus = "closed";  // "open" atau "closed"
String currentMode       = "auto";    // "auto" atau "manual"
String targetRoofAction  = "idle";    // "idle", "opening", "closing"
String pendingCommandId  = "";

unsigned long lastTelemetryTime = 0;
unsigned long lastHeartbeatTime = 0;
const unsigned long TELEMETRY_INTERVAL = 3000;   // Kirim telemetri setiap 3 detik
const unsigned long HEARTBEAT_INTERVAL = 10000;  // Kirim heartbeat setiap 10 detik

// ================= MOTOR CONTROL ===========================
void stopMotor() {
  digitalWrite(pinMotorMaju, LOW);
  digitalWrite(pinMotorMundur, LOW);
}

void sendCommandAck(String status, String detail) {
  if (pendingCommandId != "") {
    StaticJsonDocument<256> ack;
    ack["command_id"]  = pendingCommandId;
    ack["status"]      = status;
    ack["roof_status"] = currentRoofStatus;
    ack["detail"]      = detail;

    char ackBuffer[256];
    serializeJson(ack, ackBuffer);
    String ackTopic = String("atap/") + DEVICE_ID + "/command_ack";
    mqttClient.publish(ackTopic.c_str(), ackBuffer);
    Serial.print("[ACK] Dikirim: ");
    Serial.println(ackBuffer);

    pendingCommandId = "";
  }
}

void processMotor() {
  int limitTutup = digitalRead(pinLimitTutup);
  int limitBuka  = digitalRead(pinLimitBuka);

  if (targetRoofAction == "closing") {
    // Jika limit tutup belum tertekan (HIGH), motor terus jalan menutup
    if (limitTutup == HIGH) {
      digitalWrite(pinMotorMaju, HIGH);
      digitalWrite(pinMotorMundur, LOW);
    } else {
      // Limit tutup tertekan (LOW) -> berhenti
      stopMotor();
      targetRoofAction = "idle";
      currentRoofStatus = "closed";
      Serial.println("[MOTOR] Atap telah TERTUTUP PENUH.");
      sendCommandAck("succeeded", "Atap telah tertutup rapat.");
    }
  } else if (targetRoofAction == "opening") {
    // Jika limit buka belum tertekan (HIGH), motor terus jalan membuka
    if (limitBuka == HIGH) {
      digitalWrite(pinMotorMaju, LOW);
      digitalWrite(pinMotorMundur, HIGH);
    } else {
      // Limit buka tertekan (LOW) -> berhenti
      stopMotor();
      targetRoofAction = "idle";
      currentRoofStatus = "open";
      Serial.println("[MOTOR] Atap telah TERBUKA PENUH.");
      sendCommandAck("succeeded", "Atap telah terbuka penuh.");
    }
  } else {
    stopMotor();
  }
}

// ================= MQTT CALLBACK ===========================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("[MQTT] Diterima [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  String commandTopic = String("atap/") + DEVICE_ID + "/command";
  String modeTopic    = String("atap/") + DEVICE_ID + "/mode";

  // Tangani Perintah Kendali Buka/Tutup
  if (String(topic) == commandTopic) {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, message);
    if (!error) {
      const char* cmd   = doc["command"];
      const char* cmdId = doc["command_id"];
      pendingCommandId = cmdId ? String(cmdId) : "";

      int statusHujan = digitalRead(pinSensorHujan);

      if (String(cmd) == "open") {
        // Safety Lock: Jika sensor mendeteksi hujan (LOW), tolak membuka atap!
        if (statusHujan == LOW) {
          Serial.println("[SAFETY] Ditolak buka karena sensor mendeteksi hujan!");
          sendCommandAck("failed", "Kunci keselamatan aktif: sensor mendeteksi hujan.");
          return;
        }

        if (digitalRead(pinLimitBuka) == LOW) {
          Serial.println("[MOTOR] Atap sudah dalam posisi terbuka penuh.");
          currentRoofStatus = "open";
          sendCommandAck("succeeded", "Atap sudah dalam posisi terbuka.");
          return;
        }

        Serial.println("[COMMAND] Membuka atap...");
        targetRoofAction = "opening";
      } else if (String(cmd) == "close") {
        if (digitalRead(pinLimitTutup) == LOW) {
          Serial.println("[MOTOR] Atap sudah dalam posisi tertutup penuh.");
          currentRoofStatus = "closed";
          sendCommandAck("succeeded", "Atap sudah dalam posisi tertutup.");
          return;
        }

        Serial.println("[COMMAND] Menutup atap...");
        targetRoofAction = "closing";
      }
    }
  }

  // Tangani Pergantian Mode (auto / manual)
  if (String(topic) == modeTopic) {
    StaticJsonDocument<128> doc;
    if (!deserializeJson(doc, message)) {
      const char* mode = doc["mode"];
      if (mode != NULL) {
        currentMode = String(mode);
        Serial.print("[MODE] Berubah ke: ");
        Serial.println(currentMode);
      }
    }
  }
}

// ================= KONEKSI JARINGAN ========================
void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Menghubungkan ke WiFi ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi terhubung!");
  Serial.print("IP Address ESP8266: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Menghubungkan ke Broker MQTT...");
    String clientId = "ESP8266-" + String(DEVICE_ID) + "-" + String(random(0xffff), HEX);

    bool connected = false;
    if (strlen(MQTT_USER) > 0) {
      connected = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASS);
    } else {
      connected = mqttClient.connect(clientId.c_str());
    }

    if (connected) {
      Serial.println(" Terhubung!");

      String commandTopic = String("atap/") + DEVICE_ID + "/command";
      String modeTopic    = String("atap/") + DEVICE_ID + "/mode";
      mqttClient.subscribe(commandTopic.c_str());
      mqttClient.subscribe(modeTopic.c_str());

      Serial.print("Subscribed ke: ");
      Serial.println(commandTopic);
    } else {
      Serial.print(" Gagal, rc=");
      Serial.print(mqttClient.state());
      Serial.println(". Coba lagi dalam 5 detik...");
      delay(5000);
    }
  }
}

// ================= TELEMETRI & HEARTBEAT ===================
void sendTelemetry() {
  int statusHujan = digitalRead(pinSensorHujan);
  bool rainDetected = (statusHujan == LOW);

  int analogVal = analogRead(pinAnalogHujan);

  StaticJsonDocument<256> doc;
  doc["rain_detected"] = rainDetected;
  doc["rain_analog"]   = analogVal;
  doc["light_lux"]     = 450.0;
  doc["temperature"]   = 29.0;
  doc["humidity"]      = 65.0;

  char buffer[256];
  serializeJson(doc, buffer);

  String topic = String("atap/") + DEVICE_ID + "/sensors";
  mqttClient.publish(topic.c_str(), buffer);
  Serial.print("[TELEMETRY] ");
  Serial.println(buffer);
}

void sendHeartbeat() {
  if (digitalRead(pinLimitTutup) == LOW) {
    currentRoofStatus = "closed";
  } else if (digitalRead(pinLimitBuka) == LOW) {
    currentRoofStatus = "open";
  }

  StaticJsonDocument<128> doc;
  doc["roof_status"] = currentRoofStatus;
  doc["mode"]        = currentMode;
  doc["rssi"]        = WiFi.RSSI();

  char buffer[128];
  serializeJson(doc, buffer);

  String topic = String("atap/") + DEVICE_ID + "/status";
  mqttClient.publish(topic.c_str(), buffer);
  Serial.print("[HEARTBEAT] ");
  Serial.println(buffer);
}

// ================= SETUP & LOOP =============================
void setup() {
  Serial.begin(115200);

  pinMode(pinSensorHujan, INPUT);
  pinMode(pinMotorMaju, OUTPUT);
  pinMode(pinMotorMundur, OUTPUT);

  pinMode(pinLimitTutup, INPUT_PULLUP);
  pinMode(pinLimitBuka, INPUT_PULLUP);

  stopMotor();

  if (digitalRead(pinLimitTutup) == LOW) {
    currentRoofStatus = "closed";
  } else if (digitalRead(pinLimitBuka) == LOW) {
    currentRoofStatus = "open";
  }

  setupWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // 1. Jalankan proses motor dan limit switch
  processMotor();

  // 2. Logika Auto jika mode otomatis aktif
  if (currentMode == "auto" && targetRoofAction == "idle") {
    int statusHujan = digitalRead(pinSensorHujan);
    if (statusHujan == LOW) {
      // Hujan terdeteksi: jika limit tutup belum tertekan (HIGH), tutup atap
      if (digitalRead(pinLimitTutup) == HIGH) {
        Serial.println("[AUTO] Hujan terdeteksi! Menutup atap...");
        targetRoofAction = "closing";
      }
    } else {
      // Cuaca kering: jika limit buka belum tertekan (HIGH), buka atap
      if (digitalRead(pinLimitBuka) == HIGH) {
        Serial.println("[AUTO] Kering! Membuka atap...");
        targetRoofAction = "opening";
      }
    }
  }

  // 3. Pengiriman berkala Telemetri & Heartbeat
  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = currentMillis;
    sendTelemetry();
  }

  if (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
    lastHeartbeatTime = currentMillis;
    sendHeartbeat();
  }
}
