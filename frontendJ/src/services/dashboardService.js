import apiClient, { USE_MOCK_DATA } from './apiClient';
import { getMockState } from '../mocks/mockDashboard';

export const dashboardService = {
  /**
   * Mengambil agregasi lengkap status atap, cuaca, telemetri, dan histori
   */
  async getSummary(params = {}) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 350));
      return getMockState();
    }

    const response = await apiClient.get('/dashboard/summary', { params });
    return response.data;
  },

  /**
   * Mengambil status instan dan keputusan sistem saja
   */
  async getStatus(params = {}) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      const state = getMockState();
      return {
        device_id: state.device_id,
        roof_status: state.roof_status,
        mode: state.mode,
        rain_sensor: state.rain_sensor,
        rain_detected: state.rain_detected,
        light_status: state.light_status,
        light_lux: state.light_lux,
        temperature: state.temperature,
        humidity: state.humidity,
        connection_status: state.connection_status,
        decision: state.decision,
        decision_reason: state.decision_reason,
        early_close_recommended: state.early_close_recommended,
        last_updated: state.last_updated,
      };
    }

    const response = await apiClient.get('/dashboard/status', { params });
    return response.data;
  },
};

export default dashboardService;
