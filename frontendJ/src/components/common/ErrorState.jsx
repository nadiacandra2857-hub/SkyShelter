import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function ErrorState({
  title = 'Gagal Memuat Data',
  message = 'Terjadi kendala saat berkomunikasi dengan server backend atau layanan sensor.',
  onRetry,
  className = '',
}) {
  const { theme } = useWeatherTheme();
  const isDark = theme?.isDark;

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border transition-colors ${
        isDark
          ? 'bg-red-950/60 border-red-700/50 text-red-100 shadow-xl'
          : 'bg-soft-red-light/60 border-soft-red/30 text-charcoal'
      } ${className}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
        isDark ? 'bg-red-900/60 text-red-300 border border-red-700/60' : 'bg-soft-red/10 text-soft-red'
      }`}>
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-charcoal'}`}>{title}</h4>
      <p className={`text-xs md:text-sm max-w-md mb-4 ${isDark ? 'text-slate-300' : 'text-muted-gray'}`}>{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={RefreshCw}
          className={isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white hover:bg-warm-surface'}
        >
          Coba Muat Ulang
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
