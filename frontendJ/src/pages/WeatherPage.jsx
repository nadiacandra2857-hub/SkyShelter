import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  RefreshCw,
  Compass,
  Clock,
  Radio,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Search,
  Droplets,
  Wind,
  Gauge,
  ExternalLink,
  ChevronRight,
  Globe,
  Navigation,
  LocateFixed,
  Check,
  Filter,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import HourlyWeatherChart from '../components/charts/HourlyWeatherChart';
import RegionalWeatherMap from '../components/weather/RegionalWeatherMap';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import useWeather from '../hooks/useWeather';
import { useWeatherTheme } from '../context/WeatherThemeContext';
import { getWeatherColors, determineWeatherTheme } from '../utils/weatherTheme';
import { formatTemp, formatPercentage } from '../utils/formatters';
import { formatTime, formatDateTime } from '../utils/formatDate';

export function WeatherPage() {
  const { theme, activeCondition, autoCondition, overrideTheme, setOverrideTheme, updateTelemetry } = useWeatherTheme();
  const isDark = theme?.isDark;

  const {
    adm4,
    setAdm4,
    selectLocation,
    selectedCoords,
    regions,
    current,
    forecast,
    status,
    loading,
    refreshing,
    isLocating,
    userCoords,
    isGpsActive,
    detectLocation,
    error,
    refresh,
    isMockMode,
  } = useWeather();

  const [inputAdm4, setInputAdm4] = useState(adm4 || '35.78.07.1001');

  const [searchLocationQuery, setSearchLocationQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Sektor dan kota populer untuk akses cepat 1-klik
  const POPULAR_LOCATIONS = [
    { label: 'Deket, Lamongan', adm4: '35.24.25.2001', lat: -7.103144, lon: 112.429561 },
    { label: 'Lamongan Kota', adm4: '35.24.22.2001', lat: -7.1189, lon: 112.4150 },
    { label: 'Babat, Lamongan', adm4: '35.24.05.2001', lat: -7.1077, lon: 112.1643 },
    { label: 'Surabaya Pusat (Genteng)', adm4: '35.78.07.1001', lat: -7.26807, lon: 112.744108 },
    { label: 'Surabaya Barat (Tandes)', adm4: '35.78.14.1002', lat: -7.258994, lon: 112.68594 },
    { label: 'Kota Malang (Klojen)', adm4: '35.73.01.1001', lat: -7.9786, lon: 112.6318 },
    { label: 'Pamekasan, Madura', adm4: '35.28.03.2001', lat: -7.1611, lon: 113.4744 },
    { label: 'Banyuwangi (Giri)', adm4: '35.10.15.2001', lat: -8.2045, lon: 114.3644 },
  ];

  // Filter pencarian lokasi
  const searchMatches = (regions || []).filter((r) => {
    if (!searchLocationQuery.trim()) return false;
    const q = searchLocationQuery.toLowerCase();
    return (
      (r.district || '').toLowerCase().includes(q) ||
      (r.label || '').toLowerCase().includes(q) ||
      (r.city || '').toLowerCase().includes(q) ||
      (r.adm4 || '').includes(q)
    );
  }).slice(0, 6);

  const handleSelectQuickLocation = (loc) => {
    selectLocation({
      adm4: loc.adm4,
      lat: loc.lat,
      lon: loc.lon,
      label: loc.label,
      fromGps: false,
    });
    setSearchLocationQuery('');
    setShowDropdown(false);
  };


  // Sinkronkan inputAdm4 jika adm4 berubah dari GPS atau pemilihan luar
  useEffect(() => {
    if (adm4) {
      setInputAdm4(adm4);
    }
  }, [adm4]);

  const handleApplySearch = (e) => {
    e?.preventDefault();
    const query = (searchLocationQuery || inputAdm4 || '').trim();
    if (!query) return;

    // Cek apakah berupa koordinat (cth: -7.12, 112.43)
    const coordMatch = query.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[3]);
      selectLocation({
        lat,
        lon,
        label: `Koordinat (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        fromGps: false,
      });
      setShowDropdown(false);
      return;
    }

    // Cek apakah cocok dengan salah satu wilayah
    const found = (regions || []).find(
      (r) =>
        r.adm4 === query ||
        (r.district || '').toLowerCase() === query.toLowerCase() ||
        (r.label || '').toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      handleSelectQuickLocation({
        label: found.label || found.district,
        adm4: found.adm4,
        lat: found.latitude,
        lon: found.longitude,
      });
    } else {
      setAdm4(query, false);
    }
    setShowDropdown(false);
  };

  const handleSelectRegion = (code) => {
    setInputAdm4(code);
    setAdm4(code, false);
  };

  const handleTriggerGps = () => {
    detectLocation(false);
  };

  // Sinkronkan kondisi cuaca aktif dengan data cuaca Open-Meteo terkini (Hooks selalu terpanggil pertama)
  useEffect(() => {
    if (current && updateTelemetry) {
      updateTelemetry({
        weatherConditionText: current.weather_condition,
        probabilityOfRain: current.probability_of_rain,
      });
    }
  }, [current, updateTelemetry]);

  const pageCondition = React.useMemo(() => {
    if (current?.weather_condition || current?.probability_of_rain !== undefined) {
      return determineWeatherTheme({
        weatherConditionText: current.weather_condition,
        probabilityOfRain: current.probability_of_rain,
      });
    }
    return activeCondition;
  }, [current, activeCondition]);

  const weatherColors = React.useMemo(() => {
    return getWeatherColors(pageCondition, isDark);
  }, [pageCondition, isDark]);

  const isSunny = pageCondition === 'sunny' && !isDark;
  const isCloudy = pageCondition === 'cloudy' && !isDark;
  const isRainy = (pageCondition === 'rainy' || pageCondition === 'storm') && !isDark;

  const prob = current?.probability_of_rain ?? null;
  const isHighRisk = prob !== null && prob >= 80;
  const isModerateRisk = prob !== null && prob >= 50 && prob < 80;
  const isStale = current?.is_stale;

  // Nama lokasi berjenjang Open-Meteo
  const locationLabel = current?.location || 'Genteng, Kota Surabaya';
  const adm4Display = current?.adm4 || adm4 || '35.78.07.1001';

  // Early returns HANYA setelah semua Hooks selesai dipanggil
  if (loading && !current) {
    return <LoadingState message="Menghubungkan ke API Open-Meteo & memuat prakiraan cuaca..." />;
  }

  if (error && !current) {
    return (
      <ErrorState
        title="Gagal Memuat Data Cuaca"
        message={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-28 md:pb-32"
    >
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <CloudRain
              className={`w-3.5 h-3.5 ${
                isDark ? 'text-sky-400' : isSunny ? 'text-amber-500' : isCloudy ? 'text-slate-600' : 'text-sky-500'
              }`}
            />
            <span
              className={
                isDark
                  ? 'text-sky-400'
                  : isSunny
                  ? 'text-amber-600 font-bold'
                  : isCloudy
                  ? 'text-slate-700 font-bold'
                  : 'text-sky-600 font-bold'
              }
            >
              Prakiraan Cuaca Presisi (Open-Meteo)
            </span>

          </div>
          <h2 className={`text-xl md:text-2xl font-extrabold font-sans mt-0.5 ${isDark ? 'text-white' : 'text-charcoal'}`}>
            Satelit Cuaca & Radar Presipitasi (Open-Meteo)
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
            Deteksi otomatis titik lokasi pengguna via GPS untuk rekomendasi penutupan kanopi jemuran lebih awal (Early-Close)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tombol Deteksi Lokasi GPS Otomatis */}
          <Button
            variant="slate"
            size="sm"
            onClick={handleTriggerGps}
            isLoading={isLocating}
            leftIcon={LocateFixed}
            className={`font-semibold border transition-all ${
              isGpsActive
                ? weatherColors.subtleBtn
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            {isLocating ? 'Mencari GPS...' : isGpsActive ? 'Lokasi GPS Aktif' : 'Deteksi Lokasi GPS'}
          </Button>

          <Button
            variant={isSunny ? 'amber' : isCloudy ? 'slate' : 'sky'}
            size="sm"
            onClick={refresh}
            isLoading={refreshing}
            leftIcon={RefreshCw}
            className={
              isSunny
                ? 'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-soft shadow-amber-500/20 ring-1 ring-amber-400/30'
                : isCloudy
                ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm ring-1 ring-slate-600/30'
                : ''
            }
          >
            Sinkronkan Cuaca
          </Button>
        </div>
      </div>

      {/* Lokasi Interaktif & Pemilih Wilayah Open-Meteo */}
      <div
        className={`rounded-3xl p-6 sm:p-7 border transition-all duration-300 space-y-4 shadow-soft-md ${
          isDark
            ? 'bg-slate-900/80 border border-slate-700/60 backdrop-blur-md'
            : 'bg-white border border-slate-200 shadow-soft'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                isGpsActive
                  ? weatherColors.iconBox
                  : isDark
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {isGpsActive ? (
                <Navigation className={`w-5 h-5 animate-pulse ${weatherColors.textAccent}`} />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Stasiun / Lokasi:</span>
              </div>

              <div className="text-base sm:text-lg font-bold flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={isDark ? 'text-white' : 'text-charcoal'}>{locationLabel}</span>
              </div>
            </div>
          </div>

          {/* Form Pencarian Interaktif (Nama Kota / Kecamatan / Kode ADM4 / Koordinat) */}
          <form onSubmit={handleApplySearch} className="relative flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchLocationQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchLocationQuery(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder="Cari kecamatan, kota, atau koordinat..."
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${theme.isDark ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400" : isSunny ? "bg-amber-50/50 border-amber-200 text-slate-900 placeholder-slate-400 focus:bg-white" : isCloudy ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"}`}
              />

              {/* Dropdown Hasil Pencarian Interaktif */}
              {showDropdown && searchMatches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-800">
                  {searchMatches.map((match) => (
                    <button
                      key={match.adm4}
                      type="button"
                      onClick={() =>
                        handleSelectQuickLocation({
                          label: match.label || match.district,
                          adm4: match.adm4,
                          lat: match.latitude,
                          lon: match.longitude,
                        })
                      }
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-semibold block">{match.district || match.label}</span>
                        <span className="text-[10px] text-slate-400">{match.city}</span>
                      </div>
                      <span className="text-[10px] font-mono text-sky-400">{match.adm4}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || refreshing}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white transition-all shadow-sm flex items-center gap-1.5 shrink-0 disabled:opacity-50 ${weatherColors.primaryBtn}`}
            >
              <span>Terapkan</span>
            </button>
          </form>
        </div>

        {/* Shortcut Lokasi Cepat Populer (1-Klik Interaktif) */}
        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Pilihan Cepat:</span>
          </span>
          {POPULAR_LOCATIONS.map((loc) => {
            const isActive =
              (adm4 && loc.adm4 === adm4) ||
              (current?.district && loc.label.toLowerCase().includes(current.district.toLowerCase()));
            return (
              <button
                key={loc.label}
                type="button"
                onClick={() => handleSelectQuickLocation(loc)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 border flex items-center gap-1 ${
                  isActive
                    ? `${weatherColors.activeBtn}`
                    : isDark
                    ? 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <span>{loc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PETA CUACA INTERAKTIF PER SEKTOR WILAYAH (OPEN-METEO LIVE GRID) */}
      <RegionalWeatherMap
        adm4={adm4}
        selectedCoords={selectedCoords}
        onSelectLocation={selectLocation}
        onSelectRegion={handleSelectRegion}
        currentWeather={current}
        userCoords={userCoords}
        isGpsActive={isGpsActive}
        onTriggerGps={handleTriggerGps}
        isLocating={isLocating}
        isDark={isDark}
        activeCondition={pageCondition}
      />

      {/* Status Warning Banner (Simulated Mode) */}
      {isMockMode && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs transition-colors ${
            isDark
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
              : 'bg-amber-50 border border-amber-200/60 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Info className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>
              <strong>Mode Simulasi Data Cuaca:</strong> Menampilkan data sintetis karena konfigurasi VITE_USE_MOCK_DATA aktif.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[11px] opacity-80">BMKG Mock Engine</span>
        </div>
      )}

      {/* Main Forecast Hero Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
          isDark
            ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : isSunny
            ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
            : isCloudy
            ? 'bg-white border border-slate-200/80 shadow-sm'
            : 'bg-white border border-slate-200/80 shadow-soft-md'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Probability & Big Condition Indicator */}
          <div className="md:col-span-6 space-y-4">
            {isStale && (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                  (Data Kedaluwarsa)
                </span>
              </div>
            )}

            <div>
              <div className="flex items-baseline gap-3">
                <span className={`text-5xl md:text-6xl font-extrabold font-sans tracking-tight ${isDark ? 'text-white' : 'text-charcoal'}`}>
                  {prob !== null ? `${Math.round(prob)}%` : '--%'}
                </span>
                <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                  Probabilitas Presipitasi (Open-Meteo)
                </span>
              </div>

              {/* Weather Condition with Official BMKG Icon */}
              <div className="flex items-center gap-3 mt-3">
                {current?.icon_url ? (
                  <img
                    src={current.icon_url}
                    alt={current?.weather_condition || 'Cuaca'}
                    className="w-12 h-12 object-contain filter drop-shadow"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
                <div>
                  <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-sky-400' : isSunny ? 'text-amber-600' : isCloudy ? 'text-slate-700' : 'text-sky-600'}`}>
                    <span>{current?.weather_condition || 'Prakiraan Cuaca'}</span>
                    <span className={isDark ? 'text-slate-600' : 'text-muted-gray'}>•</span>
                    <span className={isDark ? 'text-white' : 'text-charcoal'}>{formatTemp(current?.temperature)}</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                    Stasiun Pengamatan: <strong className={isDark ? 'text-slate-200' : 'text-charcoal'}>{locationLabel}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Meteorological Parameters Strip (Presipitasi, Kelembapan, Angin, Awan) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                {
                  key: 'precipitation',
                  label: 'Curah Hujan',
                  val: current?.precipitation !== null && current?.precipitation !== undefined ? `${current.precipitation} mm` : '0 mm',
                  icon: Droplets,
                  darkIcon: 'text-sky-400',
                  darkVal: 'text-sky-300',
                },
                {
                  key: 'humidity',
                  label: 'Kelembapan',
                  val: current?.humidity !== null && current?.humidity !== undefined ? `${current.humidity}%` : '--%',
                  icon: Gauge,
                  darkIcon: 'text-cyan-400',
                  darkVal: 'text-cyan-300',
                },
                {
                  key: 'wind',
                  label: 'Angin',
                  val: `${current?.wind_speed ?? 0} km/h ${current?.wind_direction || ''}`.trim(),
                  icon: Wind,
                  darkIcon: 'text-teal-400',
                  darkVal: 'text-teal-300',
                },
                {
                  key: 'cloud',
                  label: 'Tutupan Awan',
                  val: current?.cloud_cover !== null && current?.cloud_cover !== undefined ? `${current.cloud_cover}%` : '--%',
                  icon: Cloud,
                  darkIcon: 'text-slate-300',
                  darkVal: 'text-slate-200',
                },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.key}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isDark
                        ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 shadow-xs'
                        : isSunny
                        ? 'bg-gradient-to-br from-amber-50 to-amber-100/60 border-amber-200/90 hover:border-amber-300 shadow-xs'
                        : isRainy || isHighRisk
                        ? 'bg-gradient-to-br from-sky-50 to-blue-100/60 border-sky-200/90 hover:border-sky-300 shadow-xs'
                        : isCloudy
                        ? 'bg-gradient-to-br from-slate-50 to-slate-100/80 border-slate-200 hover:border-slate-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <IconComponent
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isDark
                            ? item.darkIcon
                            : isSunny
                            ? 'text-amber-600'
                            : isRainy || isHighRisk
                            ? 'text-sky-600'
                            : isCloudy
                            ? 'text-slate-500'
                            : 'text-sky-600'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider truncate ${
                          isDark
                            ? 'text-slate-400'
                            : isSunny
                            ? 'text-amber-900/75'
                            : isRainy || isHighRisk
                            ? 'text-sky-900/75'
                            : isCloudy
                            ? 'text-slate-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-bold font-mono block truncate ${
                        isDark
                          ? item.darkVal
                          : isSunny
                          ? 'text-amber-950'
                          : isRainy || isHighRisk
                          ? 'text-sky-950'
                          : isCloudy
                          ? 'text-slate-800'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Rationale Box */}
          <div
            className={`md:col-span-6 p-5 rounded-2xl space-y-3 border transition-colors ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                : isHighRisk
                ? 'bg-rose-50/80 border-rose-200/80 text-rose-950'
                : isRainy
                ? 'bg-sky-50/80 border-sky-200/80 text-sky-950'
                : isSunny
                ? 'bg-amber-50/60 border-amber-200/70 text-slate-700'
                : isCloudy
                ? 'bg-slate-100/70 border-slate-300 text-slate-700'
                : 'bg-slate-50 border-slate-200/70 text-muted-gray'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-charcoal'}`}>
                <Radio className={`w-4 h-4 ${isDark ? 'text-sky-400' : isHighRisk ? 'text-rose-500' : isRainy ? 'text-sky-500' : isSunny ? 'text-amber-500' : isCloudy ? 'text-slate-600' : 'text-sky-400'}`} />
                <span>Rekomendasi Algoritma Early-Close:</span>
              </span>
              <StatusBadge variant={isHighRisk ? 'danger' : isSunny ? 'amber' : isCloudy ? 'cloudy' : 'neutral'} size="sm">
                {isHighRisk ? 'Tutup Lebih Awal' : 'Tetap Buka'}
              </StatusBadge>
            </div>

            <p className="text-xs leading-relaxed">
              {isHighRisk
                ? `Berdasarkan radar cuaca Open-Meteo, probabilitas hujan di wilayah ${locationLabel} melampaui ambang batas 80%. Sistem SkyShelter secara proaktif merekomendasikan penutupan kanopi jemuran sebelum tetesan hujan pertama menyentuh pakaian.`
                : isModerateRisk
                ? `Probabilitas hujan berada pada tingkat siaga menengah (50-79%). Kanopi tetap dibuka untuk memaksimalkan penjemuran, namun sistem bersiap menutup jika sensor lokal terpicu.`
                : `Prakiraan presipitasi rendah. Kondisi cuaca sangat kondusif untuk menjemur pakaian di bawah paparan sinar matahari.`}
            </p>

            
          </div>
        </div>
      </div>

      {/* Prakiraan Cuaca & Grafik Kurva Suhu Per Jam BMKG */}
      <HourlyWeatherChart
        data={forecast?.hourly_forecasts || []}
        headline={
          current?.weather_condition
            ? `${current.weather_condition} di ${locationLabel}. Suhu saat ini ${formatTemp(current?.temperature)}.`
            : undefined
        }
      />

      {/* Provider Details & Telemetry Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`rounded-2xl p-5 transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-soft'
              : isSunny
              ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
              : isCloudy
              ? 'bg-white border border-slate-200/80 shadow-sm'
              : 'bg-white border border-slate-200/80 shadow-soft'
          }`}
        >
          <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Penyedia Data Cuaca</span>
          <h4 className={`text-base font-bold uppercase ${isDark ? 'text-white' : 'text-charcoal'}`}>
            Open-Meteo High-Speed API
          </h4>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
            Endpoint: <code className="font-mono text-[11px] text-sky-400">api.open-meteo.com/v1/forecast</code>
          </p>
          {current?.latitude && current?.longitude && (
            <p className={`text-[11px] mt-1 font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Koordinat Stasiun: {current.latitude.toFixed(4)}, {current.longitude.toFixed(4)}
            </p>
          )}
        </div>

        <div
          className={`rounded-2xl p-5 transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-soft'
              : isSunny
              ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
              : isCloudy
              ? 'bg-white border border-slate-200/80 shadow-sm'
              : 'bg-white border border-slate-200/80 shadow-soft'
          }`}
        >
          <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Status Sinkronisasi Cuaca</span>
          <h4 className={`text-base font-bold flex items-center gap-1.5 ${isDark ? 'text-sky-400' : isSunny ? 'text-amber-600' : isCloudy ? 'text-slate-700' : 'text-sky-500'}`}>
            <CheckCircle2 className={`w-4 h-4 ${isSunny ? 'text-amber-500' : isCloudy ? 'text-slate-600' : 'text-sky-400'}`} />
            <span>{status?.is_available ? 'Layanan Open-Meteo Terkoneksi' : 'Terhambat'}</span>
          </h4>
          <p className={`text-xs mt-1 font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
            Diperbarui: {status?.last_successful_fetch ? formatTime(status.last_successful_fetch) : '-'} WIB
          </p>
        </div>

        <div
          className={`rounded-2xl p-5 transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-soft'
              : isSunny
              ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
              : isCloudy
              ? 'bg-white border border-slate-200/80 shadow-sm'
              : 'bg-white border border-slate-200/80 shadow-soft'
          }`}
        >
          <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Interval Cache & Polling</span>
          <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>
            Setiap {status?.poll_interval_minutes || 15} Menit
          </h4>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
            Cache 10 menit untuk mencegah rate limit dan menghemat kuota transmisi
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default WeatherPage;
