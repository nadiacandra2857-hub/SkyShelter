/**
 * Mock Data untuk Layanan Cuaca (Weather Service)
 * Mengikuti skema WeatherResponse, WeatherForecastDetailResponse, dan WeatherStatusResponse
 */

const now = new Date();

export const mockCurrentWeather = {
  provider: 'bmkg',
  location: 'DKI Jakarta (Stasiun Meteorologi Kemayoran)',
  probability_of_rain: 86.0,
  weather_condition: 'Hujan Sedang',
  temperature: 28.2,
  humidity: 78.0,
  forecast_horizon_minutes: 60,
  forecast_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
  fetched_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
  is_stale: false,
  is_cached: true,
  status: 'success', // 'success' | 'fallback' | 'stale' | 'unavailable'
};

export const mockHourlyForecasts = [
  {
    time: new Date(now.getTime()).toISOString(),
    weather_condition: 'Berawan Tebal',
    probability_of_rain: 35.0,
    temperature: 29.5,
    humidity: 68.0,
  },
  {
    time: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
    weather_condition: 'Berawan Gelap',
    probability_of_rain: 52.0,
    temperature: 29.0,
    humidity: 72.0,
  },
  {
    time: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
    weather_condition: 'Mendung Tebal',
    probability_of_rain: 70.0,
    temperature: 28.5,
    humidity: 75.0,
  },
  {
    time: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
    weather_condition: 'Hujan Ringan',
    probability_of_rain: 82.0,
    temperature: 28.1,
    humidity: 77.0,
  },
  {
    time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    weather_condition: 'Hujan Sedang',
    probability_of_rain: 86.0,
    temperature: 27.8,
    humidity: 80.0,
  },
  {
    time: new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
    weather_condition: 'Hujan Sedang',
    probability_of_rain: 84.0,
    temperature: 27.5,
    humidity: 82.0,
  },
  {
    time: new Date(now.getTime() + 120 * 60 * 1000).toISOString(),
    weather_condition: 'Hujan Ringan',
    probability_of_rain: 65.0,
    temperature: 28.0,
    humidity: 79.0,
  },
  {
    time: new Date(now.getTime() + 180 * 60 * 1000).toISOString(),
    weather_condition: 'Berawan',
    probability_of_rain: 30.0,
    temperature: 28.6,
    humidity: 74.0,
  },
  {
    time: new Date(now.getTime() + 240 * 60 * 1000).toISOString(),
    weather_condition: 'Cerah Berawan',
    probability_of_rain: 15.0,
    temperature: 29.2,
    humidity: 70.0,
  },
];

export const mockForecastDetail = {
  ...mockCurrentWeather,
  hourly_forecasts: mockHourlyForecasts,
};

export const mockWeatherStatus = {
  provider: 'bmkg',
  configured_provider: 'bmkg',
  is_available: true,
  last_successful_fetch: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
  cache_expires_at: new Date(now.getTime() + 11 * 60 * 1000).toISOString(),
  is_stale: false,
  refresh_cooldown_remaining_seconds: 0,
  poll_interval_minutes: 15,
  location: 'DKI Jakarta',
};
