import apiClient, { USE_MOCK_DATA } from './apiClient';
import {
  mockCurrentWeather,
  mockForecastDetail,
  mockWeatherStatus,
} from '../mocks/mockWeather';

export const weatherService = {
  /**
   * Mengambil kondisi cuaca terkini
   */
  async getCurrentWeather() {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 250));
      return {
        ...mockCurrentWeather,
        fetched_at: new Date().toISOString(),
      };
    }

    const response = await apiClient.get('/weather/current');
    return response.data;
  },

  /**
   * Mengambil prakiraan cuaca detail dan titik data per periode
   */
  async getForecast() {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 350));
      return {
        ...mockForecastDetail,
        fetched_at: new Date().toISOString(),
      };
    }

    const response = await apiClient.get('/weather/forecast');
    return response.data;
  },

  /**
   * Mengambil status kesehatan & cache API cuaca
   */
  async getWeatherStatus() {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        ...mockWeatherStatus,
        last_successful_fetch: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        cache_expires_at: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
      };
    }

    const response = await apiClient.get('/weather/status');
    return response.data;
  },

  /**
   * Meminta backend merefresh data dari BMKG / OpenWeatherMap (POST /weather/refresh)
   */
  async refreshWeather() {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 600));
      return {
        success: true,
        message: 'Data cuaca regional BMKG berhasil diperbarui dari satelit simulasi.',
        weather: {
          ...mockCurrentWeather,
          fetched_at: new Date().toISOString(),
          is_stale: false,
          is_cached: false,
        },
      };
    }

    const response = await apiClient.post('/weather/refresh');
    return response.data;
  },
};

export default weatherService;
