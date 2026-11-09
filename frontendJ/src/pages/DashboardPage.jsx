import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sliders,
  RefreshCw,
  ShieldAlert,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Sparkles,
} from 'lucide-react';
import RoofStatusPanel from '../components/dashboard/RoofStatusPanel';
import LocalSensorPanel from '../components/dashboard/LocalSensorPanel';
import WeatherSummary from '../components/dashboard/WeatherSummary';
import DecisionPanel from '../components/dashboard/DecisionPanel';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import useDashboard from '../hooks/useDashboard';
import useWeather from '../hooks/useWeather';
import useDeviceControl from '../hooks/useDeviceControl';
import { useAuth } from '../context/AuthContext';
import { useWeatherTheme } from '../context/WeatherThemeContext';

export function DashboardPage() {
  const { data, loading, error, refetch, isMockMode } = useDashboard();
  const { current: liveWeather, locationLabel, refresh: refreshWeather, refreshing: isWeatherRefreshing } = useWeather();
  const activeWeather = liveWeather || data?.weather_summary;
  const { sendCommand, commandStatus } = useDeviceControl(data?.device_id || 'roof-001');
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    theme,
    activeCondition,
    autoCondition,
    overrideTheme,
    setOverrideTheme,
    updateTelemetry,
  } = useWeatherTheme();

  // Sinkronkan data sensor & cuaca aktual ke engine tema otomatis (1 aplikasi 1 tema cuaca selaras)
  useEffect(() => {
    if (data || activeWeather) {
      const condText = activeWeather?.weather_condition || data?.weather_summary?.weather_condition;
      const probRain = activeWeather?.probability_of_rain ?? data?.weather_summary?.probability_of_rain;
      updateTelemetry({
        rainDetected: Boolean(data?.rain_detected),
        rainAnalogValue: data?.rain_analog_value ?? 1023,
        ...(condText ? { weatherConditionText: condText } : {}),
        ...(probRain !== undefined ? { probabilityOfRain: probRain } : {}),
        lightLux: data?.light_lux ?? 680,
      });
    }
  }, [data, activeWeather, updateTelemetry]);

  if (loading && !data) {
    return (
      <div className="py-12">
        <LoadingState
          message="Memuat status atap & telemetri..."
          subtext="Menghubungkan ke gateway sensor & satelit cuaca..."
        />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-12">
        <ErrorState
          title="Gagal Memuat Dashboard"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  const isOperating =
    commandStatus === 'pending' ||
    data?.roof_status === 'opening' ||
    data?.roof_status === 'closing';

  const isSunny = activeCondition === 'sunny';
  const isCloudy = activeCondition === 'cloudy';

  const handleOpen = async () => {
    try {
      await sendCommand('open');
      refetch();
    } catch {
      // Error handled by hook toast
    }
  };

  const handleClose = async () => {
    try {
      await sendCommand('close');
      refetch();
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-28 md:pb-32"
    >
      {/* Top Greeting & System Quick Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <span
              className={
                theme.isDark
                  ? 'text-sky-400'
                  : isSunny
                  ? 'text-amber-600 font-bold'
                  : isCloudy
                  ? 'text-slate-700 font-bold'
                  : 'text-sky-600 font-bold'
              }
            >
              Halo, {user?.username || 'Admin'}
            </span>
            <span className={theme.isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span
              className={
                theme.isDark
                  ? 'text-slate-400'
                  : isSunny
                  ? 'text-amber-700/80'
                  : isCloudy
                  ? 'text-slate-500'
                  : 'text-slate-500'
              }
            >
              SkyShelter Guardian
            </span>
          </div>
          <h2 className={`text-xl md:text-2xl font-extrabold font-sans mt-0.5 ${theme.text.title}`}>
            Monitoring & Kendali Atap Jemuran
          </h2>
          <p className={`text-xs mt-0.5 ${theme.text.subtitle}`}>
            Sistem otomatis melindungi jemuran berdasarkan deteksi sensor hujan dan prediksi presipitasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            leftIcon={RefreshCw}
            className={`shadow-sm ${
              theme.isDark
                ? 'bg-slate-900 border-slate-700 text-sky-400 hover:bg-slate-800'
                : isSunny
                ? 'border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 bg-white'
                : isCloudy
                ? 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 bg-white'
                : 'border-sky-200 text-sky-700 hover:text-sky-800 hover:border-sky-300 hover:bg-sky-50 bg-white'
            }`}
          >
            Segarkan
          </Button>

          <Button
            variant={isSunny ? 'amber' : isCloudy ? 'slate' : 'sky'}
            size="sm"
            onClick={() => navigate('/control')}
            leftIcon={Sliders}
            className={
              isSunny
                ? 'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-soft shadow-amber-500/20 ring-1 ring-amber-400/30'
                : isCloudy
                ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm ring-1 ring-slate-600/30'
                : 'bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-soft shadow-sky-100 ring-1 ring-sky-400/30'
            }
          >
            Panel Kendali
          </Button>
        </div>
      </div>

      {/* Device Offline Alert Banner if offline */}
      {data?.connection_status === 'offline' && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-soft-red-light border border-soft-red/40 flex items-start gap-3 text-xs text-soft-red"
        >
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold">Perangkat Kontroler ESP8266 Sedang Offline</h5>
            <p className="mt-0.5 text-muted-gray leading-relaxed">
              Koneksi telemetri terputus. Status fisik kanopi terakhir tercatat mungkin tidak mencerminkan kondisi lapangan saat ini.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Asymmetrical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Major Column (7 cols): Visual Centerpiece Roof Status */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 1. Primary Roof Status Panel */}
          <RoofStatusPanel
            roofStatus={data?.roof_status || 'unknown'}
            mode={data?.mode || 'auto'}
            lastUpdated={data?.last_updated}
            onOpenRoof={handleOpen}
            onCloseRoof={handleClose}
            isOperating={isOperating}
            rainDetected={data?.rain_detected}
          />

          {/* 2. System Decision Engine Panel */}
          <DecisionPanel
            decision={data?.decision || 'normal'}
            decisionReason={data?.decision_reason}
            earlyCloseRecommended={data?.early_close_recommended}
          />
        </div>

        {/* Right Column (5 cols): Local Sensor & Weather Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 3. Local Rain Sensor Physical Panel */}
          <LocalSensorPanel
            rainSensor={data?.rain_sensor || 'dry'}
            rainDetected={data?.rain_detected}
            rainAnalogValue={data?.rain_analog_value ?? (data?.rain_detected ? 320 : 1023)}
            lightLux={data?.light_lux ?? 680}
            temperature={data?.temperature ?? 29.5}
            humidity={data?.humidity ?? 65}
            lastUpdated={data?.last_updated}
          />

          {/* 4. Regional Satellite Weather Summary */}
          <WeatherSummary
            weather={activeWeather ? { ...activeWeather, location: locationLabel || activeWeather.location } : data?.weather_summary}
            onRefresh={() => {
              refetch();
              refreshWeather();
            }}
            isRefreshing={isWeatherRefreshing}
            isMockMode={isMockMode}
          />
        </div>
      </div>

      {/* Bottom Section: Recent Activity Timeline */}
      <RecentActivity
        activities={data?.recent_activities || []}
        onViewAll={() => navigate('/history')}
      />
    </motion.div>
  );
}

export default DashboardPage;
