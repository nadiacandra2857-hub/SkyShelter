import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function EmptyState({
  title = 'Tidak Ada Data',
  message = 'Belum ada rekaman yang sesuai dengan kriteria atau filter yang dipilih.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = '',
}) {
  const { theme } = useWeatherTheme();
  const isDark = theme?.isDark;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border transition-colors ${
        isDark
          ? 'bg-slate-900/60 border-slate-700/60 text-slate-100'
          : 'bg-white/60 border-slate-200/80 text-charcoal'
      } ${className}`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
          isDark
            ? 'bg-slate-800 text-sky-400 border border-slate-700'
            : 'bg-sky-50 text-sky-500'
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h4 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-charcoal'}`}>{title}</h4>
      <p className={`text-xs max-w-sm mb-4 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>{message}</p>
      {actionLabel && onAction && (
        <Button
          variant={isDark ? 'sky' : 'secondary'}
          size="sm"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
