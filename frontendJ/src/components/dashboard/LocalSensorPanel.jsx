import React from 'react';
import { Droplets, Sun, Thermometer, Wind, Activity, Info, ShieldOff } from 'lucide-react';
import { RAIN_SENSOR_MAP, formatTemp } from '../../utils/formatters';
import { formatRelativeTime } from '../../utils/formatDate';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function LocalSensorPanel({
  rainSensor = 'dry',
  rainDetected = false,
  rainAnalogValue = 1023,
  lightLux = 680,
  temperature = 29.5,
  humidity = 65,
  lastUpdated,
}) {
  const { theme, activeCondition } = useWeatherTheme();
  const sensorInfo = RAIN_SENSOR_MAP[rainSensor] || RAIN_SENSOR_MAP.unknown;

  const isSunny = activeCondition === 'sunny';
  const isCloudy = activeCondition === 'cloudy';

  // Skema warna dinamis berbasis cuaca aktif (sunny, cloudy, rainy, storm)
  const weatherColorStyles = {
    sunny: {
      card: theme.isDark
        ? 'bg-slate-900/80 border-amber-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.4)] text-slate-100'
        : 'bg-gradient-to-br from-white via-amber-50/20 to-white border-amber-200/70 shadow-sm shadow-amber-100/50 text-charcoal',
      iconBox: theme.isDark
        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
        : 'bg-amber-50 border border-amber-200/90 text-amber-500',
      iconText: theme.isDark ? 'text-amber-400' : 'text-amber-500',
      badge: theme.isDark
        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        : 'bg-amber-50 text-amber-800 border-amber-200/80',
      badgeDot: 'bg-amber-500',
      statusTitle: theme.isDark ? 'text-amber-400' : 'text-amber-600',
      analogLabel: theme.isDark ? 'text-amber-400' : 'text-amber-600',
      divider: theme.isDark ? 'border-slate-800' : 'border-amber-100/80',
    },
    cloudy: {
      card: theme.isDark
        ? 'bg-slate-900/80 border-slate-700/60 shadow-[0_4px_25px_rgba(0,0,0,0.4)] text-slate-100'
        : 'bg-white/95 border-slate-200/90 shadow-sm text-charcoal',
      iconBox: theme.isDark
        ? 'bg-slate-800 border border-slate-700 text-slate-300'
        : 'bg-slate-100 border border-slate-300 text-slate-700',
      iconText: theme.isDark ? 'text-slate-300' : 'text-slate-700',
      badge: theme.isDark
        ? 'bg-slate-800/80 text-slate-200 border-slate-700'
        : 'bg-slate-100 text-slate-800 border-slate-300',
      badgeDot: 'bg-slate-600 dark:bg-slate-400',
      statusTitle: theme.isDark ? 'text-slate-200' : 'text-slate-800',
      analogLabel: theme.isDark ? 'text-slate-300' : 'text-slate-700',
      divider: theme.isDark ? 'border-slate-800' : 'border-slate-200/80',
    },
    rainy: {
      card: theme.isDark
        ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_4px_25px_rgba(6,182,212,0.18)] text-slate-100'
        : 'bg-gradient-to-br from-cyan-50/70 via-white/95 to-sky-50/50 border-cyan-200/90 shadow-[0_4px_25px_rgba(6,182,212,0.12)] text-charcoal',
      iconBox: theme.isDark
        ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
        : 'bg-cyan-50 border border-cyan-300/80 text-cyan-600',
      iconText: theme.isDark ? 'text-cyan-300' : 'text-cyan-600',
      badge: theme.isDark
        ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40'
        : 'bg-cyan-50 text-cyan-800 border-cyan-300/80',
      badgeDot: 'bg-cyan-500',
      statusTitle: theme.isDark ? 'text-cyan-300' : 'text-cyan-700',
      analogLabel: theme.isDark ? 'text-cyan-400' : 'text-cyan-600',
      divider: theme.isDark ? 'border-cyan-950' : 'border-cyan-100',
    },
    storm: {
      card: theme.isDark
        ? 'bg-gradient-to-br from-slate-950 via-[#131B2E] to-slate-900 border-indigo-500/40 shadow-[0_4px_30px_rgba(99,102,241,0.25)] text-slate-100'
        : 'bg-gradient-to-br from-indigo-50/80 via-slate-50 to-indigo-100/50 border-indigo-200 shadow-[0_4px_25px_rgba(99,102,241,0.15)] text-charcoal',
      iconBox: theme.isDark
        ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
        : 'bg-indigo-100/80 border border-indigo-300 text-indigo-700',
      iconText: theme.isDark ? 'text-indigo-300' : 'text-indigo-700',
      badge: theme.isDark
        ? 'bg-indigo-950/80 text-indigo-200 border-indigo-500/50'
        : 'bg-indigo-100 text-indigo-900 border-indigo-300',
      badgeDot: 'bg-indigo-500',
      statusTitle: theme.isDark ? 'text-indigo-300' : 'text-indigo-800',
      analogLabel: theme.isDark ? 'text-indigo-400' : 'text-indigo-700',
      divider: theme.isDark ? 'border-slate-800' : 'border-indigo-100',
    },
  };

  const currentStyles = weatherColorStyles[activeCondition] || weatherColorStyles.sunny;

  return (
    <div
      className={`rounded-3xl p-6 border transition-all duration-500 flex flex-col justify-between backdrop-blur-md ${currentStyles.card}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${currentStyles.iconBox} ${
                rainDetected ? 'animate-pulse' : ''
              }`}
            >
              <Droplets className={`w-4 h-4 ${currentStyles.iconText}`} />
            </div>
            <span
              className={`text-xs font-bold tracking-wider uppercase ${
                theme.isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Sensor Hujan Lokal
            </span>
          </div>
        </div>

        {/* Big Reading Status */}
        <div className="mt-3">
          <h4
            className={`text-2xl font-bold flex items-center gap-2 ${
              theme.isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <ShieldOff className="w-6 h-6 text-slate-400" />
            <span>Sensor Fisik Nonaktif</span>
          </h4>
          <p
            className={`text-xs mt-1 leading-relaxed ${
              theme.isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Data sensor hujan dari mikrokontroler ESP dinonaktifkan sementara karena perangkat belum tersedia. Otomasi penutupan kanopi sepenuhnya mengandalkan Radar Satelit BMKG (Early-Close).
          </p>
        </div>
      </div>

      {/* Sensor Telemetry Metrics Grid */}
      <div className={`mt-6 pt-4 border-t ${currentStyles.divider}`}>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* 1. Nilai Analog Sensor Hujan (ADC) */}
          <div
            className={`rounded-2xl p-4 transition-all hover:shadow-md flex flex-col justify-between border ${
              theme.isDark
                ? 'bg-slate-800/80 border-slate-700/50 shadow-sm'
                : isSunny
                ? 'bg-white border-amber-100/80 shadow-sm shadow-amber-100/50'
                : isCloudy
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-white border-sky-100/80 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  theme.isDark
                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <Activity className={`w-5 h-5 ${theme.isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <span
                className={`text-xs tracking-wide ${
                  theme.isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-semibold'
                }`}
              >
                Nilai Analog (ADC)
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className={`text-xl font-bold mt-1 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                N/A
              </span>
              <span className="text-xs font-medium ml-1.5 text-slate-400">
                (Bypass Mode)
              </span>
            </div>
          </div>

          {/* 2. Intensitas Cahaya (Lux) */}
          <div
            className={`rounded-2xl p-4 transition-all hover:shadow-md flex flex-col justify-between border ${
              theme.isDark
                ? 'bg-slate-800/80 border-slate-700/50 shadow-sm'
                : isSunny
                ? 'bg-white border-amber-100/80 shadow-sm shadow-amber-100/50'
                : isCloudy
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-white border-sky-100/80 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  theme.isDark
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    : 'bg-amber-50 text-amber-500'
                }`}
              >
                <Sun className={`w-5 h-5 ${theme.isDark ? 'text-amber-400' : 'text-amber-500'}`} />
              </div>
              <span
                className={`text-xs tracking-wide ${
                  theme.isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-semibold'
                }`}
              >
                Intensitas Cahaya
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className={`text-xl font-bold mt-1 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                {lightLux !== null ? `${Math.round(lightLux)} Lux` : '-'}
              </span>
            </div>
          </div>

          {/* 3. Suhu Udara Lingkungan (°C) */}
          <div
            className={`rounded-2xl p-4 transition-all hover:shadow-md flex flex-col justify-between border ${
              theme.isDark
                ? 'bg-slate-800/80 border-slate-700/50 shadow-sm'
                : isSunny
                ? 'bg-white border-amber-100/80 shadow-sm shadow-amber-100/50'
                : isCloudy
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-white border-sky-100/80 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  theme.isDark
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                <Thermometer className={`w-5 h-5 ${theme.isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <span
                className={`text-xs tracking-wide ${
                  theme.isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-semibold'
                }`}
              >
                Suhu Udara
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className={`text-xl font-bold mt-1 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatTemp(temperature)}
              </span>
            </div>
          </div>

          {/* 4. Kelembapan Relatif (%) */}
          <div
            className={`rounded-2xl p-4 transition-all hover:shadow-md flex flex-col justify-between border ${
              theme.isDark
                ? 'bg-slate-800/80 border-slate-700/50 shadow-sm'
                : isSunny
                ? 'bg-white border-amber-100/80 shadow-sm shadow-amber-100/50'
                : isCloudy
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-white border-sky-100/80 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  theme.isDark
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                    : 'bg-cyan-50 text-cyan-600'
                }`}
              >
                <Wind className={`w-5 h-5 ${theme.isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              </div>
              <span
                className={`text-xs tracking-wide ${
                  theme.isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-semibold'
                }`}
              >
                Kelembapan
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className={`text-xl font-bold mt-1 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                {humidity ? `${Math.round(humidity)}%` : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Banner Penjelasan Sensor Nonaktif */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-sky-400" />
          <span>Otomasi atap kanopi jemuran tetap aktif 100% dipandu oleh data cuaca satelit BMKG.</span>
        </div>

        {/* Sensor Last Updated Note */}
        <div className={`mt-2 flex items-center justify-between text-[11px] ${theme.isDark ? 'text-slate-400' : 'text-slate-400'}`}>
          <span className="text-slate-500 italic">Hardware ESP: Tahap Perakitan</span>
          <span className="font-mono">{formatRelativeTime(lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
}

export default LocalSensorPanel;
