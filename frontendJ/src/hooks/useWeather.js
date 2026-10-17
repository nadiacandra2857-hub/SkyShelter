import { useState, useEffect, useCallback } from 'react';
import weatherService from '../services/weatherService';
import { useApp } from '../context/AppContext';

export function useWeather() {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { showToast, isMockMode } = useApp();

  const fetchWeatherData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const [currentRes, forecastRes, statusRes] = await Promise.all([
        weatherService.getCurrentWeather(),
        weatherService.getForecast(),
        weatherService.getWeatherStatus(),
      ]);
      setCurrent(currentRes);
      setForecast(forecastRes);
      setStatus(statusRes);
    } catch (err) {
      setError(err?.message || 'Gagal memuat data prakiraan cuaca.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await weatherService.refreshWeather();
      showToast(res.message || 'Data cuaca berhasil diperbarui.', 'success');
      await fetchWeatherData(true);
      return res;
    } catch (err) {
      showToast(err?.message || 'Gagal merefresh cuaca dari provider.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  return {
    current,
    forecast,
    status,
    loading,
    refreshing,
    error,
    refresh,
    isMockMode,
  };
}

export default useWeather;
