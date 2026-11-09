import React from 'react';
import { CloudRain, Sun, Cloud, CloudLightning, RefreshCw, Compass } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatTemp } from '../../utils/formatters';
import { formatTime } from '../../utils/formatDate';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function WeatherSummary({
  weather,
  onRefresh,
  isRefreshing = false,
  isMockMode = true,
}) {
  const { theme, activeCondition } = useWeatherTheme();
  const prob = weather?.probability_of_rain ?? null;
  const isHighRisk = prob !== null && prob >= 80;
  const isModerateRisk = prob !== null && prob >= 50 && prob < 80;

  // Icon dinamis berdasarkan kondisi cuaca aktif
  const WeatherIcon =
    activeCondition === 'storm'
      ? CloudLightning
      : activeCondition === 'rainy'
      ? CloudRain
      : activeCondition === 'cloudy'
      ? Cloud
      : Sun;

  // Badge risiko probabilitas presipitasi
  let riskBadgeVariant =
    activeCondition === 'sunny'
      ? 'amber'
      : activeCondition === 'cloudy'
      ? 'cloudy'
      : 'success';
  let riskText = 'Risiko Rendah (< 50%)';
  if (isHighRisk) {
    riskBadgeVariant = 'storm';
    riskText = 'Risiko Tinggi (> 80%)';
  } else if (isModerateRisk) {
    riskBadgeVariant = 'warning';
    riskText = 'Risiko Menengah (50-79%)';
  }

  const isSunny = activeCondition === 'sunny';
  const isCloudy = activeCondition === 'cloudy';

  return (
    <div
      className={`rounded-3xl p-6 border transition-all duration-500 shadow-soft-md flex flex-col justify-between ${
        theme.card.weatherCard
      }`}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
                isSunny
                  ? 'bg-amber-50 border-amber-200/80 text-amber-500'
                  : isCloudy
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 text-sky-500'
              }`}
            >
              <WeatherIcon
                className={`w-4 h-4 ${
                  isSunny ? 'text-amber-500' : isCloudy ? 'text-slate-600' : 'text-sky-500'
                }`}
              />
            </div>
            <span
              className={`text-xs font-semibold tracking-wider uppercase ${
                theme.isDark ? 'text-slate-400' : 'text-muted-gray'
              }`}
            >
              Prakiraan Cuaca Satelit
            </span>
          </div>

          <StatusBadge variant={riskBadgeVariant} size="sm">
            {riskText}
          </StatusBadge>
        </div>

        {/* Main Weather Information */}
        <div className="mt-3 flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl md:text-4xl font-extrabold font-sans ${theme.text.title}`}>
                {prob !== null ? `${Math.round(prob)}%` : '--%'}
              </span>
              <span className={`text-xs font-medium ${theme.text.subtitle}`}>
                Probabilitas Presipitasi
              </span>
            </div>

            <p className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${theme.text.title}`}>
              <span>{weather?.weather_condition || 'Prakiraan Regional'}</span>
              <span className={theme.isDark ? 'text-slate-600' : 'text-muted-gray'}>•</span>
              <span className={`font-medium ${theme.text.headingAccent}`}>
                {formatTemp(weather?.temperature)}
              </span>
            </p>

            <p className={`text-xs mt-1 leading-relaxed ${theme.text.subtitle}`}>
              Horizon 60 menit ke depan:{' '}
              {isHighRisk
                ? 'Potensi presipitasi lebat tinggi, atap disarankan menutup proaktif.'
                : isModerateRisk
                ? 'Awan mendung terdeteksi, sistem menjaga status siaga.'
                : 'Kondisi langit cerah bersahabat untuk penjemuran pakaian.'}
            </p>
          </div>

          {/* Quick Refresh Icon */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${
                theme.isDark
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  : isSunny
                  ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                  : isCloudy
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  : 'text-sky-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
              title="Perbarui data cuaca"
              aria-label="Perbarui data cuaca"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isRefreshing
                    ? isSunny
                      ? 'animate-spin text-amber-500'
                      : isCloudy
                      ? 'animate-spin text-slate-600'
                      : 'animate-spin text-sky-500'
                    : ''
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Provider & Geo Metadata */}
      <div
        className={`mt-6 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
          theme.isDark ? 'border-slate-800 text-slate-400' : 'border-sky-100/80 text-muted-gray'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-sky-500" />
          <span className="truncate max-w-[220px]">
            {weather?.location || 'Surabaya, Jawa Timur'} ({weather?.provider?.toUpperCase() || 'OPEN-METEO'})
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <span>Diperbarui:</span>
          <span className={`font-mono font-medium ${theme.isDark ? 'text-slate-200' : 'text-charcoal'}`}>
            {weather?.fetched_at ? formatTime(weather.fetched_at) : '-'} WIB
          </span>
        </div>
      </div>
    </div>
  );
}

export default WeatherSummary;
