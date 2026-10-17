import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Download,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
  Droplets,
  Sliders,
  CloudRain,
  Minimize2,
} from 'lucide-react';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import RainHistoryChart from '../components/charts/RainHistoryChart';
import ForecastChart from '../components/charts/ForecastChart';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import useHistory from '../hooks/useHistory';
import { formatTime, formatDateTime, formatRelativeTime } from '../utils/formatDate';

export function HistoryPage() {
  const {
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
    refetch,
    exportCsv,
  } = useHistory();

  const [activeTab, setActiveTab] = useState('activities'); // 'activities' | 'charts' | 'evaluation'

  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'roof_movement', label: 'Pergerakan Atap' },
    { id: 'rain_event', label: 'Sensor Hujan' },
    { id: 'mode_change', label: 'Perubahan Mode' },
    { id: 'forecast_update', label: 'Pembaruan Cuaca' },
  ];

  const timeRanges = [
    { id: '24h', label: '24 Jam Terakhir' },
    { id: '7d', label: '7 Hari Terakhir' },
    { id: '30d', label: '30 Hari Terakhir' },
  ];

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'roof_movement':
        return Minimize2;
      case 'rain_event':
        return Droplets;
      case 'mode_change':
        return Sliders;
      case 'forecast_update':
        return CloudRain;
      default:
        return Cpu;
    }
  };

  if (loading && activities.length === 0) {
    return <LoadingState message="Memuat rekaman data histori & evaluasi model..." />;
  }

  if (error && activities.length === 0) {
    return (
      <ErrorState
        title="Gagal Memuat Riwayat"
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest">
            <History className="w-3.5 h-3.5" />
            <span>Audit & Evaluasi Sistem</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-charcoal font-sans mt-0.5">
            Riwayat Aktivitas & Evaluasi Cuaca
          </h2>
          <p className="text-xs text-muted-gray mt-0.5">
            Log telemetri komprehensif, performa deteksi hujan, dan ekspor data CSV
          </p>
        </div>

        {/* Export CSV Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCsv('sensors')}
            isLoading={exporting}
            leftIcon={Download}
            className="bg-white"
          >
            Ekspor CSV Sensor
          </Button>
          <Button
            variant="forest"
            size="sm"
            onClick={() => exportCsv('activities')}
            isLoading={exporting}
            leftIcon={Download}
          >
            Ekspor CSV Log
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-sage/20 space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={`pb-3 text-xs md:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'activities'
              ? 'border-forest text-forest'
              : 'border-transparent text-muted-gray hover:text-charcoal'
          }`}
        >
          Daftar Log Aktivitas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={`pb-3 text-xs md:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'charts'
              ? 'border-forest text-forest'
              : 'border-transparent text-muted-gray hover:text-charcoal'
          }`}
        >
          Grafik Telemetri Sensor & Cuaca
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evaluation')}
          className={`pb-3 text-xs md:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'evaluation'
              ? 'border-forest text-forest'
              : 'border-transparent text-muted-gray hover:text-charcoal'
          }`}
        >
          Metrik Evaluasi Early-Close
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-sage/30 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <Filter className="w-4 h-4 text-forest flex-shrink-0" />
          <span className="text-xs font-semibold text-charcoal mr-1">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-forest text-white shadow-soft'
                  : 'bg-warm-surface text-muted-gray hover:text-charcoal'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-forest flex-shrink-0" />
          <select
            value={timeRangeFilter}
            onChange={(e) => setTimeRangeFilter(e.target.value)}
            className="text-xs font-medium bg-warm-surface border border-sage/30 rounded-xl px-3 py-1.5 text-charcoal focus:outline-none focus:ring-1 focus:ring-forest"
          >
            {timeRanges.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: Activity Logs (Responsive Card/List, No Mobile Overflow) */}
      {activeTab === 'activities' && (
        <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-charcoal">
              Catatan Aktivitas ({activities.length} Entri)
            </h3>
            <span className="text-xs text-muted-gray">Diurutkan berdasarkan waktu terbaru</span>
          </div>

          {activities.length === 0 ? (
            <EmptyState
              title="Tidak ada aktivitas ditemukan"
              message="Coba ubah filter kategori atau periksa rentang waktu lain."
              actionLabel="Reset Filter"
              onAction={() => setCategoryFilter('all')}
            />
          ) : (
            <div className="divide-y divide-sage/15">
              {activities.map((item) => {
                const IconComponent = getEventIcon(item.event_type);

                return (
                  <div
                    key={item.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-warm-surface/60 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center flex-shrink-0 mt-0.5">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-charcoal">
                          {item.result || item.cause}
                        </h4>
                        <p className="text-xs text-muted-gray mt-0.5">
                          Penyebab: <span className="text-charcoal font-medium">{item.cause}</span>
                          <span className="mx-1.5">•</span>
                          Sumber: <span className="font-mono text-forest">{item.source}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between text-xs text-muted-gray pl-12 sm:pl-0">
                      <span className="font-mono font-medium text-charcoal">
                        {formatDateTime(item.created_at)}
                      </span>
                      <span className="text-[11px] text-muted-gray">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Sensor & Forecast Charts */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Chart 1: Rain Sensor Analog Readings */}
          <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6">
            <div className="mb-4">
              <h3 className="text-base font-bold text-charcoal">
                Histori Telemetri Sensor Hujan Fisik (Nilai ADC 0–1023)
              </h3>
              <p className="text-xs text-muted-gray">
                Nilai di bawah 400 mengindikasikan tetesan air hujan aktif pada permukaan pelat sensor
              </p>
            </div>
            <RainHistoryChart data={sensors} height={260} />
          </div>

          {/* Chart 2: Weather Forecast Probability Over Time */}
          <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6">
            <div className="mb-4">
              <h3 className="text-base font-bold text-charcoal">
                Histori Prakiraan Probabilitas Hujan BMKG (%)
              </h3>
              <p className="text-xs text-muted-gray">
                Membandingkan nilai probabilitas cuaca terhadap ambang batas 80% Early-Close
              </p>
            </div>
            <ForecastChart
              data={forecasts.map((f) => ({
                time: f.fetched_at,
                probability_of_rain: f.probability_of_rain,
                weather_condition: f.weather_condition,
                temperature: f.temperature,
              }))}
              height={260}
              threshold={80}
            />
          </div>
        </div>
      )}

      {/* TAB 3: Model Evaluation Metrics */}
      {activeTab === 'evaluation' && evaluation && (
        <div className="space-y-6">
          {/* Performance KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white border border-sage/30 p-5 shadow-soft">
              <span className="text-xs text-muted-gray block mb-1">Akurasi Prediksi</span>
              <h4 className="text-3xl font-extrabold text-forest font-sans">
                {evaluation.metrics?.accuracy
                  ? `${(evaluation.metrics.accuracy * 100).toFixed(1)}%`
                  : 'N/A'}
              </h4>
              <p className="text-[11px] text-muted-gray mt-1">Kesesuaian prediksi terhadap realita</p>
            </div>

            <div className="rounded-2xl bg-white border border-sage/30 p-5 shadow-soft">
              <span className="text-xs text-muted-gray block mb-1">Presisi (Precision)</span>
              <h4 className="text-3xl font-extrabold text-charcoal font-sans">
                {evaluation.metrics?.precision
                  ? `${(evaluation.metrics.precision * 100).toFixed(1)}%`
                  : 'N/A'}
              </h4>
              <p className="text-[11px] text-muted-gray mt-1">Ketepatan saat memprediksi hujan</p>
            </div>

            <div className="rounded-2xl bg-white border border-sage/30 p-5 shadow-soft">
              <span className="text-xs text-muted-gray block mb-1">Recall (Sensitivitas)</span>
              <h4 className="text-3xl font-extrabold text-charcoal font-sans">
                {evaluation.metrics?.recall
                  ? `${(evaluation.metrics.recall * 100).toFixed(1)}%`
                  : 'N/A'}
              </h4>
              <p className="text-[11px] text-muted-gray mt-1">Kemampuan menangkap event hujan</p>
            </div>

            <div className="rounded-2xl bg-white border border-sage/30 p-5 shadow-soft">
              <span className="text-xs text-muted-gray block mb-1">F1-Score</span>
              <h4 className="text-3xl font-extrabold text-forest font-sans">
                {evaluation.metrics?.f1_score
                  ? `${(evaluation.metrics.f1_score * 100).toFixed(1)}%`
                  : 'N/A'}
              </h4>
              <p className="text-[11px] text-muted-gray mt-1">Keseimbangan presisi dan recall</p>
            </div>
          </div>

          {/* Confusion Matrix / Breakdown Details */}
          <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6">
            <h3 className="text-base font-bold text-charcoal mb-2">
              Matriks Verifikasi Kejadian (Confusion Matrix)
            </h3>
            <p className="text-xs text-muted-gray mb-6">
              Total {evaluation.evaluated_records_count || 120} sampel evaluasi berbasis ambang batas{' '}
              {evaluation.threshold_used}% dalam horizon {evaluation.horizon_minutes_used} menit.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-soft-green-light border border-forest/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-forest">True Positives (TP): {evaluation.metrics?.true_positives}</span>
                  <StatusBadge variant="success" size="sm">Berhasil Melindungi</StatusBadge>
                </div>
                <p className="text-muted-gray leading-relaxed">
                  Prakiraan memprediksi hujan &gt;= 80%, atap menutup lebih awal, dan sensor lokal mendeteksi hujan beberapa saat kemudian. Jemuran 100% terlindungi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-warm-surface border border-sage/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-charcoal">True Negatives (TN): {evaluation.metrics?.true_negatives}</span>
                  <StatusBadge variant="neutral" size="sm">Optimal Menjemur</StatusBadge>
                </div>
                <p className="text-muted-gray leading-relaxed">
                  Prakiraan menyatakan cuaca aman, sensor tetap kering, dan atap tetap terbuka maksimal untuk menjemur pakaian.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-warm-surface border border-sage/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-charcoal">False Positives (FP): {evaluation.metrics?.false_positives}</span>
                  <StatusBadge variant="warning" size="sm">Tutup Preventif</StatusBadge>
                </div>
                <p className="text-muted-gray leading-relaxed">
                  Prakiraan memprediksi hujan, atap menutup preventif, namun awan mendung bergeser dan hujan tidak turun di lokasi spesifik.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-soft-red-light border border-soft-red/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-soft-red">False Negatives (FN): {evaluation.metrics?.false_negatives}</span>
                  <StatusBadge variant="danger" size="sm">Emergency Sensor Lock</StatusBadge>
                </div>
                <p className="text-muted-gray leading-relaxed">
                  Hujan lokal tiba-tiba turun tanpa terdeteksi radar satelit BMKG. Sensor hujan fisik lokal langsung mengambil alih menutup atap secara darurat.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default HistoryPage;
