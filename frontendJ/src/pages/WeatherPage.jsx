import React from 'react';
import { motion } from 'framer-motion';
import {
  CloudRain,
  Sun,
  Cloud,
  RefreshCw,
  Compass,
  Clock,
  Radio,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import ForecastChart from '../components/charts/ForecastChart';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import useWeather from '../hooks/useWeather';
import { formatTemp, formatPercentage } from '../utils/formatters';
import { formatTime, formatDateTime, formatRelativeTime } from '../utils/formatDate';

export function WeatherPage() {
  const {
    current,
    forecast,
    status,
    loading,
    refreshing,
    error,
    refresh,
    isMockMode,
  } = useWeather();

  if (loading && !current) {
    return <LoadingState message="Memuat data satelit cuaca & BMKG radar..." />;
  }

  if (error && !current) {
    return (
      <ErrorState
        title="Gagal Memuat Cuaca"
        message={error}
        onRetry={refresh}
      />
    );
  }

  const prob = current?.probability_of_rain ?? null;
  const isHighRisk = prob !== null && prob >= 80;
  const isModerateRisk = prob !== null && prob >= 50 && prob < 80;
  const isStale = current?.is_stale;
  const isUnavailable = !current || current.status === 'unavailable';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Page Title & Refresh Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest">
            <CloudRain className="w-3.5 h-3.5" />
            <span>Prakiraan Cuaca Regional</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-charcoal font-sans mt-0.5">
            Satelit Cuaca & Radar Presipitasi
          </h2>
          <p className="text-xs text-muted-gray mt-0.5">
            Data meteorologi untuk mendukung keputusan penutupan kanopi jemuran lebih awal (Early-Close)
          </p>
        </div>

        <Button
          variant="forest"
          size="sm"
          onClick={refresh}
          isLoading={refreshing}
          leftIcon={RefreshCw}
        >
          Perbarui Data Cuaca
        </Button>
      </div>

      {/* Status Warning Banner (Simulated, Stale, or Unavailable) */}
      {isMockMode && (
        <div className="p-3.5 rounded-2xl bg-soft-amber-light border border-soft-amber/40 flex items-center justify-between text-xs text-[#9A6B1A]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Mode Simulasi Data Cuaca:</strong> Nilai probabilitas dan kurva presipitasi di bawah ini merupakan data sintetis untuk pengujian fungsi Early-Close.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[11px] opacity-80">BMKG Mock Engine</span>
        </div>
      )}

      {/* Main Forecast Hero Card */}
      <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Probability & Big Condition Indicator */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge
                variant={isHighRisk ? 'danger' : isModerateRisk ? 'warning' : 'success'}
                size="md"
              >
                {isHighRisk
                  ? 'Risiko Tinggi (> 80%)'
                  : isModerateRisk
                  ? 'Risiko Menengah'
                  : 'Risiko Rendah'}
              </StatusBadge>
              {isStale && (
                <span className="text-xs text-muted-gray font-medium">
                  (Data Kedaluwarsa)
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl md:text-6xl font-extrabold text-charcoal font-sans tracking-tight">
                  {prob !== null ? `${Math.round(prob)}%` : '--%'}
                </span>
                <span className="text-sm font-semibold text-muted-gray">
                  Probabilitas Hujan
                </span>
              </div>

              <h3 className="text-xl font-bold text-forest-deep mt-2 flex items-center gap-2">
                <span>{current?.weather_condition || 'Prakiraan Cuaca'}</span>
                <span className="text-muted-gray">•</span>
                <span className="text-charcoal">{formatTemp(current?.temperature)}</span>
              </h3>

              <p className="text-xs md:text-sm text-muted-gray mt-1 leading-relaxed">
                Prakiraan BMKG untuk horizon 60 menit ke depan di wilayah{' '}
                <strong>{current?.location || 'DKI Jakarta'}</strong>.
              </p>
            </div>
          </div>

          {/* Decision Rationale Box */}
          <div className="md:col-span-6 p-5 rounded-2xl bg-warm-surface border border-sage/20 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-forest" />
                <span>Rekomendasi Algoritma Early-Close:</span>
              </span>
              <StatusBadge variant={isHighRisk ? 'danger' : 'neutral'} size="sm">
                {isHighRisk ? 'Tutup Lebih Awal' : 'Tetap Buka'}
              </StatusBadge>
            </div>

            <p className="text-xs text-muted-gray leading-relaxed">
              {isHighRisk
                ? 'Karena probabilitas hujan melampaui ambang batas 80%, sistem secara otomatis merekomendasikan penutupan kanopi sebelum hujan turun ke pakaian jemuran.'
                : isModerateRisk
                ? 'Probabilitas hujan berada pada tingkat siaga (50-79%). Sistem bersiap menutup jika sensor lokal terpicu atau probabilitas meningkat.'
                : 'Prakiraan presipitasi rendah. Kondisi cuaca kondusif untuk menjemur pakaian di bawah sinar matahari.'}
            </p>

            <div className="pt-2 border-t border-sage/20 flex items-center justify-between text-[11px] text-muted-gray">
              <span>Ambang Batas Aturan:</span>
              <span className="font-bold text-charcoal font-mono">80% / 60 Menit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Timeline Chart (Recharts) */}
      <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-charcoal">
              Kurva Prediksi Presipitasi & Horizon Waktu
            </h3>
            <p className="text-xs text-muted-gray">
              Proyeksi probabilitas hujan bertahap (Garis putus-putus merah menandakan ambang Early-Close 80%)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-block w-3 h-3 rounded-full bg-soft-amber" />
            <span className="text-muted-gray">Probabilitas Hujan (%)</span>
          </div>
        </div>

        <ForecastChart
          data={forecast?.hourly_forecasts || []}
          height={260}
          threshold={80}
        />
      </div>

      {/* Provider Details & Telemetry Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white border border-sage/30 p-5 shadow-soft">
          <span className="text-xs text-muted-gray block mb-1">Penyedia Data Cuaca</span>
          <h4 className="text-base font-bold text-charcoal uppercase">
            {status?.provider || 'BMKG Open Data'}
          </h4>
          <p className="text-xs text-muted-gray mt-1">
            Stasiun Meteorologi Kemayoran, DKI Jakarta
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-sage/30 p-5 shadow-soft">
          <span className="text-xs text-muted-gray block mb-1">Status Sinkronisasi Cache</span>
          <h4 className="text-base font-bold text-forest flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{status?.is_available ? 'Layanan Aktif' : 'Terhambat'}</span>
          </h4>
          <p className="text-xs text-muted-gray mt-1 font-mono text-[11px]">
            Diperbarui: {status?.last_successful_fetch ? formatTime(status.last_successful_fetch) : '-'} WIB
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-sage/30 p-5 shadow-soft">
          <span className="text-xs text-muted-gray block mb-1">Interval Polling Otomatis</span>
          <h4 className="text-base font-bold text-charcoal">
            Setiap {status?.poll_interval_minutes || 15} Menit
          </h4>
          <p className="text-xs text-muted-gray mt-1">
            Untuk menghemat bandwidth dan mencegah rate limit API
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default WeatherPage;
