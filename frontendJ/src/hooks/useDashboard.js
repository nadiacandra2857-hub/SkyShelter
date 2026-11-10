import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';
import { useApp } from '../context/AppContext';

function getActiveLocationParams() {
  const params = {};
  try {
    const savedAdm4 = localStorage.getItem('sky_shelter_bmkg_adm4');
    if (savedAdm4) params.adm4 = savedAdm4;

    const savedCoords = localStorage.getItem('sky_shelter_selected_coords');
    if (savedCoords) {
      const parsed = JSON.parse(savedCoords);
      if (parsed?.lat) params.lat = parsed.lat;
      if (parsed?.lon) params.lon = parsed.lon;
    }
  } catch {
    // ignore
  }
  return params;
}

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isMockMode } = useApp();

  const fetchSummary = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const params = getActiveLocationParams();
      const summary = await dashboardService.getSummary(params);
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

    // Event listener jika lokasi cuaca diperbarui di halaman Cuaca
    const handleLocationChange = () => {
      fetchSummary(true);
    };

    window.addEventListener('roof:state_changed', handleStateChange);
    window.addEventListener('weather:location_changed', handleLocationChange);
    window.addEventListener('storage', handleLocationChange);

    // Auto-polling ringan setiap 15 detik jika online
    const interval = setInterval(() => {
      fetchSummary(true);
    }, 15000);

    return () => {
      window.removeEventListener('roof:state_changed', handleStateChange);
      window.removeEventListener('weather:location_changed', handleLocationChange);
      window.removeEventListener('storage', handleLocationChange);
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
