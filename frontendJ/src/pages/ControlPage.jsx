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
import { useWeatherTheme } from '../context/WeatherThemeContext';
import { ROOF_STATUS_MAP } from '../utils/formatters';
import { formatTime } from '../utils/formatDate';

export function ControlPage() {
  const { theme, activeCondition } = useWeatherTheme();
  const isDark = theme?.isDark;
  const isSunny = activeCondition === 'sunny' && !isDark;
  const isCloudy = activeCondition === 'cloudy' && !isDark;

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
        return isSunny ? 'amber' : isCloudy ? 'slate' : 'success';
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <Sliders
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
              Pusat Kendali Motor Atap
            </span>
          </div>
          <h2 className={`text-xl md:text-2xl font-extrabold font-sans mt-0.5 ${isDark ? 'text-white' : 'text-charcoal'}`}>
            Kendali & Status Eksekusi Perintah
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
            Kirimkan instruksi buka/tutup atau alihkan mode kendali atap jemuran
          </p>
        </div>

        {/* Operating Mode Toggle Pills */}
        <div
          className={`flex items-center p-1 rounded-2xl border shadow-sm transition-colors ${
            isDark
              ? 'bg-slate-900/80 border-slate-700/60 backdrop-blur-md'
              : isSunny
              ? 'bg-amber-50/80 border-amber-200/80'
              : isCloudy
              ? 'bg-slate-200/60 border-slate-300'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => handleModeToggle('auto')}
            className={`px-4 py-2 rounded-xl text-xs transition-all ${
              mode === 'auto'
                ? isSunny
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : isCloudy
                  ? 'bg-slate-700 text-white shadow-sm font-semibold'
                  : 'bg-sky-500 text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 font-medium'
                : isSunny
                ? 'text-amber-800/70 hover:text-amber-900 font-medium'
                : isCloudy
                ? 'text-slate-600 hover:text-slate-900 font-medium'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            Mode Otomatis
          </button>
          <button
            type="button"
            onClick={() => handleModeToggle('manual')}
            className={`px-4 py-2 rounded-xl text-xs transition-all ${
              mode === 'manual'
                ? isSunny
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : isCloudy
                  ? 'bg-slate-700 text-white shadow-sm font-semibold'
                  : 'bg-sky-500 text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 font-medium'
                : isSunny
                ? 'text-amber-800/70 hover:text-amber-900 font-medium'
                : isCloudy
                ? 'text-slate-600 hover:text-slate-900 font-medium'
                : 'text-slate-500 hover:text-slate-800 font-medium'
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
          <div
            className={`rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
              isDark
                ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
                : isSunny
                ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
                : isCloudy
                ? 'bg-white border border-slate-200/80 shadow-sm'
                : 'bg-white border border-sky-100/80 shadow-soft-md'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                  Posisi Kanopi Saat Ini
                </span>
                <h3 className={`text-2xl font-extrabold mt-1 flex items-center gap-2 ${isDark ? 'text-white' : 'text-charcoal'}`}>
                  <span>{statusInfo.label}</span>

                </h3>
              </div>

              <div className="text-right">
                <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Target Device</span>
                <span className={`font-mono text-xs font-bold ${isDark ? 'text-sky-300' : isSunny ? 'text-amber-800' : 'text-slate-800'}`}>{deviceId}</span>
              </div>
            </div>

            {/* Rain Safety Warning Notice if rain detected */}
            {rainDetected && (
              <div
                role="alert"
                className={`mb-6 p-4 rounded-2xl flex items-start gap-3 text-xs ${
                  isDark
                    ? 'bg-red-950/70 border border-red-500/50 text-red-200'
                    : 'bg-soft-red-light border border-soft-red/40 text-soft-red'
                }`}
              >
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                <div>
                  <h5 className="font-bold">Kunci Keselamatan Hujan Aktif (RAIN_SAFETY_LOCK)</h5>
                  <p className={`mt-0.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-muted-gray'}`}>
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
                disabled={roofStatus === 'open' || isOperating || rainDetected}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center text-center select-none active:scale-[0.98] ${
                  roofStatus === 'open'
                    ? isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : rainDetected
                    ? isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                      : 'bg-gray-100 border-gray-200 text-muted-gray cursor-not-allowed opacity-50'
                    : isDark
                    ? 'bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-lg shadow-sky-500/20 border-transparent ring-1 ring-sky-400/40'
                    : isSunny
                    ? 'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md shadow-amber-500/20 border-transparent ring-1 ring-amber-400/30'
                    : isCloudy
                    ? 'bg-slate-700 hover:bg-slate-800 text-white font-semibold shadow-md shadow-slate-400/20 border-transparent ring-1 ring-slate-600/30'
                    : 'bg-white hover:bg-sky-50/50 border-sky-200 text-sky-700 shadow-soft hover:shadow-soft-md'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                    (isDark || isSunny || isCloudy) && (roofStatus !== 'open' && !rainDetected)
                      ? 'bg-white/20 text-white'
                      : isSunny
                      ? 'bg-amber-50 text-amber-600'
                      : isCloudy
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-sky-50 text-sky-600'
                  }`}
                >
                  <Maximize2 className="w-7 h-7" />
                </div>
                <h4
                  className={`text-base font-bold ${
                    (isDark || isSunny || isCloudy) && (roofStatus !== 'open' && !rainDetected)
                      ? 'text-white'
                      : isDark
                      ? 'text-slate-300'
                      : 'text-charcoal'
                  }`}
                >
                  Buka Atap
                </h4>
                <p
                  className={`text-xs mt-1 ${
                    (isDark || isSunny || isCloudy) && (roofStatus !== 'open' && !rainDetected)
                      ? isSunny ? 'text-amber-50/90' : isCloudy ? 'text-slate-200' : 'text-sky-100'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-muted-gray'
                  }`}
                >
                  Gerakkan motor untuk membuka kanopi jemuran 100%
                </p>
              </button>

              {/* Button Tutup Atap */}
              <button
                type="button"
                onClick={() => handleCommandClick('close')}
                disabled={roofStatus === 'closed' || isOperating}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center text-center select-none active:scale-[0.98] ${
                  roofStatus === 'closed'
                    ? isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : false ? isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                      : 'bg-gray-100 border-gray-200 text-muted-gray cursor-not-allowed opacity-50'
                    : isDark
                    ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-white shadow-lg shadow-black/40 hover:border-sky-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 border-transparent text-white shadow-soft hover:shadow-soft-md'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-3 ${
                  isCloudy ? 'text-slate-300' : isSunny ? 'text-amber-200' : 'text-sky-300'
                }`}>
                  <Minimize2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">Tutup Atap</h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-300'}`}>
                  Tutup rapat atap untuk mengamankan jemuran pakaian
                </p>
              </button>
            </div>

            {/* Execution Status Bar */}
            {commandStatus !== 'idle' && (
              <div
                className={`mt-6 p-4 rounded-2xl border ${
                  isDark
                    ? 'bg-slate-800/70 border-slate-700/60 text-slate-300'
                    : 'bg-slate-50 border-sky-100/80 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-charcoal'}`}>
                    <RotateCw
                      className={`w-3.5 h-3.5 ${
                        commandStatus === 'pending' || isOperating
                          ? isSunny
                            ? 'animate-spin text-amber-500'
                            : isCloudy
                            ? 'animate-spin text-slate-600'
                            : 'animate-spin text-sky-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>Status Perintah:</span>
                  </span>
                  <StatusBadge variant={getStatusBadgeVariant(commandStatus)} size="sm">
                    {commandStatus.toUpperCase()}
                  </StatusBadge>
                </div>
                <p className={`text-xs leading-relaxed mt-1 ${isDark ? 'text-slate-300' : 'text-muted-gray'}`}>
                  {commandFeedback}
                </p>
                {responseTime !== null && (
                  <p className={`text-[11px] font-mono mt-1 ${
                    isSunny ? 'text-amber-600' : isCloudy ? 'text-slate-600' : 'text-sky-400'
                  }`}>
                    Waktu respons kontroler: {responseTime} ms
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Device Telemetry & Specs */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`rounded-3xl p-6 transition-all duration-300 ${
              isDark
                ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
                : isSunny
                ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
                : isCloudy
                ? 'bg-white border border-slate-200/80 shadow-sm'
                : 'bg-white border border-sky-100/80 shadow-soft-md'
            }`}
          >
            <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-charcoal'}`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isDark
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : isSunny
                    ? 'bg-amber-50 text-amber-500 border border-amber-200/80'
                    : isCloudy
                    ? 'bg-slate-100 text-slate-700 border border-slate-300'
                    : 'bg-sky-50 text-sky-500'
                }`}
              >
                <Cpu className="w-4 h-4" />
              </div>
              <span>Spesifikasi & Status Hardware</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div
                className={`flex items-center justify-between p-2.5 rounded-xl ${
                  isDark ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-50'
                }`}
              >
                <span className={isDark ? 'text-slate-400' : 'text-muted-gray'}>ID Perangkat</span>
                <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>{deviceId}</span>
              </div>

              <div
                className={`flex items-center justify-between p-2.5 rounded-xl ${
                  isDark ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-50'
                }`}
              >
                <span className={isDark ? 'text-slate-400' : 'text-muted-gray'}>Status Hardware ESP</span>
                {isOnline ? (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-emerald-500/10 text-emerald-500 border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online (ESP8266 Terhubung)</span>
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-slate-800 text-slate-300 border-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Nonaktif (Belum Ada Hardware)</span>
                  </span>
                )}
              </div>

              <div
                className={`flex items-center justify-between p-2.5 rounded-xl ${
                  isDark ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-50'
                }`}
              >
                <span className={isDark ? 'text-slate-400' : 'text-muted-gray'}>Mode Operasi</span>
                <span
                  className={`font-semibold ${
                    isDark
                      ? 'text-sky-400'
                      : isSunny
                      ? 'text-amber-600'
                      : isCloudy
                      ? 'text-slate-700 font-semibold'
                      : 'text-sky-400'
                  }`}
                >
                  {mode === 'auto' ? 'Otomatis (Smart AI + Sensor)' : 'Manual (Pengguna)'}
                </span>
              </div>

              <div
                className={`flex items-center justify-between p-2.5 rounded-xl ${
                  isDark ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-50'
                }`}
              >
                <span className={isDark ? 'text-slate-400' : 'text-muted-gray'}>Motor Stepper Actuator</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-charcoal'}`}>NEMA 17 + A4988 Driver</span>
              </div>

              <div
                className={`flex items-center justify-between p-2.5 rounded-xl ${
                  isDark ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-50'
                }`}
              >
                <span className={isDark ? 'text-slate-400' : 'text-muted-gray'}>Kanal Protokol</span>
                <span className={`font-mono ${isDark ? 'text-white' : 'text-charcoal'}`}>MQTT via FastAPI REST Gateway</span>
              </div>
            </div>

            {/* Disclaimer mode simulasi vs real */}
            <div
              className={`mt-4 p-3 rounded-xl text-[11px] leading-relaxed flex items-start gap-2 ${
                isDark
                  ? 'bg-sky-500/10 border border-sky-500/30 text-sky-300'
                  : isSunny
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : isCloudy
                  ? 'border-slate-300 bg-slate-100 text-slate-700'
                  : 'bg-sky-50/50 border border-sky-100 text-slate-600'
              }`}
            >
              <Info
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  isDark ? 'text-sky-400' : isSunny ? 'text-amber-500' : isCloudy ? 'text-slate-600' : 'text-sky-400'
                }`}
              />
              <span>
                {isMockMode
                  ? 'Perhatian: Aplikasi berjalan dalam mode simulasi. Perintah diuji secara virtual tanpa transmisi fisik ke ESP8266.'
                  : 'Perintah dikirimkan melalui HTTP REST API ke FastAPI backend dan diteruskan ke broker MQTT.'}
              </span>
            </div>
          </div>

          {/* Recent Command Execution Log */}
          <div
            className={`rounded-3xl p-6 transition-all duration-300 ${
              isDark
                ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
                : isSunny
                ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
                : isCloudy
                ? 'bg-white border border-slate-200/80 shadow-sm'
                : 'bg-white border border-sky-100/80 shadow-soft-md'
            }`}
          >
            <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-charcoal'}`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isDark
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : isSunny
                    ? 'bg-amber-50 text-amber-500 border border-amber-200/80'
                    : isCloudy
                    ? 'bg-slate-100 text-slate-700 border border-slate-300'
                    : 'bg-sky-50 text-sky-500'
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <span>Riwayat Perintah Sesi Ini</span>
            </h4>

            {commandHistory.length === 0 ? (
              <p className={`text-xs py-4 text-center ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                Belum ada perintah yang dikirim dalam sesi ini.
              </p>
            ) : (
              <div className="space-y-2">
                {commandHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl flex items-center justify-between text-xs ${
                      isDark
                        ? 'bg-slate-800/60 border border-slate-700/50 text-slate-200'
                        : 'bg-slate-50 border border-slate-100 text-charcoal'
                    }`}
                  >
                    <div>
                      <span className={`font-bold uppercase ${isDark ? 'text-white' : 'text-charcoal'}`}>
                        {item.command}
                      </span>
                      <p className={`text-[11px] truncate max-w-[180px] ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                        {item.detail || item.status}
                      </p>
                    </div>

                    <div className="text-right">
                      <StatusBadge variant={getStatusBadgeVariant(item.status)} size="sm">
                        {item.status}
                      </StatusBadge>
                      <span className={`text-[10px] font-mono block mt-0.5 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
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
