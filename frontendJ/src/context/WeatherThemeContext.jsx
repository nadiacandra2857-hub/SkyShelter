import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { determineWeatherTheme, WEATHER_THEMES, getWeatherColors } from '../utils/weatherTheme';
import { useWeather } from './WeatherContext';

const WeatherThemeContext = createContext(null);

const STORAGE_KEY = 'sky_shelter_weather_telemetry';

function getInitialTelemetry() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  try {
    const cachedWeather = localStorage.getItem('sky_shelter_weather_cache_current');
    if (cachedWeather) {
      const parsed = JSON.parse(cachedWeather);
      if (parsed?.weather_condition) {
        return {
          rainDetected: false,
          rainAnalogValue: 1023,
          weatherConditionText: parsed.weather_condition,
          probabilityOfRain: parsed.probability_of_rain ?? 0,
          lightLux: 680,
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    rainDetected: false,
    rainAnalogValue: 1023,
    weatherConditionText: '',
    probabilityOfRain: 0,
    lightLux: 680,
  };
}

export function WeatherThemeProvider({ children }) {
  const { current } = useWeather();
  const [telemetry, setTelemetry] = useState(getInitialTelemetry);

  const autoCondition = useMemo(() => {
    return determineWeatherTheme(telemetry);
  }, [telemetry]);

  const activeCondition = autoCondition;
  const currentTheme = WEATHER_THEMES[activeCondition] || WEATHER_THEMES.sunny;
  const colors = useMemo(() => {
    return getWeatherColors(activeCondition, currentTheme.isDark);
  }, [activeCondition, currentTheme.isDark]);

  const updateTelemetry = useCallback((newTelemetry) => {
    if (!newTelemetry) return;
    setTelemetry((prev) => {
      const merged = { ...prev };
      Object.entries(newTelemetry).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          merged[k] = v;
        }
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  }, []);

  // Otomatis sinkronkan telemetri saat cuaca Open-Meteo diperbarui
  useEffect(() => {
    if (current && (current.weather_condition || current.probability_of_rain !== undefined)) {
      updateTelemetry({
        weatherConditionText: current.weather_condition,
        probabilityOfRain: current.probability_of_rain,
      });
    }
  }, [current, updateTelemetry]);

  // Sinkronkan antar-tab via storage event
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setTelemetry(parsed);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = {
    activeCondition,
    autoCondition,
    overrideTheme: 'auto',
    setOverrideTheme: () => {},
    theme: currentTheme,
    colors,
    updateTelemetry,
    telemetry,
    isOverridden: false,
  };

  return (
    <WeatherThemeContext.Provider value={value}>
      {children}
    </WeatherThemeContext.Provider>
  );
}

export function useWeatherTheme() {
  const context = useContext(WeatherThemeContext);
  if (!context) {
    throw new Error('useWeatherTheme must be used within a WeatherThemeProvider');
  }
  return context;
}

export default WeatherThemeContext;
