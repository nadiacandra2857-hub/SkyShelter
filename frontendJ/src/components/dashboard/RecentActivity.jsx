import React from 'react';
import {
  Maximize2,
  Minimize2,
  Droplets,
  Sliders,
  CloudRain,
  Cpu,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatDate';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function RecentActivity({ activities = [], onViewAll }) {
  const { theme, activeCondition } = useWeatherTheme();
  const isSunny = activeCondition === 'sunny';
  const isCloudy = activeCondition === 'cloudy';

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

  const getEventTheme = (eventType) => {
    if (eventType === 'rain_event') {
      return 'bg-soft-red-light text-soft-red border border-soft-red/30';
    }
    if (isCloudy) {
      switch (eventType) {
        case 'roof_movement':
          return 'bg-slate-100 text-slate-700 border border-slate-300';
        case 'mode_change':
          return 'bg-slate-100 text-slate-700 border border-slate-300';
        case 'forecast_update':
          return 'bg-slate-200/80 text-slate-800 border border-slate-300';
        default:
          return 'bg-slate-100 text-slate-700';
      }
    }
    if (isSunny) {
      switch (eventType) {
        case 'roof_movement':
          return 'bg-amber-50 text-amber-600 border border-amber-200/60';
        case 'mode_change':
          return 'bg-amber-50/80 text-amber-700 border border-amber-200/60';
        case 'forecast_update':
          return 'bg-amber-100/60 text-amber-800 border border-amber-200/60';
        default:
          return 'bg-amber-50 text-amber-600';
      }
    }
    switch (eventType) {
      case 'roof_movement':
        return 'bg-sky-50 text-sky-600 border border-sky-200/60';
      case 'mode_change':
        return 'bg-sky-50/80 text-sky-700 border border-sky-200/60';
      case 'forecast_update':
        return 'bg-sky-100/60 text-sky-800 border border-sky-200/60';
      default:
        return 'bg-sky-50 text-sky-600';
    }
  };

  return (
    <div
      className={`rounded-3xl p-6 border transition-all duration-500 shadow-soft-md ${
        theme.card.activityCard
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-base font-bold ${theme.text.title}`}>
            Aktivitas Sistem Terbaru
          </h3>
          <p className={`text-xs ${theme.text.subtitle}`}>
            Log telemetri, manuver atap, dan deteksi cuaca
          </p>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
              isSunny
                ? 'text-amber-600 hover:text-amber-700'
                : isCloudy
                ? 'text-slate-700 hover:text-slate-900'
                : 'text-sky-600 hover:text-sky-700'
            }`}
          >
            <span>Semua Riwayat</span>
            <ChevronRight
              className={`w-3.5 h-3.5 ${
                isSunny
                  ? 'text-amber-500'
                  : isCloudy
                  ? 'text-slate-600'
                  : 'text-sky-500'
              }`}
            />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className={`py-6 text-center text-xs ${theme.text.subtitle}`}>
            Belum ada catatan aktivitas baru.
          </div>
        ) : (
          activities.slice(0, 5).map((item) => {
            const IconComponent = getEventIcon(item.event_type);
            const themeClass = getEventTheme(item.event_type);

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-2xl transition-colors border ${
                  theme.isDark
                    ? 'hover:bg-slate-850/80 border-transparent hover:border-slate-700'
                    : 'hover:bg-warm-surface border-transparent hover:border-sage/20'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${themeClass}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h5 className={`text-xs font-semibold truncate ${theme.text.title}`}>
                      {item.result || item.cause}
                    </h5>
                    <span className={`text-[10px] font-mono flex-shrink-0 ${theme.text.subtitle}`}>
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 truncate ${theme.text.subtitle}`}>
                    Penyebab: {item.cause || item.source}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecentActivity;
