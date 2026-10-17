import React from 'react';
import { CloudRain, Sun, Cloud, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatTemp, formatPercentage } from '../../utils/formatters';
import { formatTime, formatRelativeTime } from '../../utils/formatDate';

export function WeatherSummary({
  weather,
  onRefresh,
  isRefreshing = false,
  isMockMode = true,
}) {
  const prob = weather?.probability_of_rain ?? null;
  const isHighRisk = prob !== null && prob >= 80;
  const isModerateRisk = prob !== null && prob >= 50 && prob < 80;
  const isStale = weather?.is_stale;
  const isUnavailable = !weather || weather.status === 'unavailable';

  // Badge risiko probabilitas
  let riskBadgeVariant = 'success';
  let riskText = 'Risiko Rendah';
  if (isHighRisk) {
    riskBadgeVariant = 'danger';
    riskText = 'Risiko Tinggi (> 80%)';
  } else if (isModerateRisk) {
    riskBadgeVariant = 'warning';
    riskText = 'Risiko Menengah (50-79%)';
  }

  return (
    <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sage/20 text-forest flex items-center justify-center">
              <CloudRain className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-gray">
              Prakiraan Cuaca Satelit
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isMockMode && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-soft-amber-light text-[#9A6B1A] border border-soft-amber/30">
                Data Simulasi
              </span>
            )}
            {isStale && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-muted-gray border border-gray-300">
                Kedaluwarsa
              </span>
            )}
            <StatusBadge variant={riskBadgeVariant} size="sm">
              {riskText}
            </StatusBadge>
          </div>
        </div>

        {/* Main Weather Information */}
        <div className="mt-3 flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-extrabold text-charcoal font-sans">
                {prob !== null ? `${Math.round(prob)}%` : '--%'}
              </span>
              <span className="text-xs text-muted-gray font-medium">
                Probabilitas Presipitasi
              </span>
            </div>

            <p className="text-sm font-semibold text-charcoal mt-1 flex items-center gap-1.5">
              <span>{weather?.weather_condition || 'Prakiraan Regional'}</span>
              <span className="text-muted-gray font-normal">•</span>
              <span className="text-forest font-medium">{formatTemp(weather?.temperature)}</span>
            </p>

            <p className="text-xs text-muted-gray mt-1 leading-relaxed">
              Horizon 60 menit ke depan:{' '}
              {isHighRisk
                ? 'Potensi hujan deras tinggi, atap disarankan ditutup lebih awal.'
                : isModerateRisk
                ? 'Awan mendung terdeteksi, sistem dalam mode siaga.'
                : 'Kondisi cuaca relatif kondusif untuk pengeringan jemuran.'}
            </p>
          </div>

          {/* Quick Refresh Icon */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl text-muted-gray hover:bg-warm-surface hover:text-charcoal transition-colors disabled:opacity-50"
              title="Perbarui data cuaca"
              aria-label="Perbarui data cuaca"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-forest' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Provider & Geo Metadata */}
      <div className="mt-6 pt-4 border-t border-sage/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-gray">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-forest" />
          <span className="truncate max-w-[220px]">
            {weather?.location || 'DKI Jakarta'} ({weather?.provider?.toUpperCase() || 'BMKG'})
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <span>Diperbarui:</span>
          <span className="font-mono text-charcoal font-medium">
            {weather?.fetched_at ? formatTime(weather.fetched_at) : '-'} WIB
          </span>
        </div>
      </div>
    </div>
  );
}

export default WeatherSummary;
