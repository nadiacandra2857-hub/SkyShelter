import apiClient, { USE_MOCK_DATA } from './apiClient';

const SETTINGS_STORAGE_KEY = 'sky_shelter_settings';

const defaultSettings = {
  early_close_threshold: 80.0,
  forecast_horizon_minutes: 60,
  roof_stabilization_delay_seconds: 30,
  weather_poll_interval_minutes: 15,
  installation_location: 'DKI Jakarta (Kemayoran)',
  forecast_feature_enabled: true,
  device_synced_fields: ['roof_stabilization_delay_seconds'],
  backend_logic_fields: [
    'early_close_threshold',
    'forecast_horizon_minutes',
    'weather_poll_interval_minutes',
    'forecast_feature_enabled',
    'installation_location',
  ],
  updated_at: new Date().toISOString(),
};

export const settingsService = {
  /**
   * Mengambil konfigurasi parameter sistem
   */
  async getSettings() {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.warn(e);
      }
      return { ...defaultSettings };
    }

    const response = await apiClient.get('/settings');
    return response.data;
  },

  /**
   * Memperbarui konfigurasi sistem (PATCH /settings)
   */
  async updateSettings(updateData) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 350));
      const current = await this.getSettings();
      const updated = {
        ...current,
        ...updateData,
        updated_at: new Date().toISOString(),
      };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    }

    const response = await apiClient.patch('/settings', updateData);
    return response.data;
  },

  /**
   * Reset konfigurasi ke nilai default
   */
  async resetSettings() {
    if (USE_MOCK_DATA) {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      return { ...defaultSettings };
    }
    // Jika di API mode, kirim nilai default
    const response = await apiClient.patch('/settings', {
      early_close_threshold: 80.0,
      forecast_horizon_minutes: 60,
      roof_stabilization_delay_seconds: 30,
      weather_poll_interval_minutes: 15,
      forecast_feature_enabled: true,
    });
    return response.data;
  },
};

export default settingsService;
