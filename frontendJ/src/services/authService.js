import apiClient, { USE_MOCK_DATA, tokenStorage } from './apiClient';

const MOCK_USER_STORAGE_KEY = 'sky_shelter_mock_user';

export const authService = {
  /**
   * Login ke sistem (Mock atau FastAPI)
   */
  async login(username, password) {
    if (USE_MOCK_DATA) {
      // Simulasi delay jaringan realistis
      await new Promise((r) => setTimeout(r, 650));

      if (!username || !password) {
        throw { message: 'Username dan password wajib diisi.' };
      }

      if (password.length < 4) {
        throw { message: 'Password minimal 4 karakter.' };
      }

      const mockUser = {
        id: 1,
        username: username.trim(),
        email: `${username.trim().toLowerCase()}@jemuran.local`,
        is_admin: true,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const mockResponse = {
        access_token: 'mock-jwt-token-jemuran-' + Date.now(),
        token_type: 'bearer',
        expires_in_minutes: 60,
        user: mockUser,
      };

      tokenStorage.set(mockResponse.access_token);
      sessionStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(mockUser));
      return mockResponse;
    }

    // Mode FastAPI Backend: POST /auth/login
    const response = await apiClient.post('/auth/login', {
      username: username.trim(),
      password,
    });

    if (response.data?.access_token) {
      tokenStorage.set(response.data.access_token);
    }

    return response.data;
  },

  /**
   * Mengambil data profil pengguna yang sedang login
   */
  async getCurrentUser() {
    if (USE_MOCK_DATA) {
      const token = tokenStorage.get();
      if (!token) return null;

      try {
        const saved = sessionStorage.getItem(MOCK_USER_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn(e);
      }

      return {
        id: 1,
        username: 'admin',
        email: 'admin@jemuran.local',
        is_admin: true,
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }

    // Mode FastAPI: GET /auth/me
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Logout dari sistem
   */
  async logout() {
    try {
      if (!USE_MOCK_DATA) {
        await apiClient.post('/auth/logout');
      }
    } catch (e) {
      console.warn('Logout server notification failed:', e);
    } finally {
      tokenStorage.remove();
      sessionStorage.removeItem(MOCK_USER_STORAGE_KEY);
    }
    return true;
  },

  /**
   * Cek ketersediaan token aktif
   */
  isAuthenticated() {
    return !!tokenStorage.get();
  },
};

export default authService;
