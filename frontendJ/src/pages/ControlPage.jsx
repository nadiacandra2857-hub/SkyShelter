import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  Maximize2,
  Minimize2,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Wifi,
  Cpu,
  RotateCw,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingState from '../components/common/LoadingState';
import useDeviceControl from '../hooks/useDeviceControl';
import useDashboard from '../hooks/useDashboard';
import { ROOF_STATUS_MAP } from '../utils/formatters';
import { formatTime } from '../utils/formatDate';

export function ControlPage() {
  const { data: dashboardData, refetch: refetchDashboard } = useDashboard();
  const deviceId = dashboardData?.device_id || 'roof-001';
  const {
    device,
    loading,
    commandStatus,
    commandFeedback,
    responseTime,
    commandHistory,
    sendCommand,
    updateMode,
    isMockMode,
  } = useDeviceControl(deviceId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCommand, setPendingCommand] = useState(null);

  const roofStatus = device?.roof_status || dashboardData?.roof_status || 'closed';
  const mode = device?.mode || dashboardData?.mode || 'auto';
  const isOnline = (device?.connection_status || dashboardData?.connection_status) === 'online';
  const rainDetected = device?.rain_detected ?? dashboardData?.rain_detected ?? false;
  const isOperating = commandStatus === 'pending' || roofStatus === 'opening' || roofStatus === 'closing';

  const statusInfo = ROOF_STATUS_MAP[roofStatus] || ROOF_STATUS_MAP.unknown;

  const handleCommandClick = (cmd) => {
    // Jika membuka atap saat hujan terdeteksi, safety lock memblokir
    if (cmd === 'open' && rainDetected) {
      sendCommand('open').catch(() => {});
      return;
    }

    // Jika membuka atap saat mode auto atau risiko tinggi, tampilkan konfirmasi
    if (cmd === 'open' && mode === 'auto') {
      setPendingCommand('open');
      setConfirmOpen(true);
      return;
    }

    executeCommand(cmd);
  };

  const executeCommand = async (cmd) => {
    try {
      await sendCommand(cmd);
      refetchDashboard();
    } catch {
      // Ditangani oleh toast
    } finally {
      setConfirmOpen(false);
      setPendingCommand(null);
    }
  };

  const handleModeToggle = async (newMode) => {
    if (mode === newMode) return;
    try {
      await updateMode(newMode);
      refetchDashboard();
    } catch {
      // Ditangani oleh toast
    }
  };

  const getStatusBadgeVariant = (st) => {
    switch (st) {
      case 'succeeded':
        return 'success';
      case 'accepted':
      case 'pending':
        return 'warning';
      case 'failed':
      case 'timeout':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  if (loading && !device) {
    return <LoadingState message="Menghubungkan ke kontroler atap..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest">
            <Sliders className="w-3.5 h-3.5" />
            <span>Pusat Kendali Motor Atap</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-charcoal font-sans mt-0.5">
            Kendali & Status Eksekusi Perintah
          </h2>
          <p className="text-xs text-muted-gray mt-0.5">
            Kirimkan instruksi buka/tutup atau alihkan mode kendali atap jemuran
          </p>
        </div>

        {/* Operating Mode Toggle Pills */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-sage/30 shadow-soft">
          <button
            type="button"
            onClick={() => handleModeToggle('auto')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'auto'
                ? 'bg-forest text-white shadow-soft'
                : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            Mode Otomatis
          </button>
          <button
            type="button"
            onClick={() => handleModeToggle('manual')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'manual'
                ? 'bg-forest-deep text-white shadow-soft'
                : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            Mode Manual
          </button>
        </div>
      </div>

      {/* Main Grid: Control Actions & Telemetry Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Big Action Buttons & Visual Canopy State */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-semibold text-muted-gray uppercase tracking-wider">
                  Posisi Kanopi Saat Ini
                </span>
                <h3 className="text-2xl font-extrabold text-charcoal mt-1 flex items-center gap-2">
                  <span>{statusInfo.label}</span>
                  <StatusBadge
                    variant={statusInfo.badgeVariant}
                    size="sm"
                    pulse={isOperating}
                  >
                    {isOperating ? 'Sedang Bergerak' : 'Siap'}
                  </StatusBadge>
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-gray block">Target Device</span>
                <span className="font-mono text-xs font-bold text-forest-deep">{deviceId}</span>
              </div>
            </div>

            {/* Rain Safety Warning Notice if rain detected */}
            {rainDetected && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-2xl bg-soft-red-light border border-soft-red/40 flex items-start gap-3 text-xs text-soft-red"
              >
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">Kunci Keselamatan Hujan Aktif (RAIN_SAFETY_LOCK)</h5>
                  <p className="mt-0.5 text-muted-gray leading-relaxed">
                    Sensor lokal mendeteksi presipitasi air hujan. Demi mencegah jemuran basah kuyup, perintah manual untuk membuka atap diblokir oleh sistem firmware.
                  </p>
                </div>
              </div>
            )}

            {/* Dual Massive Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Button Buka Atap */}
              <button
                type="button"
                onClick={() => handleCommandClick('open')}
                disabled={roofStatus === 'open' || isOperating || rainDetected || !isOnline}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center text-center select-none active:scale-[0.98] ${
                  roofStatus === 'open'
                    ? 'bg-warm-surface border-sage/20 text-muted-gray cursor-not-allowed opacity-60'
                    : rainDetected || !isOnline
                    ? 'bg-gray-100 border-gray-200 text-muted-gray cursor-not-allowed opacity-50'
                    : 'bg-white hover:bg-soft-green-light/40 border-forest/30 text-forest shadow-soft hover:shadow-soft-md'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-forest/10 flex items-center justify-center text-forest mb-3">
                  <Maximize2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-charcoal">Buka Atap</h4>
                <p className="text-xs text-muted-gray mt-1">
                  Gerakkan motor untuk membuka kanopi jemuran 100%
                </p>
              </button>

              {/* Button Tutup Atap */}
              <button
                type="button"
                onClick={() => handleCommandClick('close')}
                disabled={roofStatus === 'closed' || isOperating || !isOnline}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center text-center select-none active:scale-[0.98] ${
                  roofStatus === 'closed'
                    ? 'bg-warm-surface border-sage/20 text-muted-gray cursor-not-allowed opacity-60'
                    : !isOnline
                    ? 'bg-gray-100 border-gray-200 text-muted-gray cursor-not-allowed opacity-50'
                    : 'bg-forest-deep hover:bg-forest text-white shadow-soft hover:shadow-soft-md'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-sage mb-3">
                  <Minimize2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-warm-offwhite">Tutup Atap</h4>
                <p className="text-xs text-sage/80 mt-1">
                  Tutup rapat atap untuk mengamankan jemuran pakaian
                </p>
              </button>
            </div>

            {/* Execution Status Bar */}
            {commandStatus !== 'idle' && (
              <div className="mt-6 p-4 rounded-2xl bg-warm-surface border border-sage/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-charcoal flex items-center gap-1.5">
                    <RotateCw
                      className={`w-3.5 h-3.5 ${
                        commandStatus === 'pending' || isOperating ? 'animate-spin text-forest' : 'text-muted-gray'
                      }`}
                    />
                    <span>Status Perintah:</span>
                  </span>
                  <StatusBadge variant={getStatusBadgeVariant(commandStatus)} size="sm">
                    {commandStatus.toUpperCase()}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-gray leading-relaxed mt-1">
                  {commandFeedback}
                </p>
                {responseTime !== null && (
                  <p className="text-[11px] font-mono text-forest mt-1">
                    Waktu respons kontroler: {responseTime} ms
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Device Telemetry & Specs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6">
            <h4 className="text-sm font-bold text-charcoal mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-forest" />
              <span>Spesifikasi & Status Hardware</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-warm-surface">
                <span className="text-muted-gray">ID Perangkat</span>
                <span className="font-mono font-bold text-charcoal">{deviceId}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-warm-surface">
                <span className="text-muted-gray">Koneksi ESP8266</span>
                <StatusBadge variant={isOnline ? 'success' : 'danger'} size="sm">
                  {isOnline ? 'Terhubung (Online)' : 'Terputus (Offline)'}
                </StatusBadge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-warm-surface">
                <span className="text-muted-gray">Mode Operasi</span>
                <span className="font-semibold text-forest">
                  {mode === 'auto' ? 'Otomatis (Smart AI + Sensor)' : 'Manual (Pengguna)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-warm-surface">
                <span className="text-muted-gray">Motor Stepper Actuator</span>
                <span className="font-semibold text-charcoal">NEMA 17 + A4988 Driver</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-warm-surface">
                <span className="text-muted-gray">Kanal Protokol</span>
                <span className="font-mono text-charcoal">MQTT via FastAPI REST Gateway</span>
              </div>
            </div>

            {/* Disclaimer mode simulasi vs real */}
            <div className="mt-4 p-3 rounded-xl bg-sage/15 border border-sage/30 text-[11px] text-muted-gray leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
              <span>
                {isMockMode
                  ? 'Perhatian: Aplikasi berjalan dalam mode simulasi. Perintah diuji secara virtual tanpa transmisi fisik ke ESP8266.'
                  : 'Perintah dikirimkan melalui HTTP REST API ke FastAPI backend dan diteruskan ke broker MQTT.'}
              </span>
            </div>
          </div>

          {/* Recent Command Execution Log */}
          <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6">
            <h4 className="text-sm font-bold text-charcoal mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-forest" />
              <span>Riwayat Perintah Sesi Ini</span>
            </h4>

            {commandHistory.length === 0 ? (
              <p className="text-xs text-muted-gray py-4 text-center">
                Belum ada perintah yang dikirim dalam sesi ini.
              </p>
            ) : (
              <div className="space-y-2">
                {commandHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-warm-surface border border-sage/15 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-charcoal uppercase">
                        {item.command}
                      </span>
                      <p className="text-[11px] text-muted-gray truncate max-w-[180px]">
                        {item.detail || item.status}
                      </p>
                    </div>

                    <div className="text-right">
                      <StatusBadge variant={getStatusBadgeVariant(item.status)} size="sm">
                        {item.status}
                      </StatusBadge>
                      <span className="text-[10px] text-muted-gray font-mono block mt-0.5">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for opening roof in auto mode */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Buka Atap dalam Mode Otomatis?"
        message="Sistem saat ini sedang berada dalam Mode Otomatis. Jika Anda membuka atap secara manual, pastikan kondisi langit cerah. Sistem akan tetap memantau sensor hujan secara konstan demi keselamatan jemuran."
        confirmLabel="Ya, Buka Kanopi"
        cancelLabel="Batal"
        variant="primary"
        isLoading={isOperating}
        onConfirm={() => executeCommand('open')}
        onClose={() => setConfirmOpen(false)}
      />
    </motion.div>
  );
}

export default ControlPage;
