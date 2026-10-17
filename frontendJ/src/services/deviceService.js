import apiClient, { USE_MOCK_DATA } from './apiClient';
import { getMockState, saveMockState } from '../mocks/mockDashboard';

export const deviceService = {
  /**
   * Mengambil daftar seluruh perangkat atap
   */
  async getDevices() {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      return [
        {
          id: 1,
          device_id: 'roof-001',
          name: 'Atap Jemuran Utama',
          mode: getMockState().mode,
          roof_status: getMockState().roof_status,
          connection_status: getMockState().connection_status,
          is_active: true,
          last_seen: new Date().toISOString(),
        },
      ];
    }

    const response = await apiClient.get('/devices');
    return response.data;
  },

  /**
   * Mengambil status detail perangkat
   */
  async getDeviceStatus(deviceId = 'roof-001') {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      const state = getMockState();
      return {
        device_id: deviceId,
        roof_status: state.roof_status,
        mode: state.mode,
        rain_detected: state.rain_detected,
        rain_status: state.rain_sensor,
        light_lux: state.light_lux,
        temperature: state.temperature,
        humidity: state.humidity,
        connection_status: state.connection_status,
        last_heartbeat: new Date().toISOString(),
      };
    }

    const response = await apiClient.get(`/devices/${deviceId}/status`);
    return response.data;
  },

  /**
   * Mengirim perintah kendali atap: 'open' | 'close'
   */
  async sendCommand(deviceId = 'roof-001', command) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 400));
      const state = getMockState();

      // Aturan Keselamatan: Kunci hujan lokal (Safety Lock)
      if (command === 'open' && state.rain_detected) {
        throw {
          status: 400,
          message: 'Perintah buka atap DITOLAK oleh Safety Lock: Sensor lokal mendeteksi presipitasi hujan aktif demi melindungi jemuran.',
        };
      }

      // Validasi state sudah sama
      if (command === 'open' && state.roof_status === 'open') {
        return {
          command_id: 'mock-cmd-' + Date.now(),
          device_id: deviceId,
          command,
          status: 'succeeded',
          detail: 'Atap sudah berada dalam posisi terbuka penuh.',
          issued_at: new Date().toISOString(),
          executed_at: new Date().toISOString(),
        };
      }
      if (command === 'close' && state.roof_status === 'closed') {
        return {
          command_id: 'mock-cmd-' + Date.now(),
          device_id: deviceId,
          command,
          status: 'succeeded',
          detail: 'Atap sudah berada dalam posisi tertutup rapat.',
          issued_at: new Date().toISOString(),
          executed_at: new Date().toISOString(),
        };
      }

      // Ubah status transisi terlebih dahulu
      const transitioningStatus = command === 'open' ? 'opening' : 'closing';
      state.roof_status = transitioningStatus;
      state.last_updated = new Date().toISOString();
      saveMockState(state);

      // Buat activity log
      const newActivity = {
        id: Date.now(),
        event_type: 'roof_movement',
        source: 'manual_command',
        cause: `Perintah manual ${command.toUpperCase()} dari antarmuka pengguna`,
        result: `Motor atap mulai ${command === 'open' ? 'membuka kanopi' : 'menutup kanopi'}`,
        created_at: new Date().toISOString(),
      };
      state.recent_activities = [newActivity, ...(state.recent_activities || [])].slice(0, 15);
      saveMockState(state);

      // Kembalikan respons accepted
      const commandResponse = {
        command_id: 'mock-cmd-' + Date.now(),
        device_id: deviceId,
        command,
        status: 'accepted',
        detail: `Perintah ${command} diterima simulator, motor sedang bergerak...`,
        issued_at: new Date().toISOString(),
        executed_at: null,
      };

      // Jalankan penyelesaian gerakan (1.8 detik kemudian di simulator)
      setTimeout(() => {
        const finalState = getMockState();
        finalState.roof_status = command === 'open' ? 'open' : 'closed';
        finalState.last_updated = new Date().toISOString();
        const finishActivity = {
          id: Date.now() + 1,
          event_type: 'roof_movement',
          source: 'esp8266_ack',
          cause: `Konfirmasi limit switch fisik ${finalState.roof_status}`,
          result: `Atap telah berhasil ${command === 'open' ? 'terbuka 100%' : 'tertutup rapat'}`,
          created_at: new Date().toISOString(),
        };
        finalState.recent_activities = [finishActivity, ...(finalState.recent_activities || [])].slice(0, 15);
        saveMockState(finalState);
        window.dispatchEvent(new CustomEvent('roof:state_changed', { detail: finalState }));
      }, 1800);

      return commandResponse;
    }

    // Mode FastAPI REST API: POST /devices/{device_id}/commands
    const response = await apiClient.post(`/devices/${deviceId}/commands`, {
      command,
    });
    return response.data;
  },

  /**
   * Mengubah mode operasi perangkat: 'auto' | 'manual'
   */
  async updateMode(deviceId = 'roof-001', mode) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 300));
      const state = getMockState();
      state.mode = mode;
      state.last_updated = new Date().toISOString();

      const newActivity = {
        id: Date.now(),
        event_type: 'mode_change',
        source: 'user_interface',
        cause: `Pengguna mengubah mode sistem ke ${mode === 'auto' ? 'Otomatis' : 'Manual'}`,
        result: `Sistem beroperasi dalam mode ${mode === 'auto' ? 'Otomatis (Prakiraan + Sensor)' : 'Manual (Kendali Pengguna)'}`,
        created_at: new Date().toISOString(),
      };
      state.recent_activities = [newActivity, ...(state.recent_activities || [])].slice(0, 15);
      saveMockState(state);

      window.dispatchEvent(new CustomEvent('roof:state_changed', { detail: state }));

      return {
        device_id: deviceId,
        mode,
        message: `Mode operasi berhasil diubah ke ${mode}.`,
        updated_at: new Date().toISOString(),
      };
    }

    // Mode FastAPI: PATCH /devices/{device_id}/mode
    const response = await apiClient.patch(`/devices/${deviceId}/mode`, {
      mode,
    });
    return response.data;
  },

  /**
   * Simulator trigger: toggle sensor hujan lokal untuk pengujian manual
   */
  simulateRainSensor(rainDetected) {
    if (!USE_MOCK_DATA) return;
    const state = getMockState();
    state.rain_detected = rainDetected;
    state.rain_sensor = rainDetected ? 'rain_detected' : 'dry';
    state.rain_analog_value = rainDetected ? 310 : 1023;
    state.last_updated = new Date().toISOString();

    if (rainDetected) {
      state.decision = 'rain_detected';
      state.decision_reason = 'Sensor hujan lokal mendeteksi air hujan aktif. Atap ditutup secara darurat.';
      // Jika mode auto atau sedang buka, otomatis tutup kanopi
      if (state.mode === 'auto' || state.roof_status === 'open') {
        state.roof_status = 'closed';
      }
      const rainActivity = {
        id: Date.now(),
        event_type: 'rain_event',
        source: 'local_sensor',
        cause: 'Sensor hujan fisik mendeteksi presipitasi aktif (Nilai analog: 310)',
        result: 'Sistem memicu penutupan darurat demi keselamatan jemuran',
        created_at: new Date().toISOString(),
      };
      state.recent_activities = [rainActivity, ...(state.recent_activities || [])].slice(0, 15);
    } else {
      state.decision = state.weather_summary?.probability_of_rain >= 80 ? 'early_close' : 'normal';
      state.decision_reason = state.decision === 'early_close'
        ? 'Sensor kering, namun probabilitas hujan tinggi (> 80%). Atap tetap ditutup lebih awal.'
        : 'Sensor hujan kering dan cuaca normal.';
      const dryActivity = {
        id: Date.now(),
        event_type: 'rain_event',
        source: 'local_sensor',
        cause: 'Permukaan sensor kembali kering setelah jeda stabilisasi',
        result: 'Deteksi hujan fisik selesai',
        created_at: new Date().toISOString(),
      };
      state.recent_activities = [dryActivity, ...(state.recent_activities || [])].slice(0, 15);
    }

    saveMockState(state);
    window.dispatchEvent(new CustomEvent('roof:state_changed', { detail: state }));
    return state;
  },

  /**
   * Simulator trigger: toggle koneksi online/offline
   */
  simulateConnection(isOnline) {
    if (!USE_MOCK_DATA) return;
    const state = getMockState();
    state.connection_status = isOnline ? 'online' : 'offline';
    state.last_updated = new Date().toISOString();
    saveMockState(state);
    window.dispatchEvent(new CustomEvent('roof:state_changed', { detail: state }));
    return state;
  },
};

export default deviceService;
