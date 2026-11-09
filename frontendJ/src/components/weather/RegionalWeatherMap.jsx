import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  LocateFixed,
  Search,
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  Droplets,
  Wind,
  Thermometer,
  Layers,
  Grid,
  Check,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Sparkles,
  Maximize2,
  Plus,
  Minus,
  Eye,
  Sliders,
  X,
  Radio,
} from 'lucide-react';
import { WEATHER_SECTIONS, buildRegionalWeather } from '../../data/weatherSections';
import { useWeatherTheme } from '../../context/WeatherThemeContext';
import { getWeatherColors } from '../../utils/weatherTheme';

/**
 * Konversi Koordinat Geografis (Lat, Lon) ke Pixel Global Web Mercator pada Zoom Z
 */
function project(lat, lon, zoom) {
  const scale = 256 * Math.pow(2, zoom);
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.max(-0.9999, Math.min(0.9999, sinLat));
  const x = ((lon + 180) / 360) * scale;
  const y = (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) * scale;
  return { x, y };
}

/**
 * Konversi Pixel Global Web Mercator kembali ke Koordinat (Lat, Lon)
 */
function unproject(x, y, zoom) {
  const scale = 256 * Math.pow(2, zoom);
  const lon = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lon };
}

// Opsi Layer Radar OpenWeatherMap
const OWM_LAYERS = [
  { id: 'precipitation_new', name: 'Presipitasi Hujan', icon: '🌧️', unit: 'mm' },
  { id: 'clouds_new', name: 'Tutupan Awan', icon: '☁️', unit: '%' },
  { id: 'temp_new', name: 'Distribusi Suhu', icon: '🌡️', unit: '°C' },
  { id: 'wind_new', name: 'Kecepatan Angin', icon: '💨', unit: 'm/s' },
];

export function RegionalWeatherMap({
  adm4,
  selectedCoords,
  onSelectLocation,
  onSelectRegion,
  currentWeather,
  userCoords,
  isGpsActive,
  onTriggerGps,
  isLocating,
  isDark = true,
  activeCondition,
}) {
  const themeContext = useWeatherTheme();
  const currentCondition = activeCondition || themeContext?.activeCondition || 'sunny';
  const weatherColors = useMemo(() => {
    return getWeatherColors(currentCondition, isDark);
  }, [currentCondition, isDark]);

  const isSunny = currentCondition === 'sunny' && !isDark;
  const isCloudy = currentCondition === 'cloudy' && !isDark;
  const isRainy = (currentCondition === 'rainy' || currentCondition === 'storm') && !isDark;
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });

  // Helper pilih lokasi interaktif
  const handlePickLocation = useCallback(
    (loc) => {
      if (onSelectLocation) {
        onSelectLocation(loc);
      } else if (onSelectRegion && loc.adm4) {
        onSelectRegion(loc.adm4);
      }
    },
    [onSelectLocation, onSelectRegion]
  );

  const mouseDownPosRef = useRef({ x: 0, y: 0, time: 0 });

  // Map Viewport State: Skala Provinsi Jawa Timur, Indonesia
  const [center, setCenter] = useState({ lat: -7.68, lon: 112.55 });
  const [zoom, setZoom] = useState(8);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Batas Geografis Terkunci Provinsi Jawa Timur (Bounding Box Clamping)
  const JATIM_BOUNDS = {
    minLat: -8.90,
    maxLat: -6.65,
    minLon: 110.80,
    maxLon: 114.80,
  };

  const clampCoordsToJatim = (lat, lon) => ({
    lat: Math.max(JATIM_BOUNDS.minLat, Math.min(JATIM_BOUNDS.maxLat, lat)),
    lon: Math.max(JATIM_BOUNDS.minLon, Math.min(JATIM_BOUNDS.maxLon, lon)),
  });

  // Radar Satelit & Basemap OSM Lokal (Offline Batch)
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || 'permanent_active';
  const [activeOwmLayer, setActiveOwmLayer] = useState('precipitation_new');
  const [mapStyle, setMapStyle] = useState('osm'); // 'osm' | 'dark' | 'satellite'
  const [radarOpacity, setRadarOpacity] = useState(0.85);
  const [radarPath, setRadarPath] = useState('/v2/radar/871b889f3326');
  const [radarHost, setRadarHost] = useState('https://tilecache.rainviewer.com');

  // Ambil metadata frame radar presipitasi satelit terbaru secara live
  useEffect(() => {
    let isMounted = true;
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.host) setRadarHost(data.host);
        const past = data?.radar?.past;
        if (past && past.length > 0) {
          const latest = past[past.length - 1];
          if (latest?.path) {
            setRadarPath(latest.path);
          }
        }
      })
      .catch((err) => {
        console.warn('Radar metadata fallback:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Mode Tampilan
  const [selectedCity, setSelectedCity] = useState('all'); // 'all' | 'surabaya' | 'lamongan'
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePopupDistrict, setActivePopupDistrict] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'cards' | 'split'

  // Hitung cuaca regional per kecamatan & per sektor
  const { districtsMap, sectionsWithWeather } = useMemo(() => {
    return buildRegionalWeather(currentWeather, adm4);
  }, [currentWeather, adm4]);

  // Update dimensi container canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter sections
  const filteredSections = useMemo(() => {
    return sectionsWithWeather.filter((sec) => {
      if (selectedCity === 'surabaya') return sec.city === 'Kota Surabaya';
      if (selectedCity === 'lamongan') return sec.city === 'Kab. Lamongan';
      return true;
    });
  }, [sectionsWithWeather, selectedCity]);

  // Filter districts
  const filteredDistricts = useMemo(() => {
    return Object.values(districtsMap).filter((d) => {
      const isSurabaya = d.city === 'Kota Surabaya';
      const isLamongan = d.city.includes('Lamongan');

      if (selectedCity === 'surabaya' && !isSurabaya) return false;
      if (selectedCity === 'lamongan' && !isLamongan) return false;
      if (activeSectionId && d.sectionId !== activeSectionId) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (d.district || '').toLowerCase().includes(q);
        const matchSub = (d.subdistrict || '').toLowerCase().includes(q);
        const matchLabel = (d.label || '').toLowerCase().includes(q);
        const matchAdm4 = (d.adm4 || '').includes(q);
        return matchName || matchSub || matchLabel || matchAdm4;
      }
      return true;
    });
  }, [districtsMap, selectedCity, activeSectionId, searchQuery]);

  // Hitung tile grid yang perlu di-render
  const visibleTiles = useMemo(() => {
    const { width, height } = dimensions;
    const centerPixel = project(center.lat, center.lon, zoom);
    const x0 = centerPixel.x - width / 2;
    const y0 = centerPixel.y - height / 2;
    const x1 = centerPixel.x + width / 2;
    const y1 = centerPixel.y + height / 2;

    const minTileX = Math.floor(x0 / 256);
    const maxTileX = Math.floor(x1 / 256);
    const minTileY = Math.floor(y0 / 256);
    const maxTileY = Math.floor(y1 / 256);

    const tiles = [];
    const maxIndex = Math.pow(2, zoom);

    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        if (ty < 0 || ty >= maxIndex) continue;
        const normalizedTx = ((tx % maxIndex) + maxIndex) % maxIndex;
        const screenX = tx * 256 - x0;
        const screenY = ty * 256 - y0;

        tiles.push({
          key: `${zoom}-${normalizedTx}-${ty}`,
          z: zoom,
          x: normalizedTx,
          y: ty,
          screenX,
          screenY,
        });
      }
    }
    return { tiles, x0, y0 };
  }, [center, zoom, dimensions]);

  // Pan / Drag Handlers & Interactive Map Click
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // hanya klik kiri
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    const currentCenterPixel = project(center.lat, center.lon, zoom);
    const newCenterPixel = {
      x: currentCenterPixel.x - dx,
      y: currentCenterPixel.y - dy,
    };
    const newCoords = unproject(newCenterPixel.x, newCenterPixel.y, zoom);
    setCenter(clampCoordsToJatim(newCoords.lat, newCoords.lon));
  }, [isDragging, dragStart, center, zoom]);

  const handleMouseUp = (e) => {
    setIsDragging(false);
    if (!e || !containerRef.current) return;
    const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
    const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
    const dt = Date.now() - mouseDownPosRef.current.time;

    // Jika gerak mouse < 6px dan durasi < 500ms, ini adalah KLIK pada peta
    if (dx < 6 && dy < 6 && dt < 500) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickScreenX = e.clientX - rect.left;
      const clickScreenY = e.clientY - rect.top;
      const globalPixelX = clickScreenX + visibleTiles.x0;
      const globalPixelY = clickScreenY + visibleTiles.y0;
      const coords = unproject(globalPixelX, globalPixelY, zoom);
      const clamped = clampCoordsToJatim(coords.lat, coords.lon);

      // Cari kecamatan terdekat dengan titik klik
      let nearestDist = Infinity;
      let nearestDistObj = null;
      Object.values(districtsMap).forEach((d) => {
        const dist = Math.hypot(d.latitude - clamped.lat, d.longitude - clamped.lon);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestDistObj = d;
        }
      });

      const label =
        nearestDist < 0.15 && nearestDistObj
          ? `${nearestDistObj.district || nearestDistObj.label}`
          : `Koordinat (${clamped.lat.toFixed(4)}, ${clamped.lon.toFixed(4)})`;

      handlePickLocation({
        adm4: nearestDist < 0.15 && nearestDistObj ? nearestDistObj.adm4 : adm4,
        lat: clamped.lat,
        lon: clamped.lon,
        label,
      });
    }
  };

  // Zoom Controls (Terkunci pada skala aman Jawa Timur: min 7, max 13)
  const handleZoomIn = () => setZoom((z) => Math.min(13, z + 1));
  const handleZoomOut = () => setZoom((z) => Math.max(7, z - 1));

  // Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(13, z + 1));
    } else if (e.deltaY > 0) {
      setZoom((z) => Math.max(7, z - 1));
    }
  };

  // Sentuh / Mobile Pan
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });

    const currentCenterPixel = project(center.lat, center.lon, zoom);
    const newCoords = unproject(currentCenterPixel.x - dx, currentCenterPixel.y - dy, zoom);
    setCenter(clampCoordsToJatim(newCoords.lat, newCoords.lon));
  };

  // Pusatkan ke stasiun aktif saat adm4 berubah
  useEffect(() => {
    if (adm4 && districtsMap[adm4]) {
      const target = districtsMap[adm4];
      setCenter({ lat: target.latitude, lon: target.longitude });
    }
  }, [adm4, districtsMap]);

  // Aksi Pilih Sektor
  const handleSelectSection = (sec) => {
    setActiveSectionId((prev) => (prev === sec.id ? null : sec.id));
    if (sec.center) {
      setCenter({ lat: sec.center[0], lon: sec.center[1] });
      setZoom(sec.zoom || 12);
    }
  };

  // Reset Tampilan ke Penuh Provinsi Jawa Timur
  const handleResetView = () => {
    setActiveSectionId(null);
    setSearchQuery('');
    setSelectedCity('all');
    setCenter({ lat: -7.68, lon: 112.55 });
    setZoom(8);
  };

  // Pusatkan ke GPS Pengguna
  const handleCenterGps = () => {
    if (userCoords && userCoords.latitude) {
      setCenter({ lat: userCoords.latitude, lon: userCoords.longitude });
      setZoom(13);
    } else {
      onTriggerGps();
    }
  };

  // Hitung posisi pixel titik aktif Open-Meteo
  const activePointCoords = useMemo(() => {
    if (selectedCoords?.lat && selectedCoords?.lon) {
      return { lat: selectedCoords.lat, lon: selectedCoords.lon };
    }
    if (currentWeather?.latitude && currentWeather?.longitude) {
      return { lat: currentWeather.latitude, lon: currentWeather.longitude };
    }
    if (adm4 && districtsMap[adm4]) {
      return { lat: districtsMap[adm4].latitude, lon: districtsMap[adm4].longitude };
    }
    return null;
  }, [selectedCoords, currentWeather, adm4, districtsMap]);

  const activePointPixel = useMemo(() => {
    if (!activePointCoords) return null;
    const p = project(activePointCoords.lat, activePointCoords.lon, zoom);
    return {
      x: p.x - visibleTiles.x0,
      y: p.y - visibleTiles.y0,
    };
  }, [activePointCoords, zoom, visibleTiles]);

  // Hitung posisi pixel GPS Pengguna di layar
  const userGpsPixel = useMemo(() => {
    if (!userCoords || !userCoords.latitude || !userCoords.longitude) return null;
    const p = project(userCoords.latitude, userCoords.longitude, zoom);
    return {
      x: p.x - visibleTiles.x0,
      y: p.y - visibleTiles.y0,
    };
  }, [userCoords, zoom, visibleTiles]);

  return (
    <div
      className={`rounded-3xl border transition-all overflow-hidden shadow-soft-md ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/60 shadow-xl'
          : isSunny
          ? 'bg-white border-amber-200/80 shadow-amber-100/30'
          : isCloudy
          ? 'bg-white border-slate-200/80 shadow-sm'
          : 'bg-white border-slate-200 shadow-soft-md'
      }`}
    >
      {/* 1. Header Toolbar Peta Cuaca & Radar Satelit */}
      <div className={`p-5 sm:p-6 border-b space-y-4 transition-colors ${isDark ? "border-slate-800" : isSunny ? "border-amber-100" : isCloudy ? "border-slate-200/80" : "border-slate-200/60"}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`p-1.5 rounded-lg border ${weatherColors.iconBox}`}>
                <Compass className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${weatherColors.textAccent}`}>
                PETA CUACA INTERAKTIF OPEN-METEO
              </span>

            </div>

            <h3 className={`text-lg sm:text-xl font-extrabold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Peta Radar & Satelit Cuaca Jawa Timur
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik titik manapun pada peta atau pilih kecamatan untuk memuat prakiraan cuaca Open-Meteo secara real-time.
            </p>
          </div>

          {/* Quick Actions & GPS Locate */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* GPS Locate Button */}
            <button
              type="button"
              onClick={handleCenterGps}
              disabled={isLocating}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all shadow-sm ${
                isGpsActive
                  ? weatherColors.subtleBtn
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : isSunny
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  : isCloudy
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin ' + weatherColors.textAccent : isGpsActive ? weatherColors.textAccent : ''}`} />
              <span>{isLocating ? 'Mencari GPS...' : isGpsActive ? 'Pusatkan ke GPS' : 'Deteksi GPS'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetView}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : isSunny
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  : isCloudy
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* View Mode Switcher */}
            <div className={`flex items-center p-0.5 rounded-xl border text-xs transition-colors ${
              isDark
                ? 'bg-slate-800/80 border-slate-700'
                : isSunny
                ? 'bg-amber-50 border-amber-200'
                : isCloudy
                ? 'bg-slate-100 border-slate-300'
                : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  viewMode === 'map'
                    ? `${weatherColors.activeBtn}`
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Peta Radar
              </button>

              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all hidden sm:inline-block ${
                  viewMode === 'split'
                    ? `${weatherColors.activeBtn}`
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Split
              </button>
            </div>
          </div>
        </div>

        {/* Radar Layer Selector, Basemap Style & City Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
          {/* Layer Radar OpenWeatherMap & Basemap Style */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar flex-wrap">


            {/* Pilihan Gaya Basemap (OSM Offline Batch Default) */}
            <div className={`flex items-center p-0.5 rounded-xl border text-xs shrink-0 ml-1 transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : isSunny
                ? 'bg-amber-50 border-amber-200'
                : isCloudy
                ? 'bg-slate-100 border-slate-300'
                : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setMapStyle('osm')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  mapStyle === 'osm'
                    ? `${weatherColors.activeBtn}`
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="PETA CUACA INTERAKTIF OPEN-METEO"
              >
                OSM Jatim (Offline)
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('dark')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  mapStyle === 'dark'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Peta Gelap (Esri Canvas - Bebas Watermark)"
              >
                Gelap
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('satellite')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  mapStyle === 'satellite'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Citra Satelit Fotorealistik (Esri - Bebas Watermark)"
              >
                Satelit
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kecamatan..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans transition-colors ${
                isDark
                  ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>


      </div>

      {/* 2. Peta Kanvas Slippy Map (Pure React + OpenWeatherMap Radar Tiles) */}
      <div className="relative">
        <div
          className={`${viewMode === 'cards' ? 'hidden' : 'block'} ${
            viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-12' : ''
          }`}
        >
          {/* Map Viewport Area */}
          <div
            className={`relative select-none overflow-hidden bg-slate-950 ${
              viewMode === 'split' ? 'lg:col-span-8' : 'w-full'
            }`}
            style={{ height: '500px' }}
          >
            {/* Interactive Canvas Drag Container */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              onWheel={handleWheel}
              className={`w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden ${
                isDragging ? 'cursor-grabbing' : ''
              }`}
            >
              {/* Tile Layers */}
              {visibleTiles.tiles.map((t) => {
                // Basemap Resolvers (Prioritas 1: Ubin Offline Lokal OSM, Fallback 1: OSM-DE, Fallback 2: Esri Street - Bebas 403)
                const localOsmUrl = `/tiles/${t.z}/${t.x}/${t.y}.png`;
                const osmDeUrl = `https://tile.openstreetmap.de/${t.z}/${t.x}/${t.y}.png`;
                const esriStreetUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${t.z}/${t.y}/${t.x}`;
                const baseTileUrl =
                  mapStyle === 'dark'
                    ? `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${t.z}/${t.y}/${t.x}`
                    : mapStyle === 'satellite'
                    ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${t.z}/${t.y}/${t.x}`
                    : localOsmUrl;

                // PENTING: RainViewer gratis strictly membatasi radar hanya pada Zoom <= 7!
                // Pada Zoom >= 8, server RainViewer mengembalikan tile error: "Zoom level not supported".
                // Maka, radar makro RainViewer hanya di-request pada Zoom <= 7.
                const radarTileUrl =
                  apiKey && apiKey !== 'permanent_active'
                    ? `https://tile.openweathermap.org/map/${activeOwmLayer}/${t.z}/${t.x}/${t.y}.png?appid=${apiKey}`
                    : t.z <= 7
                    ? `${radarHost}${radarPath}/256/${t.z}/${t.x}/${t.y}/2/1_1.png`
                    : null;

                return (
                  <div
                    key={t.key}
                    className="absolute w-[256px] h-[256px] pointer-events-none"
                    style={{
                      left: t.screenX,
                      top: t.screenY,
                    }}
                  >
                    {/* Layer 1: Geografis Basemap (OSM Offline Batch dengan Multi-Tier Fallback Bebas 403) */}
                    <img
                      src={baseTileUrl}
                      alt="OSM Jawa Timur"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Jangan pernah meminta ke tile.openstreetmap.org yang memicu 403 Access Blocked
                        if (!e.currentTarget.dataset.fallback) {
                          e.currentTarget.src = esriStreetUrl;
                          e.currentTarget.dataset.fallback = '1';
                        } else if (e.currentTarget.dataset.fallback === '1') {
                          e.currentTarget.src = osmDeUrl;
                          e.currentTarget.dataset.fallback = '2';
                        } else {
                          e.currentTarget.style.opacity = '0.3';
                        }
                      }}
                    />

                    {/* Layer 2: Live Radar Satelit Presipitasi */}
                    {radarTileUrl && (
                      <img
                        src={radarTileUrl}
                        alt="Radar Satelit Cuaca"
                        className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-300"
                        style={{
                          opacity: radarOpacity,
                          mixBlendMode: 'screen',
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {/* Synthetic Radar Pulse Scan Sweep */}
              <div className="absolute inset-0 pointer-events-none bg-radial from-sky-500/5 via-transparent to-transparent opacity-40 pointer-events-none" />

                            {/* Active Open-Meteo Point Marker */}
              {activePointPixel && (
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-35"
                  style={{ left: activePointPixel.x, top: activePointPixel.y }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-sky-400 bg-sky-500/20 animate-ping" />
                    <div className="w-5 h-5 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center absolute">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-sky-500/80 backdrop-blur-md rounded-lg px-2 py-0.5 text-[9px] font-bold text-sky-300 whitespace-nowrap shadow-xl">
                    🎯 Open-Meteo Aktif
                  </div>
                </div>
              )}

              {/* GPS User Marker Radar Ring */}
              {userGpsPixel && (
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{ left: userGpsPixel.x, top: userGpsPixel.y }}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center animate-pulse ${weatherColors.ringPulse}`}>
                    <div className={`w-3 h-3 rounded-full shadow-lg ${weatherColors.badgeDot}`} />
                  </div>
                  <div className={`w-16 h-16 rounded-full border absolute -top-4 -left-4 animate-ping opacity-50 ${weatherColors.textAccent}`} />
                </div>
              )}

              {/* Marker Kecamatan & Cuaca */}
              {filteredDistricts.map((d) => {
                const p = project(d.latitude, d.longitude, zoom);
                const screenX = p.x - visibleTiles.x0;
                const screenY = p.y - visibleTiles.y0;

                // Jangan render jika di luar viewport + margin
                if (
                  screenX < -80 ||
                  screenX > dimensions.width + 80 ||
                  screenY < -80 ||
                  screenY > dimensions.height + 80
                ) {
                  return null;
                }

                const isSelected = d.adm4 === adm4;
                const isHighRain = d.probability_of_rain >= 80;
                const isModerateRain = d.probability_of_rain >= 50 && d.probability_of_rain < 80;

                const badgeBg = isHighRain
                  ? 'bg-rose-500 text-white'
                  : isModerateRain
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500/90 text-white';

                const ringColor = isSelected
                  ? 'ring-4 ring-sky-400 border-sky-400 bg-sky-950/95 scale-110 z-40 shadow-xl shadow-sky-500/30'
                  : isHighRain
                  ? 'border-rose-400/80 bg-slate-900/90 hover:scale-105 z-20'
                  : isModerateRain
                  ? 'border-amber-400/80 bg-slate-900/90 hover:scale-105 z-20'
                  : 'border-slate-700/80 bg-slate-900/85 hover:scale-105 z-10';

                return (
                  <div
                    key={d.adm4}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePickLocation({
                        adm4: d.adm4,
                        lat: d.latitude,
                        lon: d.longitude,
                        label: d.district || d.label,
                      });
                      setActivePopupDistrict(d);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 ${ringColor} rounded-xl px-2 py-1 border shadow-lg backdrop-blur-md flex items-center gap-1.5`}
                    style={{ left: screenX, top: screenY }}
                  >
                    <span className="text-sm">
                      {d.probability_of_rain >= 80
                        ? '⛈️'
                        : d.probability_of_rain >= 50
                        ? '🌧️'
                        : d.temperature >= 32
                        ? '☀️'
                        : '⛅'}
                    </span>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-[11px] font-bold text-white tracking-tight truncate max-w-[85px]">
                        {d.district}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] font-mono">
                        <span className="font-semibold text-sky-300">{d.temperature}°</span>
                        <span className={`px-1 rounded ${badgeBg} font-bold text-[8px]`}>
                          💧{d.probability_of_rain}%
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping absolute -top-1 -right-1" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Floating Zoom & Controls (Kanan Bawah) */}
            <div className="absolute bottom-4 right-4 z-40 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                title="Perbesar"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                title="Perkecil"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Top-Left Status: Stasiun Terpilih */}
            <div className="absolute top-3 left-3 z-40 max-w-[280px] sm:max-w-xs p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-2xl text-xs pointer-events-auto">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${weatherColors.badgeDot}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Stasiun Terpilih
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {adm4}
                </span>
              </div>
              <div className="mt-1 font-extrabold text-sm text-white truncate">
                {districtsMap[adm4]?.district || districtsMap[adm4]?.label || 'Genteng, Surabaya'}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                <span className="font-bold text-sky-400">
                  {districtsMap[adm4]?.weather_condition || currentWeather?.weather_condition || 'Berawan'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-white font-bold">
                  {districtsMap[adm4]?.temperature || currentWeather?.temperature || 30}°C
                </span>
                <span className="text-slate-500">•</span>
                <span
                  className={`font-mono font-bold ${
                    (districtsMap[adm4]?.probability_of_rain || currentWeather?.probability_of_rain || 0) >= 80
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  💧 {districtsMap[adm4]?.probability_of_rain || currentWeather?.probability_of_rain || 0}%
                </span>
              </div>
            </div>

            {/* Floating Top-Right Legend */}
            <div className="absolute top-3 right-3 z-40 hidden sm:flex flex-col gap-1 p-2.5 rounded-xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md text-[10px] text-slate-300 shadow-lg">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[9px] mb-0.5">
                Radar {OWM_LAYERS.find((l) => l.id === activeOwmLayer)?.name}:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Rendah (&lt; 50%) • Aman Jemur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Menengah (50-79%) • Siaga</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Tinggi (≥ 80%) • Tutup Kanopi</span>
              </div>
            </div>


          </div>

          {/* Split Mode Side Panel */}
          {viewMode === 'split' && (
            <div className="lg:col-span-4 p-4 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">
                  Daftar Kecamatan ({filteredDistricts.length})
                </span>
                <span className="text-[10px] text-slate-400">Klik untuk memilih</span>
              </div>

              <div className="space-y-1.5">
                {filteredDistricts.map((d) => {
                  const isSelected = d.adm4 === adm4;
                  return (
                    <button
                      key={d.adm4}
                      type="button"
                      onClick={() => {
                        handlePickLocation({
                          adm4: d.adm4,
                          lat: d.latitude,
                          lon: d.longitude,
                          label: d.district || d.label,
                        });
                        setCenter({ lat: d.latitude, lon: d.longitude });
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-600/30 border-sky-500 text-white shadow-soft ring-1 ring-sky-400'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>{d.district}</span>
                          {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{d.adm4}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-xs font-mono text-sky-300">{d.temperature}°C</span>
                        <div className="text-[10px] font-mono text-slate-400">💧 {d.probability_of_rain}%</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        </div>

    </div>
  );
}

export default RegionalWeatherMap;
