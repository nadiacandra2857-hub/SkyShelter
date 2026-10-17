import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { USE_MOCK_DATA } from '../services/apiClient';
import deviceService from '../services/deviceService';
import { resetMockState, getMockState } from '../mocks/mockDashboard';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mockState, setMockState] = useState(USE_MOCK_DATA ? getMockState() : null);

  // Sync state if simulation events fire
  useEffect(() => {
    if (!USE_MOCK_DATA) return;
    const handleRoofStateChange = (e) => {
      setMockState(e.detail || getMockState());
    };
    window.addEventListener('roof:state_changed', handleRoofStateChange);
    return () => {
      window.removeEventListener('roof:state_changed', handleRoofStateChange);
    };
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
    return id;
  }, [dismissToast]);

  // Simulator Triggers
  const simulateRain = useCallback((rainDetected) => {
    if (!USE_MOCK_DATA) return;
    const updated = deviceService.simulateRainSensor(rainDetected);
    setMockState(updated);
    showToast(
      rainDetected
        ? '🌧️ Simulasi: Sensor Hujan Aktif! Atap ditutup otomatis oleh Safety Lock.'
        : '☀️ Simulasi: Sensor Hujan Kering.',
      rainDetected ? 'warning' : 'info'
    );
  }, [showToast]);

  const simulateConnection = useCallback((isOnline) => {
    if (!USE_MOCK_DATA) return;
    const updated = deviceService.simulateConnection(isOnline);
    setMockState(updated);
    showToast(
      isOnline
        ? '🟢 Simulasi: Perangkat ESP8266 terhubung kembali (Online).'
        : '🔴 Simulasi: Perangkat ESP8266 terputus (Offline).',
      isOnline ? 'success' : 'error'
    );
  }, [showToast]);

  const resetSimulator = useCallback(() => {
    if (!USE_MOCK_DATA) return;
    const reset = resetMockState();
    setMockState(reset);
    showToast('🔄 Simulator berhasil di-reset ke kondisi awal.', 'info');
    window.dispatchEvent(new CustomEvent('roof:state_changed', { detail: reset }));
  }, [showToast]);

  const value = {
    isMockMode: USE_MOCK_DATA,
    toasts,
    showToast,
    dismissToast,
    mockState,
    simulateRain,
    simulateConnection,
    resetSimulator,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
