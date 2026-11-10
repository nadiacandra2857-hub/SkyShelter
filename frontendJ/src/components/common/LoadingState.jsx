import React from 'react';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function LoadingState({
  message = 'Memuat data sistem...',
  subtext = 'Menghubungkan ke sensor & layanan...',
  className = '',
}) {
  const { theme } = useWeatherTheme();
  const isDark = theme?.isDark;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl backdrop-blur-sm border transition-colors ${
        isDark
          ? 'bg-slate-900/70 border-slate-700/60 text-slate-100 shadow-xl'
          : 'bg-white/70 border-slate-200/80 text-charcoal'
      } ${className}`}
    >
      <div className="relative mb-3 flex items-center justify-center">
        <div
          className={`w-10 h-10 rounded-full border-2 animate-spin ${
            isDark ? 'border-slate-800 border-t-sky-400' : 'border-sky-100 border-t-sky-500'
          }`}
        />
      </div>
      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-charcoal'}`}>{message}</p>
      {subtext && <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>{subtext}</p>}
    </div>
  );
}

export default LoadingState;
