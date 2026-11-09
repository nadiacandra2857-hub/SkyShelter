/**
 * Mock Data untuk Riwayat Aktivitas, Rekaman Sensor, dan Evaluasi Model Cuaca
 */

const baseTime = Date.now();

// 1. Riwayat Aktivitas Sistem
export const mockActivities = [
  {
    id: 201,
    device_id: 'roof-001',
    event_type: 'roof_movement',
    source: 'auto_early_close',
    cause: 'Prakiraan hujan Open-Meteo melampaui 80% (86% terdeteksi)',
    result: 'Atap ditutup otomatis sebelum hujan turun (Early-Close Succeeded)',
    created_at: new Date(baseTime - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 200,
    device_id: 'roof-001',
    event_type: 'forecast_update',
    source: 'weather_sync',
    cause: 'Siklus polling rutin 15 menit',
    result: 'Probabilitas hujan diperbarui dari 70% menjadi 86%',
    created_at: new Date(baseTime - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 199,
    device_id: 'roof-001',
    event_type: 'rain_event',
    source: 'local_sensor',
    cause: 'Sensor hujan mendeteksi tetesan air (analog: 380)',
    result: 'Status sensor berubah menjadi Hujan Terdeteksi',
    created_at: new Date(baseTime - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 198,
    device_id: 'roof-001',
    event_type: 'roof_movement',
    source: 'safety_lock',
    cause: 'Sensor hujan fisik mendeteksi air hujan aktif',
    result: 'Kunci keselamatan aktif: atap ditutup dan terkunci',
    created_at: new Date(baseTime - 46 * 60 * 1000).toISOString(),
  },
  {
    id: 197,
    device_id: 'roof-001',
    event_type: 'mode_change',
    source: 'web_dashboard',
    cause: 'Perubahan preferensi pengguna dari manual ke otomatis',
    result: 'Mode operasi disetel ke Otomatis',
    created_at: new Date(baseTime - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 196,
    device_id: 'roof-001',
    event_type: 'roof_movement',
    source: 'manual_command',
    cause: 'Perintah Buka Atap dikirim oleh pengguna',
    result: 'Motor membuka atap ke posisi 100%',
    created_at: new Date(baseTime - 180 * 60 * 1000).toISOString(),
  },
  {
    id: 195,
    device_id: 'roof-001',
    event_type: 'forecast_update',
    source: 'weather_sync',
    cause: 'Pembaruan data prakiraan cuaca regional',
    result: 'Probabilitas hujan 25% (Kondisi Cerah Berawan)',
    created_at: new Date(baseTime - 240 * 60 * 1000).toISOString(),
  },
  {
    id: 194,
    device_id: 'roof-001',
    event_type: 'rain_event',
    source: 'local_sensor',
    cause: 'Sensor kering setelah periode jeda stabilisasi',
    result: 'Status sensor kembali Kering',
    created_at: new Date(baseTime - 360 * 60 * 1000).toISOString(),
  },
  {
    id: 193,
    device_id: 'roof-001',
    event_type: 'system_boot',
    source: 'esp8266_firmware',
    cause: 'Koneksi perangkat ESP8266 terhubung ke gateway',
    result: 'Heartbeat online stabil (RSSI: -64 dBm)',
    created_at: new Date(baseTime - 480 * 60 * 1000).toISOString(),
  },
];

// 2. Riwayat Sensor (24 Jam terakhir untuk grafik)
export const mockSensorHistory = Array.from({ length: 24 }).map((_, index) => {
  const time = new Date(baseTime - (23 - index) * 60 * 60 * 1000);
  const hour = time.getHours();
  // Simulasi hujan pada siang-sore (jam 13-15)
  const isRainyPeriod = hour >= 13 && hour <= 15;
  const isRain = isRainyPeriod || (index === 23); // titik terbaru basah/kering
  const analogValue = isRain ? 320 + Math.floor(Math.random() * 80) : 1023;
  const lightLux = hour >= 6 && hour <= 18 ? 400 + Math.sin((hour - 6) / 12 * Math.PI) * 500 : 10 + Math.random() * 20;

  return {
    id: index + 1,
    device_id: 'roof-001',
    rain_detected: isRain,
    rain_status: isRain ? 'rain_detected' : 'dry',
    rain_analog_value: analogValue,
    light_status: lightLux > 300 ? 'bright' : 'dark',
    light_lux: Math.round(lightLux),
    temperature: +(27 + Math.sin(hour / 24 * Math.PI * 2) * 4).toFixed(1),
    humidity: +(isRain ? 82 + Math.random() * 8 : 60 + Math.random() * 10).toFixed(1),
    recorded_at: time.toISOString(),
  };
});

// 3. Riwayat Prediksi Cuaca (24 Jam terakhir untuk grafik perbandingan)
export const mockForecastHistory = Array.from({ length: 24 }).map((_, index) => {
  const time = new Date(baseTime - (23 - index) * 60 * 60 * 1000);
  const hour = time.getHours();
  let prob = 15;
  if (hour >= 11 && hour <= 17) {
    prob = 50 + (hour === 14 ? 36 : Math.floor(Math.random() * 25));
  } else if (index === 23) {
    prob = 86;
  }

  return {
    id: index + 1,
    provider: 'open-meteo',
    location: 'DKI Jakarta',
    probability_of_rain: prob,
    forecast_horizon_minutes: 60,
    weather_condition: prob >= 80 ? 'Hujan Sedang' : prob >= 50 ? 'Berawan Tebal' : 'Cerah Berawan',
    temperature: +(27 + Math.sin(hour / 24 * Math.PI * 2) * 3).toFixed(1),
    forecast_at: new Date(time.getTime() + 60 * 60 * 1000).toISOString(),
    fetched_at: time.toISOString(),
    is_stale: false,
    status: 'success',
  };
});

// 4. Metrik Evaluasi Model Prakiraan vs Realita Sensor
export const mockEvaluation = {
  status: 'evaluated',
  message: 'Evaluasi performa prediksi satelit vs deteksi sensor fisik lokal selama 30 hari terakhir.',
  threshold_used: 80.0,
  horizon_minutes_used: 60,
  evaluated_records_count: 120,
  metrics: {
    total_evaluated: 120,
    true_positives: 38, // Diprediksi hujan & sensor lokal basah (Early-Close berhasil melindungi jemuran)
    false_positives: 4,  // Diprediksi hujan tapi sensor tidak basah (Tutup preventif aman)
    true_negatives: 74, // Diprediksi kering & sensor kering (Atap tetap terbuka maksimal)
    false_negatives: 4,  // Tidak diprediksi tapi tiba-tiba hujan lokal (Sensor langsung menutup darurat)
    accuracy: 0.933,
    precision: 0.905,
    recall: 0.905,
    f1_score: 0.905,
  },
  evaluation_period: {
    start: new Date(baseTime - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(baseTime).toISOString(),
  },
};
