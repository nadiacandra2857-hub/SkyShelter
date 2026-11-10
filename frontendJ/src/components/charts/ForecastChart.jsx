import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatTime } from '../../utils/formatDate';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function ForecastChart({ data = [], height = 240, threshold = 80 }) {
  const { theme, activeCondition } = useWeatherTheme();
  const isDark = theme?.isDark;
  const isSunny = activeCondition === 'sunny' && !isDark;
  const isCloudy = activeCondition === 'cloudy' && !isDark;

  if (!data || data.length === 0) {
    return (
      <div className={`h-60 flex items-center justify-center text-xs ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
        Tidak ada data prakiraan cuaca tersedia.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    time: formatTime(item.time, false),
    probability: item.probability_of_rain ?? 0,
    condition: item.weather_condition || 'Normal',
    temperature: item.temperature,
    humidity: item.humidity,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div
          className={`p-3 rounded-xl shadow-soft-lg text-xs backdrop-blur-md border ${
            isDark
              ? 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/50'
              : isSunny
              ? 'bg-white/95 border-amber-200/80 text-charcoal shadow-amber-100/50'
              : isCloudy
              ? 'bg-white/95 border-slate-300 text-charcoal shadow-sm'
              : 'bg-white/95 border-slate-200 text-charcoal'
          }`}
        >
          <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-charcoal'}`}>Pukul: {label} WIB</p>
          <p className={`${isSunny ? 'text-amber-600' : isCloudy ? 'text-slate-700' : 'text-sky-400'} font-medium`}>
            Kondisi: <span className={`font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>{p.condition}</span>
          </p>
          <p className={`${isSunny ? 'text-amber-500' : isCloudy ? 'text-slate-600' : 'text-sky-300'} font-medium`}>
            Probabilitas Hujan:{' '}
            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>{p.probability}%</span>
          </p>
          {p.temperature && (
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
              Suhu: {p.temperature}°C • Kelembapan: {p.humidity}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const strokeColor = isDark ? '#38bdf8' : isSunny ? '#f59e0b' : isCloudy ? '#64748b' : '#0284c7';
  const gridColor = isDark ? '#1e293b' : isSunny ? '#fef3c7' : isCloudy ? '#e2e8f0' : '#cbd5e1';
  const axisColor = isDark ? '#94a3b8' : isSunny ? '#b45309' : isCloudy ? '#64748b' : '#7B847E';

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isCloudy ? '#94a3b8' : strokeColor}
                stopOpacity={isDark ? 0.45 : isSunny ? 0.35 : isCloudy ? 0.10 : 0.35}
              />
              <stop
                offset="95%"
                stopColor={isCloudy ? '#94a3b8' : strokeColor}
                stopOpacity={isSunny ? 0.10 : isCloudy ? 0.02 : 0.01}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={isDark ? 0.8 : 0.5} />
          <XAxis
            dataKey="time"
            stroke={axisColor}
            fontSize={11}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke={axisColor}
            fontSize={11}
            domain={[0, 100]}
            tickLine={false}
            ticks={[0, 25, 50, 75, 100]}
            unit="%"
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Garis Ambang Early-Close (80%) */}
          <ReferenceLine
            y={threshold}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Ambang Early-Close (${threshold}%)`,
              fill: '#ef4444',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Area
            type="monotone"
            dataKey="probability"
            stroke={strokeColor}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#forecastGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ForecastChart;
