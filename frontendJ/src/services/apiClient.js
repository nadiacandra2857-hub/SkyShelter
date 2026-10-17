import axios from 'axios';

// Konfigurasi Environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || import.meta.env.VITE_USE_MOCK_DATA === true;

// Key penyimpanan token
const TOKEN_STORAGE_KEY = 'sky_shelter_access_token';

export const tokenStorage = {
  get: () => {
    try {
      return sessionStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (e) {
      console.warn('Gagal menyimpan token ke sessionStorage:', e);
    }
  },
  remove: () => {
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      console.warn('Gagal menghapus token:', e);
    }
  },
};

// Axios Instance Terpusat
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Injeksi Bearer JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standarisasi Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // 401 Unauthorized: Sesi berakhir
      if (status === 401) {
        tokenStorage.remove();
        // Beri tahu auth listener tanpa full page reload jika memungkinkan
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      // Ambil pesan error dari FastAPI detail
      const message =
        typeof data?.detail === 'string'
          ? data.detail
          : Array.isArray(data?.detail)
          ? data.detail.map((d) => d.msg || d.message).join(', ')
          : data?.message || `Terjadi kesalahan pada server (HTTP ${status})`;

      return Promise.reject({
        status,
        message,
        data,
        isAxiosError: true,
      });
    }

    if (error.request) {
      // Masalah jaringan atau backend offline
      return Promise.reject({
        status: 0,
        message: 'Tidak dapat terhubung ke server backend FastAPI. Pastikan server aktif di ' + API_BASE_URL,
        isNetworkError: true,
      });
    }

    return Promise.reject({
      status: -1,
      message: error.message || 'Terjadi kesalahan sistem yang tidak diketahui',
    });
  }
);

export default apiClient;
