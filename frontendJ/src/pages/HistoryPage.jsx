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
import { useWeatherTheme } from '../context/WeatherThemeContext';
import { formatTime, formatDateTime, formatRelativeTime } from '../utils/formatDate';

export function HistoryPage() {
  const { theme, activeCondition } = useWeatherTheme();
  const isDark = theme?.isDark;
  const isSunny = activeCondition === 'sunny' && !isDark;
  const isCloudy = activeCondition === 'cloudy' && !isDark;

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
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <History
              className={`w-3.5 h-3.5 ${
                isDark ? 'text-sky-400' : isSunny ? 'text-amber-500' : isCloudy ? 'text-slate-600' : 'text-sky-500'
              }`}
            />
            <span
              className={
                isDark
                  ? 'text-sky-400'
                  : isSunny
                  ? 'text-amber-600 font-bold'
                  : isCloudy
                  ? 'text-slate-700 font-bold'
                  : 'text-sky-600 font-bold'
              }
            >
              Audit & Evaluasi Sistem
            </span>
          </div>
          <h2 className={`text-xl md:text-2xl font-extrabold font-sans mt-0.5 ${isDark ? 'text-white' : 'text-charcoal'}`}>
            Riwayat Aktivitas & Evaluasi Cuaca
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
            Log telemetri komprehensif, performa deteksi hujan, dan ekspor data CSV
          </p>
        </div>

        {/* Export CSV Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={isCloudy ? 'slate' : 'outline'}
            size="sm"
            onClick={() => exportCsv('sensors')}
            isLoading={exporting}
            leftIcon={Download}
            className={
              isDark
                ? 'bg-slate-900 border-slate-700 text-sky-400 hover:bg-slate-800'
                : isSunny
                ? 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300'
                : isCloudy
                ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm ring-1 ring-slate-600/30'
                : 'bg-white border-sky-200 text-sky-700 hover:bg-sky-50'
            }
          >
            Ekspor CSV Sensor
          </Button>
          <Button
            variant={isSunny ? 'amber' : isCloudy ? 'slate' : 'sky'}
            size="sm"
            onClick={() => exportCsv('activities')}
            isLoading={exporting}
            leftIcon={Download}
            className={
              isSunny
                ? 'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-soft shadow-amber-500/20 ring-1 ring-amber-400/30'
                : isCloudy
                ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm ring-1 ring-slate-600/30'
                : ''
            }
          >
            Ekspor CSV Log
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        className={`flex items-center space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar border-b ${
          isDark ? 'border-slate-800' : isSunny ? 'border-amber-200/80' : isCloudy ? 'border-slate-200/80' : 'border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={`pb-3 text-xs md:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'activities'
              ? isSunny
                ? 'border-amber-500 text-amber-600 font-bold'
                : isCloudy
                ? 'border-slate-700 text-slate-800 font-bold'
                : 'border-sky-500 text-sky-400 font-bold'
              : isDark
              ? 'border-transparent text-slate-400 hover:text-slate-200'
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
              ? isSunny
                ? 'border-amber-500 text-amber-600 font-bold'
                : isCloudy
                ? 'border-slate-700 text-slate-800 font-bold'
                : 'border-sky-500 text-sky-400 font-bold'
              : isDark
              ? 'border-transparent text-slate-400 hover:text-slate-200'
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
              ? isSunny
                ? 'border-amber-500 text-amber-600 font-bold'
                : isCloudy
                ? 'border-slate-700 text-slate-800 font-bold'
                : 'border-sky-500 text-sky-400 font-bold'
              : isDark
              ? 'border-transparent text-slate-400 hover:text-slate-200'
              : 'border-transparent text-muted-gray hover:text-charcoal'
          }`}
        >
          Metrik Evaluasi Early-Close
        </button>
      </div>

      {/* Filters Bar */}
      <div
        className={`p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
          isDark
            ? 'bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-soft'
            : isSunny
            ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
            : isCloudy
            ? 'bg-white border border-slate-200/80 shadow-sm'
            : 'bg-white border border-slate-200 shadow-soft'
        }`}
      >
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <Filter
            className={`w-4 h-4 ${
              isSunny ? 'text-amber-500' : isCloudy ? 'text-slate-600' : 'text-sky-400'
            }`}
          />
          <span className={`text-xs font-semibold mr-1 ${isDark ? 'text-slate-300' : 'text-charcoal'}`}>Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? isSunny
                    ? 'bg-amber-500 text-white shadow-sm font-semibold'
                    : isCloudy
                    ? 'bg-slate-700 text-white shadow-sm font-semibold'
                    : 'bg-sky-500 text-white shadow-sm font-semibold'
                  : isDark
                  ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : isSunny
                  ? 'bg-amber-50/70 text-amber-900/70 hover:bg-amber-100 hover:text-amber-950'
                  : isCloudy
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar
            className={`w-4 h-4 ${
              isSunny ? 'text-amber-500' : isCloudy ? 'text-slate-600' : 'text-sky-400'
            }`}
          />
          <select
            value={timeRangeFilter}
            onChange={(e) => setTimeRangeFilter(e.target.value)}
            className={`text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none transition-colors ${
              isDark
                ? 'bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-sky-500'
                : isSunny
                ? 'bg-amber-50/60 border border-amber-200 text-charcoal focus:ring-1 focus:ring-amber-400'
                : isCloudy
                ? 'bg-slate-50 border border-slate-300 text-charcoal focus:ring-1 focus:ring-slate-400'
                : 'bg-slate-50 border border-slate-200 text-charcoal focus:ring-1 focus:ring-sky-500'
            }`}
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
        <div
          className={`rounded-3xl p-6 transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
              : isSunny
              ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
              : isCloudy
              ? 'bg-white border border-slate-200/80 shadow-sm'
              : 'bg-white border border-sky-100/80 shadow-soft-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>
              Catatan Aktivitas ({activities.length} Entri)
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Diurutkan berdasarkan waktu terbaru</span>
          </div>

          {activities.length === 0 ? (
            <EmptyState
              title="Tidak ada aktivitas ditemukan"
              message="Coba ubah filter kategori atau periksa rentang waktu lain."
              actionLabel="Reset Filter"
              onAction={() => setCategoryFilter('all')}
            />
          ) : (
            <div className={`divide-y ${isDark ? 'divide-slate-800/80' : isSunny ? 'divide-amber-100/60' : isCloudy ? 'divide-slate-100' : 'divide-slate-100'}`}>
              {activities.map((item) => {
                const IconComponent = getEventIcon(item.event_type);

                return (
                  <div
                    key={item.id}
                    className={`py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-2 rounded-xl transition-colors ${
                      isDark ? 'hover:bg-slate-800/50' : isSunny ? 'hover:bg-amber-50/50' : isCloudy ? 'hover:bg-slate-100/60' : 'hover:bg-sky-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isDark
                            ? 'bg-slate-800 text-sky-400 border border-slate-700/60'
                            : isSunny
                            ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                            : isCloudy
                            ? 'bg-slate-100 text-slate-700 border border-slate-300'
                            : 'bg-sky-50 text-sky-600'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={`text-xs md:text-sm font-medium ${isDark ? 'text-white' : 'text-charcoal font-bold'}`}>
                          {item.result || item.cause}
                        </h4>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                          Penyebab: <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-charcoal'}`}>{item.cause}</span>
                          <span className="mx-1.5">•</span>
                          Sumber: <span className={`font-mono ${isSunny ? 'text-amber-600' : isCloudy ? 'text-slate-600' : 'text-sky-400'}`}>{item.source}</span>
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-center sm:flex-col sm:items-end justify-between text-xs pl-12 sm:pl-0 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                      <span className={`font-mono font-medium ${isDark ? 'text-slate-200' : 'text-charcoal'}`}>
                        {formatDateTime(item.created_at)}
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-muted-gray'}`}>
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
          <div
            className={`rounded-3xl p-6 transition-all duration-300 ${
              isDark
                ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
                : isSunny
                ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
                : isCloudy
                ? 'bg-white border border-slate-200/80 shadow-sm'
                : 'bg-white border border-slate-200/80 shadow-soft-md'
            }`}
          >
            <div className="mb-4">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>
                Histori Telemetri Sensor Hujan Fisik (Nilai ADC 0–1023)
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                Nilai di bawah 400 mengindikasikan tetesan air hujan aktif pada permukaan pelat sensor
              </p>
            </div>
            <RainHistoryChart data={sensors} height={260} />
          </div>

          {/* Chart 2: Weather Forecast Probability Over Time */}
          <div
            className={`rounded-3xl p-6 transition-all duration-300 ${
              isDark
                ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
                : isSunny
                ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
                : isCloudy
                ? 'bg-white border border-slate-200/80 shadow-sm'
                : 'bg-white border border-slate-200/80 shadow-soft-md'
            }`}
          >
            <div className="mb-4">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>
                Histori Prakiraan Probabilitas Hujan BMKG (%)
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
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
            <div
              className={`rounded-2xl p-5 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-soft'
                  : isSunny
                  ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
                  : isCloudy
                  ? 'bg-white border border-slate-200/80 shadow-sm'
                  : 'bg-white border border-sky-100/80 shadow-soft'
              }`}
            >
              <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Akurasi Prediksi</span>
              <h4 className={`text-3xl font-extrabold font-sans ${isDark ? 'text-sky-400' : isSunny ? 'text-amber-600' : isCloudy ? 'text-slate-700' : 'text-sky-400'}`}>
                {evaluation.metrics?.accuracy
                  ? `${(evaluation.metrics.accuracy * 100).toFixed(1)}%`
                  : 'N/A'}
              </h4>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Kesesuaian prediksi terhadap realita</p>
            </div>

            <div
              className={`rounded-2xl p-5 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-soft'
                  : isSunny
                  ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
                  : isCloudy
                  ? 'bg-white border border-slate-200/80 shadow-sm'
                  : 'bg-white border border-sky-100/80 shadow-soft'
              }`}
            >
              <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Presisi (Precision)</span>
              <h4 className={`text-3xl font-extrabold font-sans ${isDark ? 'text-white' : 'text-charcoal'}`}>
                {evaluation.metrics?.precision
                  ? `${(evaluation.metrics.precision * 100).toFixed(1)}%`
                  : 'N/A'}
              </h4>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Ketepatan saat memprediksi hujan</p>
            </div>

            <div
              className={`rounded-2xl p-5 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-soft'
                  : isSunny
                  ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
                  : isCloudy
                  ? 'bg-white border border-slate-200/80 shadow-sm'
                  : 'bg-white border border-sky-100/80 shadow-soft'
              }`}
            >
              <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Recall (Sensitivitas)</span>
              <h4 className={`text-3xl font-extrabold font-sans ${isDark ? 'text-white' : 'text-charcoal'}`}>
                {evaluation.metrics?.recall
                  ? `${(evaluation.metrics.recall * 100).toFixed(1)}%`
                  : 'N/A'}
              </h4>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Kemampuan menangkap event hujan</p>
            </div>

            <div
              className={`rounded-2xl p-5 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-soft'
                  : isSunny
                  ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
                  : isCloudy
                  ? 'bg-white border border-slate-200/80 shadow-sm'
                  : 'bg-white border border-sky-100/80 shadow-soft'
              }`}
            >
              <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>F1-Score</span>
              <h4 className={`text-3xl font-extrabold font-sans ${isDark ? 'text-sky-400' : isSunny ? 'text-amber-600' : isCloudy ? 'text-slate-700' : 'text-sky-400'}`}>
                {evaluation.metrics?.f1_score
                  ? `${(evaluation.metrics.f1_score * 100).toFixed(1)}%`
                  : 'N/A'}
              </h4>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Keseimbangan presisi dan recall</p>
            </div>
          </div>

          {/* Confusion Matrix / Breakdown Details */}
          <div
            className={`rounded-3xl p-6 transition-all duration-300 ${
              isDark
                ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
                : isSunny
                ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
                : isCloudy
                ? 'bg-white border border-slate-200/80 shadow-sm'
                : 'bg-white border border-sky-100/80 shadow-soft-md'
            }`}
          >
            <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-charcoal'}`}>
              Matriks Verifikasi Kejadian (Confusion Matrix)
            </h3>
            <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
              Total {evaluation.evaluated_records_count || 120} sampel evaluasi berbasis ambang batas{' '}
              {evaluation.threshold_used}% dalam horizon {evaluation.horizon_minutes_used} menit.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div
                className={`p-4 rounded-2xl ${
                  isDark
                    ? 'bg-sky-950/60 border border-sky-700/60 text-sky-200'
                    : isSunny
                    ? 'bg-amber-50 border border-amber-200 text-amber-900'
                    : isCloudy
                    ? 'bg-slate-100 border border-slate-300 text-slate-800'
                    : 'bg-sky-50 border border-sky-200 text-sky-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${isDark ? 'text-sky-300' : isSunny ? 'text-amber-800' : isCloudy ? 'text-slate-800' : 'text-sky-700'}`}>
                    True Positives (TP): {evaluation.metrics?.true_positives}
                  </span>
                  <StatusBadge variant={isSunny ? 'amber' : isCloudy ? 'cloudy' : 'secondary'} size="sm">Berhasil Melindungi</StatusBadge>
                </div>
                <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-muted-gray'}`}>
                  Prakiraan memprediksi hujan &gt;= 80%, atap menutup lebih awal, dan sensor lokal mendeteksi hujan beberapa saat kemudian. Jemuran 100% terlindungi.
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl ${
                  isDark
                    ? 'bg-slate-800/70 border border-slate-700/60 text-slate-300'
                    : 'bg-slate-50 border border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>
                    True Negatives (TN): {evaluation.metrics?.true_negatives}
                  </span>
                  <StatusBadge variant="neutral" size="sm">Optimal Menjemur</StatusBadge>
                </div>
                <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                  Prakiraan menyatakan cuaca aman, sensor tetap kering, dan atap tetap terbuka maksimal untuk menjemur pakaian.
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl ${
                  isDark
                    ? 'bg-slate-800/70 border border-slate-700/60 text-slate-300'
                    : 'bg-slate-50 border border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>
                    False Positives (FP): {evaluation.metrics?.false_positives}
                  </span>
                  <StatusBadge variant="warning" size="sm">Tutup Preventif</StatusBadge>
                </div>
                <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                  Prakiraan memprediksi hujan, atap menutup preventif, namun awan mendung bergeser dan hujan tidak turun di lokasi spesifik.
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl ${
                  isDark
                    ? 'bg-red-950/60 border border-red-700/60 text-red-200'
                    : 'bg-soft-red-light border border-soft-red/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-soft-red">
                    False Negatives (FN): {evaluation.metrics?.false_negatives}
                  </span>
                  <StatusBadge variant="danger" size="sm">Emergency Sensor Lock</StatusBadge>
                </div>
                <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-muted-gray'}`}>
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
