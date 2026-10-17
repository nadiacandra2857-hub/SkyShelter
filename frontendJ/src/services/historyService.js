import apiClient, { USE_MOCK_DATA, API_BASE_URL } from './apiClient';
import {
  mockActivities,
  mockSensorHistory,
  mockForecastHistory,
  mockEvaluation,
} from '../mocks/mockHistory';
import { exportToCsv } from '../utils/exportCsv';

export const historyService = {
  /**
   * Mengambil riwayat aktivitas sistem
   */
  async getActivities(params = {}) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 250));
      let filtered = [...mockActivities];
      if (params.event_type && params.event_type !== 'all') {
        filtered = filtered.filter((item) => item.event_type === params.event_type);
      }
      return {
        items: filtered,
        total: filtered.length,
        page: 1,
        page_size: 50,
        total_pages: 1,
      };
    }

    const response = await apiClient.get('/history/activities', { params });
    return response.data;
  },

  /**
   * Mengambil rekaman data sensor fisik (24 jam terakhir / periode)
   */
  async getSensors(params = {}) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 250));
      return {
        items: mockSensorHistory,
        total: mockSensorHistory.length,
        page: 1,
        page_size: 100,
        total_pages: 1,
      };
    }

    const response = await apiClient.get('/history/sensors', { params });
    return response.data;
  },

  /**
   * Mengambil riwayat prakiraan cuaca
   */
  async getForecasts(params = {}) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 250));
      return {
        items: mockForecastHistory,
        total: mockForecastHistory.length,
        page: 1,
        page_size: 100,
        total_pages: 1,
      };
    }

    const response = await apiClient.get('/history/forecasts', { params });
    return response.data;
  },

  /**
   * Mengambil hasil evaluasi akurasi, presisi, recall, dan F1 model Early-Close
   */
  async getEvaluation() {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 300));
      return mockEvaluation;
    }

    const response = await apiClient.get('/history/evaluation');
    return response.data;
  },

  /**
   * Ekspor data ke berkas CSV
   */
  async exportCsv(dataType = 'activities') {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      const dataToExport = dataType === 'sensors' ? mockSensorHistory : mockActivities;
      exportToCsv(dataToExport, `jemuran_${dataType}_${new Date().toISOString().slice(0, 10)}.csv`);
      return true;
    }

    // Mode FastAPI: GET /history/export?data_type=activities|sensors
    const response = await apiClient.get('/history/export', {
      params: { data_type: dataType },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jemuran_${dataType}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return true;
  },
};

export default historyService;
