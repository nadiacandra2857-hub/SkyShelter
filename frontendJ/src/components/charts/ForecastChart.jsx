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

export function ForecastChart({ data = [], height = 240, threshold = 80 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-muted-gray">
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
        <div className="p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-soft-lg border border-sage/30 text-xs">
          <p className="font-semibold text-charcoal mb-1">Pukul: {label} WIB</p>
          <p className="text-forest font-medium">
            Kondisi: <span className="text-charcoal font-bold">{p.condition}</span>
          </p>
          <p className="text-soft-amber font-medium">
            Probabilitas Hujan:{' '}
            <span className="font-mono font-bold text-charcoal">{p.probability}%</span>
          </p>
          {p.temperature && (
            <p className="text-muted-gray text-[11px] mt-1">
              Suhu: {p.temperature}°C • Kelembapan: {p.humidity}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E8B65B" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#E8B65B" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#A8BBA0" strokeOpacity={0.25} />
          <XAxis
            dataKey="time"
            stroke="#7B847E"
            fontSize={11}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#7B847E"
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
            stroke="#D96C5F"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Ambang Early-Close (${threshold}%)`,
              fill: '#D96C5F',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Area
            type="monotone"
            dataKey="probability"
            stroke="#E8B65B"
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
