/**
 * Mock Data untuk Layanan Cuaca (Weather Service)
 * Mengikuti skema WeatherResponse, WeatherForecastDetailResponse, dan WeatherStatusResponse
 */

const now = new Date();

export const mockCurrentWeather = {
  provider: 'open-meteo',
  location: 'Genteng, Kota Surabaya (Open-Meteo)',
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

const baseHour = new Date(now);
baseHour.setHours(8, 0, 0, 0); // Mulai pukul 08.00 WIB

export const mockHourlyForecasts = [
  {
    time: new Date(baseHour.getTime()).toISOString(), // 08.00
    weather_condition: 'Hujan',
    probability_of_rain: 85.0,
    temperature: 27.0,
    humidity: 78.0,
  },
  {
    time: new Date(baseHour.getTime() + 1 * 3600 * 1000).toISOString(), // 09.00
    weather_condition: 'Hujan',
    probability_of_rain: 85.0,
    temperature: 26.0,
    humidity: 80.0,
  },
  {
    time: new Date(baseHour.getTime() + 2 * 3600 * 1000).toISOString(), // 10.00
    weather_condition: 'Hujan',
    probability_of_rain: 80.0,
    temperature: 26.0,
    humidity: 82.0,
  },
  {
    time: new Date(baseHour.getTime() + 3 * 3600 * 1000).toISOString(), // 11.00
    weather_condition: 'Hujan Ringan',
    probability_of_rain: 75.0,
    temperature: 27.0,
    humidity: 80.0,
  },
  {
    time: new Date(baseHour.getTime() + 4 * 3600 * 1000).toISOString(), // 12.00
    weather_condition: 'Hujan Ringan',
    probability_of_rain: 65.0,
    temperature: 26.0,
    humidity: 76.0,
  },
  {
    time: new Date(baseHour.getTime() + 5 * 3600 * 1000).toISOString(), // 13.00
    weather_condition: 'Berawan Tebal',
    probability_of_rain: 45.0,
    temperature: 26.0,
    humidity: 72.0,
  },
  {
    time: new Date(baseHour.getTime() + 6 * 3600 * 1000).toISOString(), // 14.00
    weather_condition: 'Berawan',
    probability_of_rain: 35.0,
    temperature: 27.0,
    humidity: 70.0,
  },
  {
    time: new Date(baseHour.getTime() + 7 * 3600 * 1000).toISOString(), // 15.00
    weather_condition: 'Cerah Berawan',
    probability_of_rain: 20.0,
    temperature: 28.0,
    humidity: 68.0,
  },
  {
    time: new Date(baseHour.getTime() + 8 * 3600 * 1000).toISOString(), // 16.00
    weather_condition: 'Cerah Berawan',
    probability_of_rain: 15.0,
    temperature: 28.0,
    humidity: 67.0,
  },
  {
    time: new Date(baseHour.getTime() + 9 * 3600 * 1000).toISOString(), // 17.00
    weather_condition: 'Cerah',
    probability_of_rain: 10.0,
    temperature: 27.0,
    humidity: 65.0,
  },
  {
    time: new Date(baseHour.getTime() + 10 * 3600 * 1000).toISOString(), // 18.00
    weather_condition: 'Hujan Ringan',
    probability_of_rain: 60.0,
    temperature: 26.0,
    humidity: 74.0,
  },
  {
    time: new Date(baseHour.getTime() + 11 * 3600 * 1000).toISOString(), // 19.00
    weather_condition: 'Hujan',
    probability_of_rain: 85.0,
    temperature: 27.0,
    humidity: 78.0,
  },
  {
    time: new Date(baseHour.getTime() + 12 * 3600 * 1000).toISOString(), // 20.00
    weather_condition: 'Hujan',
    probability_of_rain: 85.0,
    temperature: 26.0,
    humidity: 80.0,
  },
  {
    time: new Date(baseHour.getTime() + 13 * 3600 * 1000).toISOString(), // 21.00
    weather_condition: 'Hujan',
    probability_of_rain: 80.0,
    temperature: 26.0,
    humidity: 80.0,
  },
  {
    time: new Date(baseHour.getTime() + 14 * 3600 * 1000).toISOString(), // 22.00
    weather_condition: 'Hujan',
    probability_of_rain: 75.0,
    temperature: 27.0,
    humidity: 82.0,
  },
  {
    time: new Date(baseHour.getTime() + 15 * 3600 * 1000).toISOString(), // 23.00
    weather_condition: 'Hujan',
    probability_of_rain: 75.0,
    temperature: 26.0,
    humidity: 80.0,
  },
  {
    time: new Date(baseHour.getTime() + 16 * 3600 * 1000).toISOString(), // 00.00
    weather_condition: 'Hujan',
    probability_of_rain: 70.0,
    temperature: 26.0,
    humidity: 80.0,
  },
];

export const mockForecastDetail = {
  ...mockCurrentWeather,
  hourly_forecasts: mockHourlyForecasts,
};

export const mockWeatherStatus = {
  provider: 'open-meteo',
  configured_provider: 'open-meteo',
  is_available: true,
  last_successful_fetch: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
  cache_expires_at: new Date(now.getTime() + 11 * 60 * 1000).toISOString(),
  is_stale: false,
  refresh_cooldown_remaining_seconds: 0,
  poll_interval_minutes: 15,
  location: 'DKI Jakarta',
};
