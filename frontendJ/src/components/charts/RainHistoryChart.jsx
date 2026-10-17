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

export function RainHistoryChart({ data = [], height = 240 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-muted-gray">
        Tidak ada data pembacaan sensor hujan.
      </div>
    );
  }

  // Format data untuk visualisasi: nilai ADC dibalik agar semakin basah semakin tinggi grafiknya
  // atau tampilkan nilai Analog asli 0-1023
  const chartData = data.map((item) => ({
    time: formatTime(item.recorded_at, false),
    analog: item.rain_analog_value ?? 1023,
    wetness: Math.max(0, 1023 - (item.rain_analog_value ?? 1023)), // 0 = kering, >600 = basah
    temperature: item.temperature,
    humidity: item.humidity,
    isRain: item.rain_detected,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-soft-lg border border-sage/30 text-xs">
          <p className="font-semibold text-charcoal mb-1">Pukul: {label} WIB</p>
          <p className="text-forest">
            Nilai ADC:{' '}
            <span className="font-mono font-bold">{p.analog}</span>{' '}
            <span className="text-[10px] text-muted-gray">
              {p.isRain ? '(Hujan Basah)' : '(Kering)'}
            </span>
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
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2F6B50" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2F6B50" stopOpacity={0.02} />
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
            domain={[0, 1023]}
            tickLine={false}
            ticks={[0, 300, 600, 1023]}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Garis ambang batas sensor basah (400) */}
          <ReferenceLine
            y={400}
            stroke="#D96C5F"
            strokeDasharray="4 4"
            label={{
              value: 'Ambang Basah (<400)',
              fill: '#D96C5F',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Area
            type="monotone"
            dataKey="analog"
            stroke="#2F6B50"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#rainGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RainHistoryChart;
