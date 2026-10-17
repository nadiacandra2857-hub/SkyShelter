import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';
import { useApp } from '../context/AppContext';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isMockMode } = useApp();

  const fetchSummary = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch (err) {
      setError(err?.message || 'Gagal memuat ringkasan dashboard.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();

    // Event listener jika ada perubahan status atap di simulator
    const handleStateChange = (e) => {
      if (e.detail) {
        setData((prev) => (prev ? { ...prev, ...e.detail } : e.detail));
      } else {
        fetchSummary(true);
      }
    };

    window.addEventListener('roof:state_changed', handleStateChange);

    // Auto-polling ringan setiap 15 detik jika online
    const interval = setInterval(() => {
      fetchSummary(true);
    }, 15000);

    return () => {
      window.removeEventListener('roof:state_changed', handleStateChange);
      clearInterval(interval);
    };
  }, [fetchSummary]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchSummary(false),
    isMockMode,
  };
}

export default useDashboard;
