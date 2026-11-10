import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';
import { useWeatherTheme } from '../context/WeatherThemeContext';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { theme, activeCondition } = useWeatherTheme();
  const isDark = theme?.isDark;
  const isSunny = activeCondition === 'sunny' && !isDark;
  const isCloudy = activeCondition === 'cloudy' && !isDark;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div
        className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-soft transition-colors ${
          isDark
            ? 'bg-slate-900 text-sky-400 border border-slate-700'
            : isSunny
            ? 'bg-amber-50 text-amber-500 border border-amber-200'
            : isCloudy
            ? 'bg-slate-100 text-slate-700 border border-slate-300'
            : 'bg-sky-50 text-sky-500 border border-sky-200'
        }`}
      >
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span
        className={`text-xs font-mono font-bold tracking-wider uppercase mb-1 ${
          isDark ? 'text-amber-400' : isSunny ? 'text-amber-600' : 'text-sky-600'
        }`}
      >
        Error 404 — Halaman Tidak Ditemukan
      </span>

      <h1 className={`text-2xl md:text-3xl font-extrabold font-sans mb-2 ${isDark ? 'text-white' : 'text-charcoal'}`}>
        Halaman di Luar Radius Sensor
      </h1>

      <p className={`text-xs md:text-sm max-w-md mb-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
        Tautan yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali ke dashboard utama untuk memantau status atap jemuran.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate(-1)}
          leftIcon={ArrowLeft}
          className={`border transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Kembali
        </Button>
        <Button
          variant={isSunny ? 'amber' : isCloudy ? 'slate' : 'sky'}
          size="md"
          onClick={() => navigate('/')}
          leftIcon={Home}
          className={
            isSunny
              ? 'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-soft shadow-amber-500/20'
              : isCloudy
              ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm'
              : 'bg-sky-500 hover:bg-sky-600 text-white shadow-soft shadow-sky-500/20'
          }
        >
          Ke Dashboard
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
