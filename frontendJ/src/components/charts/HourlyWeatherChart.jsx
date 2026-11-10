import React, { useState, useMemo } from 'react';
import {
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Sun,
  CloudSun,
  Cloud,
  Moon,
  CloudMoon,
  Thermometer,
  Wind,
  Droplets,
  CloudUpload,
  Calendar,
} from 'lucide-react';
import { parseSafeDate } from '../../utils/formatDate';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

/**
 * Format jam dalam notasi titik khas Indonesia: HH.mm (contoh: 08.00, 09.00, 19.00)
 */
function formatHourDot(dateInput) {
  if (!dateInput) return '--.--';
  const d = parseSafeDate(dateInput);
  if (!d) return '--.--';
  try {
    return format(d, 'HH.mm', { locale: id });
  } catch {
    return '--.--';
  }
}

function formatDayLabel(dateInput) {
  if (!dateInput) return '';
  const d = parseSafeDate(dateInput);
  if (!d) return '';
  try {
    if (isToday(d)) return 'Hari Ini';
    if (isTomorrow(d)) return 'Besok';
    return format(d, 'EEE, d MMM', { locale: id });
  } catch {
    return '';
  }
}

/**
 * Komponen Ikon Cuaca Per Jam dengan dukungan ikon SVG resmi BMKG
 */
function HourlyWeatherIcon({ condition = '', time, iconUrl, className = 'w-6 h-6' }) {
  const [imageError, setImageError] = useState(false);

  if (iconUrl && !imageError) {
    return (
      <img
        src={iconUrl}
        alt={condition}
        className={`${className} object-contain filter drop-shadow`}
        onError={() => setImageError(true)}
      />
    );
  }

  const c = condition.toLowerCase();
  const d = parseSafeDate(time);
  const hour = d ? d.getHours() : 12;
  const isNight = hour < 6 || hour >= 18;

  // Hujan petir / badai
  if (c.includes('petir') || c.includes('badai') || c.includes('storm') || c.includes('thunder')) {
    return <CloudLightning className={`${className} text-amber-400 drop-shadow`} />;
  }

  // Hujan lebat / Hujan
  if (c.includes('hujan lebat') || c.includes('heavy rain')) {
    return <CloudRain className={`${className} text-sky-300 drop-shadow`} />;
  }

  // Hujan ringan / gerimis / curah
  if (c.includes('hujan') || c.includes('gerimis') || c.includes('drizzle') || c.includes('rain')) {
    return (
      <div className="flex flex-col items-center justify-center">
        <svg viewBox="0 0 24 24" className={`${className} text-sky-200 fill-current drop-shadow`}>
          <line x1="7" y1="4" x2="4" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="4" x2="10" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="19" y1="4" x2="16" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="7" y1="14" x2="4" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="14" x2="10" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="19" y1="14" x2="16" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Berawan tebal / mendung
  if (c.includes('tebal') || c.includes('overcast') || c.includes('mendung')) {
    return <Cloud className={`${className} text-slate-300 drop-shadow`} />;
  }

  // Berawan
  if (c.includes('berawan') || c.includes('cloud')) {
    return isNight ? (
      <CloudMoon className={`${className} text-slate-300 drop-shadow`} />
    ) : (
      <CloudSun className={`${className} text-amber-300 drop-shadow`} />
    );
  }

  // Cerah / Clear
  if (c.includes('cerah') || c.includes('clear') || c.includes('panas')) {
    return isNight ? (
      <Moon className={`${className} text-amber-200 drop-shadow`} />
    ) : (
      <Sun className={`${className} text-amber-400 drop-shadow`} />
    );
  }

  return isNight ? (
    <Moon className={`${className} text-amber-200`} />
  ) : (
    <Sun className={`${className} text-amber-400`} />
  );
}

/**
 * Menghitung path kurva SVG mulus (Smooth Spline) menghubungkan titik-titik suhu
 */
function buildSmoothSpline(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;

    const cp1x = p1.x + dx * 0.45;
    const cp1y = p1.y;
    const cp2x = p2.x - dx * 0.45;
    const cp2y = p2.y;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function HourlyWeatherChart({
  data = [],
  headline = '',
  className = '',
}) {
  const { theme } = useWeatherTheme();
  const isDark = theme?.isDark ?? true;
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'today', 'tomorrow', 'day3'

  // Filter data sesuai tab hari
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (activeTab === 'all') return data;

    const now = new Date();
    const day3Date = addDays(now, 2);

    return data.filter((item) => {
      const d = parseSafeDate(item.time);
      if (!d) return true;
      if (activeTab === 'today') return isToday(d);
      if (activeTab === 'tomorrow') return isTomorrow(d);
      if (activeTab === 'day3') {
        return d.getDate() === day3Date.getDate() && d.getMonth() === day3Date.getMonth();
      }
      return true;
    });
  }, [data, activeTab]);

  const displayData = filteredData.length > 0 ? filteredData : data;

  if (!displayData || displayData.length === 0) {
    return (
      <div className="rounded-3xl p-6 bg-slate-900/70 border border-slate-700/60 text-slate-400 text-xs text-center">
        Data prakiraan cuaca per jam tidak tersedia.
      </div>
    );
  }

  // Geometri grafik
  const itemWidth = 68; // Lebar per kolom jam (px)
  const svgHeight = 56; // Tinggi canvas kurva suhu (px)
  const paddingTop = 12;
  const paddingBottom = 14;
  const availableHeight = svgHeight - paddingTop - paddingBottom;

  // Analisis suhu
  const validTemps = displayData.map((d) => (typeof d.temperature === 'number' ? d.temperature : 26));
  const minTemp = Math.min(...validTemps);
  const maxTemp = Math.max(...validTemps);
  const tempSpan = Math.max(maxTemp - minTemp, 2.5);

  const points = displayData.map((item, i) => {
    const temp = typeof item.temperature === 'number' ? item.temperature : 26;
    const x = i * itemWidth + itemWidth / 2;
    const ratio = (temp - minTemp) / tempSpan;
    const y = svgHeight - paddingBottom - ratio * availableHeight;
    return { x, y, temp, item, index: i };
  });

  const pathD = buildSmoothSpline(points);
  const totalWidth = displayData.length * itemWidth;

  const conditionFirst = displayData[0]?.weather_condition || 'Prakiraan Cuaca';
  const displayHeadline =
    headline || `${conditionFirst}. Kisaran suhu ${Math.round(minTemp)}°C - ${Math.round(maxTemp)}°C.`;

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-b from-[#1b223d]/95 via-[#161c32]/95 to-[#121628]/95 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] text-white backdrop-blur-xl'
          : 'bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 text-white shadow-soft-lg'
      } ${className}`}
    >
      {/* Background Soft Glow Aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Headline & Tabs Filter Hari */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-white/15 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
            <Thermometer className="w-3.5 h-3.5" />
            <span>Prakiraan Cuaca Per Jam (Open-Meteo)</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-white mt-0.5">
            {displayHeadline}
          </h3>
        </div>

        {/* Tab Filter Periode Waktu */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl self-start sm:self-auto text-xs">
          {[
            { id: 'all', label: 'Semua 3 Hari' },
            { id: 'today', label: 'Hari Ini' },
            { id: 'tomorrow', label: 'Besok' },
            { id: 'day3', label: 'Lusa' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIdx(null);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-sky-500 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Area Cuaca & Kurva Suhu Per Jam (Horizontal Scroll) */}
      <div className="relative z-10 mt-4 overflow-x-auto custom-scrollbar pb-3">
        <div style={{ width: totalWidth, minWidth: '100%' }}>
          {/* Baris 1: Label Hari / Tanggal */}
          <div className="flex mb-1">
            {displayData.map((item, i) => {
              const d = parseSafeDate(item.time);
              const prevD = i > 0 ? parseSafeDate(displayData[i - 1].time) : null;
              const isNewDay = !prevD || (d && d.getDate() !== prevD.getDate());
              return (
                <div
                  key={`day-${i}`}
                  style={{ width: itemWidth }}
                  className="flex flex-col items-center justify-center text-[10px] font-semibold text-sky-300/80"
                >
                  {isNewDay && d ? format(d, 'd MMM', { locale: id }) : ''}
                </div>
              );
            })}
          </div>

          {/* Baris 2: Pukul / Waktu (15.00, 18.00, 21.00) */}
          <div className="flex">
            {displayData.map((item, i) => {
              const isSelected = selectedIdx === i;
              return (
                <div
                  key={`time-${i}`}
                  style={{ width: itemWidth }}
                  onClick={() => setSelectedIdx(isSelected ? null : i)}
                  className={`flex flex-col items-center justify-center cursor-pointer transition-transform ${
                    isSelected ? 'scale-105' : 'hover:opacity-90'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold font-sans tracking-tight transition-colors ${
                      isSelected ? 'text-sky-300 font-bold' : 'text-slate-200'
                    }`}
                  >
                    {formatHourDot(item.time)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Baris 3: Ikon Cuaca (SVG BMKG / Lucide) */}
          <div className="flex mt-2.5 mb-2">
            {displayData.map((item, i) => (
              <div
                key={`icon-${i}`}
                style={{ width: itemWidth }}
                onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
                className="flex items-center justify-center cursor-pointer"
                title={`${formatHourDot(item.time)} WIB: ${item.weather_condition || 'Cuaca'}`}
              >
                <HourlyWeatherIcon
                  condition={item.weather_condition}
                  time={item.time}
                  iconUrl={item.icon_url}
                  className="w-7 h-7 transition-transform hover:scale-110"
                />
              </div>
            ))}
          </div>

          {/* Baris 4: Suhu (°C) */}
          <div className="flex mb-1">
            {displayData.map((item, i) => {
              const tempVal = typeof item.temperature === 'number' ? Math.round(item.temperature) : '--';
              const isSelected = selectedIdx === i;
              return (
                <div
                  key={`temp-${i}`}
                  style={{ width: itemWidth }}
                  onClick={() => setSelectedIdx(isSelected ? null : i)}
                  className="flex items-center justify-center cursor-pointer"
                >
                  <span
                    className={`text-base font-extrabold tracking-tight transition-colors ${
                      isSelected ? 'text-sky-300' : 'text-white'
                    }`}
                  >
                    {tempVal}°
                  </span>
                </div>
              );
            })}
          </div>

          {/* Baris 5: Grafik Kurva Garis Suhu (SVG Spline & Node Titik Putih) */}
          <div className="relative mt-1" style={{ height: svgHeight, width: totalWidth }}>
            <svg
              width={totalWidth}
              height={svgHeight}
              className="overflow-visible select-none pointer-events-none"
            >
              {/* Outer Glow Halo Line */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth={5}
                strokeLinecap="round"
              />

              {/* Garis Kurva Putih Utama */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(255, 255, 255, 0.95)"
                strokeWidth={2.4}
                strokeLinecap="round"
              />

              {/* Titik / Nodes Lingkaran Putih di Tiap Jam */}
              {points.map((p, i) => {
                const isSelected = selectedIdx === i;
                return (
                  <g key={`point-${i}`}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 8 : 6}
                      fill="rgba(255, 255, 255, 0.25)"
                      className="transition-all duration-200"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 4.5 : 3.5}
                      fill={isSelected ? '#38bdf8' : '#ffffff'}
                      stroke="rgba(20, 24, 45, 0.8)"
                      strokeWidth={1.2}
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Baris 6: Badge Curah Hujan / Probabilitas */}
          <div className="flex mt-2">
            {displayData.map((item, i) => {
              const hasPrecip = item.precipitation && item.precipitation > 0;
              const prob = item.probability_of_rain;
              const isHigh = prob && prob >= 80;
              return (
                <div
                  key={`badge-${i}`}
                  style={{ width: itemWidth }}
                  className="flex items-center justify-center"
                >
                  {hasPrecip ? (
                    <span className="text-[10px] font-bold text-sky-200 bg-sky-900/60 px-1.5 py-0.5 rounded-full border border-sky-400/40">
                      {item.precipitation} mm
                    </span>
                  ) : prob !== null && prob !== undefined ? (
                    <span
                      className={`text-[10px] font-medium ${
                        isHigh ? 'text-rose-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {Math.round(prob)}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">-</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Detail Drawer jika salah satu jam/slot diklik */}
      {selectedIdx !== null && displayData[selectedIdx] && (
        <div className="mt-4 pt-3.5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 animate-fadeIn bg-white/5 p-3 rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block">Waktu Analisis</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>
                {formatDayLabel(displayData[selectedIdx].time)},{' '}
                {formatHourDot(displayData[selectedIdx].time)} WIB
              </span>
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block">Kondisi Cuaca</span>
            <span className="font-bold text-sky-300 flex items-center gap-1.5">
              <span>{displayData[selectedIdx].weather_condition}</span>
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block">Suhu & Kelembapan</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {displayData[selectedIdx].temperature ?? '--'}°C •{' '}
                {displayData[selectedIdx].humidity ?? '--'}%
              </span>
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block">Angin & Presipitasi</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {displayData[selectedIdx].wind_speed ?? 0} km/h {displayData[selectedIdx].wind_direction || ''} •{' '}
                {displayData[selectedIdx].precipitation ?? 0} mm
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default HourlyWeatherChart;
