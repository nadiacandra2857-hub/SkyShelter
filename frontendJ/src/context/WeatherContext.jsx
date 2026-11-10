import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import weatherService, { DEFAULT_ADM4, FALLBACK_REGIONS } from '../services/weatherService';
import { useApp } from './AppContext';

const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const [adm4, setAdm4State] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_shelter_bmkg_adm4');
      if (saved && (saved.startsWith('35.78.') || saved.startsWith('35.24.') || saved.startsWith('35.'))) {
        return saved;
      }
      return DEFAULT_ADM4;
    } catch {
      return DEFAULT_ADM4;
    }
  });

  const [selectedCoords, setSelectedCoords] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_shelter_selected_coords');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [locationLabel, setLocationLabel] = useState(() => {
    try {
      return localStorage.getItem('sky_shelter_location_label') || '';
    } catch {
      return '';
    }
  });

  const [current, setCurrent] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_shelter_weather_cache_current');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [forecast, setForecast] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_shelter_weather_cache_forecast');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState(null);
  const [regions, setRegions] = useState(FALLBACK_REGIONS);
  const [loading, setLoading] = useState(!current);
  const [refreshing, setRefreshing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [userCoords, setUserCoords] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_shelter_user_coords');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isGpsActive, setIsGpsActive] = useState(() => {
    try {
      return localStorage.getItem('sky_shelter_is_gps_active') === 'true';
    } catch {
      return false;
    }
  });

  const [error, setError] = useState(null);
  const { showToast, isMockMode } = useApp();
  const isInitialMountRef = useRef(true);

  const fetchWeatherData = useCallback(
    async (
      isSilent = false,
      targetAdm4 = adm4,
      targetLat = selectedCoords?.lat,
      targetLon = selectedCoords?.lon
    ) => {
      if (!isSilent) setLoading(true);
      setError(null);
      try {
        const [currentRes, forecastRes, statusRes] = await Promise.all([
          weatherService.getCurrentWeather(targetAdm4, targetLat, targetLon),
          weatherService.getForecast(targetAdm4, targetLat, targetLon),
          weatherService.getWeatherStatus(targetAdm4),
        ]);
        setCurrent(currentRes);
        setForecast(forecastRes);
        setStatus(statusRes);

        try {
          if (currentRes) {
            localStorage.setItem('sky_shelter_weather_cache_current', JSON.stringify(currentRes));
          }
          if (forecastRes) {
            localStorage.setItem('sky_shelter_weather_cache_forecast', JSON.stringify(forecastRes));
          }
        } catch {
          // ignore
        }
      } catch (err) {
        setError(err?.message || 'Gagal memuat data prakiraan cuaca Open-Meteo.');
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [adm4, selectedCoords]
  );

  /**
   * Pemilihan Lokasi Interaktif (Mendukung ADM4, Nama, maupun Koordinat Lat/Lon Open-Meteo)
   */
  const selectLocation = useCallback(
    async ({ adm4: newAdm4, lat, lon, label, fromGps = false }) => {
      const cleanAdm4 = (newAdm4 || '').trim();
      const coords = lat !== null && lat !== undefined && lon !== null && lon !== undefined ? { lat, lon } : null;

      try {
        if (cleanAdm4) localStorage.setItem('sky_shelter_bmkg_adm4', cleanAdm4);
        localStorage.setItem('sky_shelter_is_gps_active', fromGps ? 'true' : 'false');
        if (coords) {
          localStorage.setItem('sky_shelter_selected_coords', JSON.stringify(coords));
        } else {
          localStorage.removeItem('sky_shelter_selected_coords');
        }
        if (label) {
          localStorage.setItem('sky_shelter_location_label', label);
        }
      } catch {
        // Ignore storage errors
      }

      setIsGpsActive(fromGps);
      if (cleanAdm4) setAdm4State(cleanAdm4);
      setSelectedCoords(coords);
      if (label) setLocationLabel(label);

      await fetchWeatherData(false, cleanAdm4 || adm4, coords?.lat, coords?.lon);
      if (label && showToast) {
        showToast(`Lokasi aktif: ${label} (Open-Meteo)`, 'success');
      }
      try {
        window.dispatchEvent(new CustomEvent('weather:location_changed', { detail: { adm4: cleanAdm4, coords, label } }));
      } catch {}
    },
    [adm4, fetchWeatherData, showToast]
  );

  // Kompatibilitas setAdm4 lama
  const setAdm4 = useCallback(
    (newAdm4, fromGps = false) => {
      const clean = (newAdm4 || '').trim();
      if (!clean) return;
      const regMatch = regions.find((r) => r.adm4 === clean);
      if (regMatch) {
        selectLocation({
          adm4: clean,
          lat: regMatch.latitude,
          lon: regMatch.longitude,
          label: regMatch.district || regMatch.label,
          fromGps,
        });
      } else {
        selectLocation({ adm4: clean, fromGps });
      }
    },
    [regions, selectLocation]
  );

  /**
   * Mendeteksi titik lokasi GPS pengguna secara akurat melalui Geolocation API
   */
  const detectLocation = useCallback(
    async (isSilent = false) => {
      if (!navigator.geolocation) {
        if (!isSilent && showToast) {
          showToast('Browser Anda tidak mendukung deteksi lokasi GPS.', 'warning');
        }
        return null;
      }

      setIsLocating(true);

      const getGeoPosition = (highAccuracy = true) =>
        new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: highAccuracy,
            timeout: highAccuracy ? 12000 : 8000,
            maximumAge: 0,
          });
        });

      try {
        let position = null;
        try {
          position = await getGeoPosition(true);
        } catch (firstErr) {
          if (firstErr.code === 3 || firstErr.code === 2) {
            position = await getGeoPosition(false);
          } else {
            throw firstErr;
          }
        }

        const { latitude, longitude } = position.coords;
        const nearestRes = await weatherService.getNearestRegion(latitude, longitude);

        if (nearestRes && nearestRes.nearest_region) {
          const region = nearestRes.nearest_region;
          const coordsData = {
            latitude,
            longitude,
            distanceKm: nearestRes.distance_km,
            stationName: region.label,
            adm4: region.adm4,
            detectedAt: new Date().toISOString(),
          };

          setUserCoords(coordsData);
          try {
            localStorage.setItem('sky_shelter_user_coords', JSON.stringify(coordsData));
          } catch {}

          await selectLocation({
            adm4: region.adm4,
            lat: latitude,
            lon: longitude,
            label: region.label,
            fromGps: true,
          });

          return coordsData;
        }
        return null;
      } catch (geoError) {
        let msg = 'Gagal mengakses sensor GPS lokasi.';
        if (geoError.code === 1) {
          msg = 'Izin akses GPS belum diaktifkan di browser. Silakan izinkan akses lokasi.';
        } else if (geoError.code === 2) {
          msg = 'Posisi GPS perangkat tidak dapat ditentukan.';
        } else if (geoError.code === 3) {
          msg = 'Waktu permintaan sensor GPS habis (timeout).';
        }

        if (!isSilent && showToast) {
          showToast(msg, 'warning');
        }
        return null;
      } finally {
        setIsLocating(false);
      }
    },
    [selectLocation, showToast]
  );

  // Muat regions saat mount
  useEffect(() => {
    let isMounted = true;
    weatherService
      .getPopularRegions()
      .then((list) => {
        if (isMounted && Array.isArray(list) && list.length > 0) {
          setRegions(list);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Muat data cuaca awal & auto-detect GPS HANYA SEKALI jika belum ada lokasi tersimpan
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      fetchWeatherData(false, adm4, selectedCoords?.lat, selectedCoords?.lon);

      const hasSavedLocation = (() => {
        try {
          return Boolean(localStorage.getItem('sky_shelter_bmkg_adm4'));
        } catch {
          return false;
        }
      })();

      const hasAutoLocated = (() => {
        try {
          return Boolean(sessionStorage.getItem('sky_shelter_auto_located'));
        } catch {
          return false;
        }
      })();

      if (!hasSavedLocation && !hasAutoLocated && navigator.geolocation) {
        try {
          sessionStorage.setItem('sky_shelter_auto_located', 'true');
        } catch {}
        detectLocation(true);
      }
    }
  }, [adm4, fetchWeatherData, selectedCoords?.lat, selectedCoords?.lon, detectLocation]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await weatherService.refreshWeather(adm4, selectedCoords?.lat, selectedCoords?.lon);
      if (showToast) {
        showToast(res.message || 'Data cuaca Open-Meteo berhasil diperbarui.', 'success');
      }
      await fetchWeatherData(true, adm4, selectedCoords?.lat, selectedCoords?.lon);
      return res;
    } catch (err) {
      if (showToast) {
        showToast(err?.message || 'Gagal merefresh cuaca Open-Meteo.', 'error');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const value = {
    adm4,
    setAdm4,
    selectLocation,
    selectedCoords,
    locationLabel: locationLabel || current?.location || '',
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
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}

export { WeatherContext };
export default useWeather;

