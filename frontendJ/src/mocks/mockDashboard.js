/**
 * Mock Data & Simulator untuk Dashboard & Status Perangkat
 * Sesuai dengan skema backend FastAPI: DashboardSummaryResponse & DashboardStatusResponse
 */

const STORAGE_KEY_STATE = 'sky_shelter_mock_state';

const defaultState = {
  device_id: 'roof-001',
  roof_status: 'closed', // 'open' | 'closed' | 'opening' | 'closing' | 'unknown'
  mode: 'auto', // 'auto' | 'manual'
  rain_sensor: 'disabled', // 'dry' | 'rain_detected' | 'unknown' | 'disabled'
  rain_detected: false,
  rain_analog_value: null, // dinonaktifkan sementara karena hardware ESP belum ada
  light_status: 'bright',
  light_lux: 680.0,
  temperature: 29.5,
  humidity: 65.0,
  connection_status: 'online', // 'online' | 'offline' | 'unknown'
  decision: 'early_close', // 'normal' | 'standby' | 'early_close' | 'rain_detected' | 'unavailable'
  decision_reason: 'Probabilitas presipitasi 86% melampaui ambang batas 80% dalam 60 menit ke depan. Sistem melakukan penutupan preventif.',
  early_close_recommended: true,
  last_updated: new Date().toISOString(),
  is_simulation: true,
  weather_summary: {
    provider: 'open-meteo',
    location: 'Genteng, Surabaya (Open-Meteo 15-Min)',
    probability_of_rain: 86.0,
    weather_condition: 'Hujan Sedang',
    temperature: 28.0,
    humidity: 78.0,
    forecast_horizon_minutes: 60,
    forecast_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    fetched_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    is_stale: false,
    is_cached: true,
    status: 'success',
  },
  recent_activities: [
    {
      id: 105,
      event_type: 'roof_movement',
      source: 'auto_early_close',
      cause: 'Probabilitas hujan mencapai 86% (ambang: 80%)',
      result: 'Atap ditutup secara otomatis untuk perlindungan jemuran',
      created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
    {
      id: 104,
      event_type: 'forecast_update',
      source: 'weather_sync',
      cause: 'Sinkronisasi berkala data cuaca regional',
      result: 'Data prakiraan cuaca 60 menit ke depan diperbarui (86% hujan)',
      created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 103,
      event_type: 'mode_change',
      source: 'user_interface',
      cause: 'Pengguna mengaktifkan mode kendali otomatis',
      result: 'Sistem beralih ke Mode Otomatis',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 102,
      event_type: 'roof_movement',
      source: 'manual_command',
      cause: 'Perintah buka atap oleh pengguna',
      result: 'Atap berhasil dibuka penuh',
      created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    },
    {
      id: 101,
      event_type: 'system_boot',
      source: 'firmware',
      cause: 'Inisialisasi koneksi kontroler ESP8266',
      result: 'Perangkat terhubung ke backend gateway',
      created_at: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    },
  ],
};

export function getMockState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_STATE);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch (e) {
    console.warn('Gagal membaca mock state dari localStorage:', e);
  }
  return { ...defaultState };
}

export function saveMockState(newState) {
  try {
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(newState));
  } catch (e) {
    console.warn('Gagal menyimpan mock state ke localStorage:', e);
  }
  return newState;
}

export function resetMockState() {
  try {
    localStorage.removeItem(STORAGE_KEY_STATE);
  } catch (e) {
    console.warn(e);
  }
  return { ...defaultState };
}

export const initialMockDashboardSummary = defaultState;
