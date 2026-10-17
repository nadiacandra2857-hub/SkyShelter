import { useState, useEffect, useCallback } from 'react';
import deviceService from '../services/deviceService';
import { useApp } from '../context/AppContext';

export function useDeviceControl(deviceId = 'roof-001') {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandStatus, setCommandStatus] = useState('idle'); // 'idle' | 'pending' | 'accepted' | 'succeeded' | 'failed' | 'timeout'
  const [commandFeedback, setCommandFeedback] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const { showToast, isMockMode } = useApp();

  const fetchStatus = useCallback(async () => {
    try {
      const status = await deviceService.getDeviceStatus(deviceId);
      setDevice(status);
    } catch (err) {
      console.warn('Gagal memuat status perangkat:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchStatus();

    const handleStateChange = (e) => {
      if (e.detail) {
        setDevice((prev) => ({
          ...prev,
          roof_status: e.detail.roof_status,
          mode: e.detail.mode,
          rain_detected: e.detail.rain_detected,
          connection_status: e.detail.connection_status,
        }));
      } else {
        fetchStatus();
      }
    };

    window.addEventListener('roof:state_changed', handleStateChange);
    return () => {
      window.removeEventListener('roof:state_changed', handleStateChange);
    };
  }, [fetchStatus]);

  const sendCommand = async (command) => {
    const startTime = performance.now();
    setCommandStatus('pending');
    setCommandFeedback(`Mengirim perintah ${command.toUpperCase()} ke kontroler atap...`);

    try {
      const res = await deviceService.sendCommand(deviceId, command);
      const elapsed = Math.round(performance.now() - startTime);
      setResponseTime(elapsed);
      setCommandStatus(res.status || 'succeeded');
      setCommandFeedback(res.detail || `Perintah ${command} berhasil diproses (${elapsed} ms).`);

      const historyEntry = {
        id: res.command_id || 'cmd-' + Date.now(),
        command,
        status: res.status || 'succeeded',
        detail: res.detail,
        timestamp: new Date().toISOString(),
        responseTime: elapsed,
      };
      setCommandHistory((prev) => [historyEntry, ...prev].slice(0, 10));

      showToast(
        `Perintah ${command === 'open' ? 'BUKA' : 'TUTUP'} atap berhasil dikirim.`,
        'success'
      );

      // Refresh status perangkat
      await fetchStatus();
      return res;
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setResponseTime(elapsed);
      setCommandStatus('failed');
      const errorMsg = err?.message || 'Gagal mengirim perintah ke perangkat.';
      setCommandFeedback(errorMsg);

      const historyEntry = {
        id: 'cmd-err-' + Date.now(),
        command,
        status: 'failed',
        detail: errorMsg,
        timestamp: new Date().toISOString(),
        responseTime: elapsed,
      };
      setCommandHistory((prev) => [historyEntry, ...prev].slice(0, 10));

      showToast(errorMsg, 'error', 6000);
      throw err;
    }
  };

  const updateMode = async (newMode) => {
    try {
      const res = await deviceService.updateMode(deviceId, newMode);
      setDevice((prev) => ({ ...prev, mode: newMode }));
      showToast(
        `Mode sistem berhasil diubah ke ${newMode === 'auto' ? 'Otomatis' : 'Manual'}.`,
        'success'
      );
      return res;
    } catch (err) {
      const errorMsg = err?.message || 'Gagal mengubah mode sistem.';
      showToast(errorMsg, 'error');
      throw err;
    }
  };

  return {
    device,
    loading,
    commandStatus,
    commandFeedback,
    responseTime,
    commandHistory,
    sendCommand,
    updateMode,
    refetch: fetchStatus,
    isMockMode,
  };
}

export default useDeviceControl;
