import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sliders, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import RoofStatusPanel from '../components/dashboard/RoofStatusPanel';
import LocalSensorPanel from '../components/dashboard/LocalSensorPanel';
import WeatherSummary from '../components/dashboard/WeatherSummary';
import DecisionPanel from '../components/dashboard/DecisionPanel';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import Button from '../components/common/Button';
import useDashboard from '../hooks/useDashboard';
import useDeviceControl from '../hooks/useDeviceControl';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { data, loading, error, refetch, isMockMode } = useDashboard();
  const { sendCommand, commandStatus } = useDeviceControl(data?.device_id || 'roof-001');
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading && !data) {
    return (
      <div className="py-12">
        <LoadingState
          message="Memuat status atap & telemetri..."
          subtext="Menghubungkan ke gateway sensor & satelit BMKG..."
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

  const isOperating = commandStatus === 'pending' || data?.roof_status === 'opening' || data?.roof_status === 'closing';

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
      className="space-y-6"
    >
      {/* Top Greeting & System Quick Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest">
            <span>Halo, {user?.username || 'Admin'}</span>
            <span>•</span>
            <span className="text-muted-gray">SkyShelter Guardian</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-charcoal font-sans mt-0.5">
            Monitoring & Kendali Atap Jemuran
          </h2>
          <p className="text-xs text-muted-gray mt-0.5">
            Sistem otomatis melindungi jemuran berdasarkan deteksi sensor hujan dan prediksi presipitasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            leftIcon={RefreshCw}
            className="bg-white"
          >
            Segarkan
          </Button>

          <Button
            variant="forest"
            size="sm"
            onClick={() => navigate('/control')}
            leftIcon={Sliders}
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
            weather={data?.weather_summary}
            onRefresh={refetch}
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
