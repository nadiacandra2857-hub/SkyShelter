import { useState, useEffect, useCallback } from 'react';
import historyService from '../services/historyService';
import { useApp } from '../context/AppContext';

export function useHistory() {
  const [activities, setActivities] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const { showToast, isMockMode } = useApp();

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [actRes, sensRes, fcRes, evalRes] = await Promise.all([
        historyService.getActivities({ event_type: categoryFilter }),
        historyService.getSensors({ range: timeRangeFilter }),
        historyService.getForecasts({ range: timeRangeFilter }),
        historyService.getEvaluation(),
      ]);

      setActivities(actRes.items || []);
      setSensors(sensRes.items || []);
      setForecasts(fcRes.items || []);
      setEvaluation(evalRes);
    } catch (err) {
      setError(err?.message || 'Gagal memuat riwayat dan evaluasi.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, timeRangeFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleExport = async (dataType = 'activities') => {
    setExporting(true);
    try {
      await historyService.exportCsv(dataType);
      showToast(
        `Berkas CSV ${dataType === 'sensors' ? 'rekaman sensor' : 'riwayat aktivitas'} berhasil diunduh.`,
        'success'
      );
    } catch (err) {
      showToast(err?.message || 'Gagal mengekspor data CSV.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return {
    activities,
    sensors,
    forecasts,
    evaluation,
    categoryFilter,
    setCategoryFilter,
    timeRangeFilter,
    setTimeRangeFilter,
    loading,
    exporting,
    error,
    refetch: fetchHistory,
    exportCsv: handleExport,
    isMockMode,
  };
}

export default useHistory;
