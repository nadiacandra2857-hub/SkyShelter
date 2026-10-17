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
import { formatRelativeTime, formatTime } from '../../utils/formatDate';

export function RecentActivity({ activities = [], onViewAll }) {
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
    switch (eventType) {
      case 'roof_movement':
        return 'bg-forest/10 text-forest';
      case 'rain_event':
        return 'bg-soft-red-light text-soft-red';
      case 'mode_change':
        return 'bg-sage/30 text-charcoal';
      case 'forecast_update':
        return 'bg-soft-amber-light text-[#9A6B1A]';
      default:
        return 'bg-warm-surface text-muted-gray';
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-charcoal">Aktivitas Sistem Terbaru</h3>
          <p className="text-xs text-muted-gray">Log telemetri, manuver atap, dan deteksi cuaca</p>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-forest hover:text-forest-deep flex items-center gap-1 transition-colors"
          >
            <span>Semua Riwayat</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-gray">
            Belum ada catatan aktivitas baru.
          </div>
        ) : (
          activities.slice(0, 5).map((item) => {
            const IconComponent = getEventIcon(item.event_type);
            const themeClass = getEventTheme(item.event_type);

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-2xl hover:bg-warm-surface transition-colors border border-transparent hover:border-sage/20"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${themeClass}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h5 className="text-xs font-semibold text-charcoal truncate">
                      {item.result || item.cause}
                    </h5>
                    <span className="text-[10px] text-muted-gray font-mono flex-shrink-0">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-gray mt-0.5 truncate">
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
