import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  RotateCcw,
  Sliders,
  Shield,
  Bell,
  Cpu,
  MapPin,
  Clock,
  Radio,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingState from '../components/common/LoadingState';
import settingsService from '../services/settingsService';
import { useApp } from '../context/AppContext';
import { useWeatherTheme } from '../context/WeatherThemeContext';

export function SettingsPage() {
  const { theme, activeCondition } = useWeatherTheme();
  const isDark = theme?.isDark;
  const isSunny = activeCondition === 'sunny' && !isDark;
  const isCloudy = activeCondition === 'cloudy' && !isDark;

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Form states
  const [threshold, setThreshold] = useState(80);
  const [horizon, setHorizon] = useState(60);
  const [stabilizationDelay, setStabilizationDelay] = useState(30);
  const [pollInterval, setPollInterval] = useState(15);
  const [locationName, setLocationName] = useState('DKI Jakarta');
  const [forecastEnabled, setForecastEnabled] = useState(true);

  // In-app notification preferences (client-side)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastAlerts, setToastAlerts] = useState(true);

  const { showToast, isMockMode } = useApp();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
      setThreshold(data.early_close_threshold ?? 80);
      setHorizon(data.forecast_horizon_minutes ?? 60);
      setStabilizationDelay(data.roof_stabilization_delay_seconds ?? 30);
      setPollInterval(data.weather_poll_interval_minutes ?? 15);
      setLocationName(data.installation_location || 'DKI Jakarta');
      setForecastEnabled(data.forecast_feature_enabled ?? true);
    } catch (err) {
      showToast(err?.message || 'Gagal memuat pengaturan sistem.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    // Validasi input
    if (threshold < 0 || threshold > 100) {
      showToast('Ambang probabilitas hujan harus berada di antara 0% dan 100%.', 'error');
      return;
    }
    if (horizon < 10 || horizon > 360) {
      showToast('Horizon prakiraan harus berada di antara 10 dan 360 menit.', 'error');
      return;
    }
    if (stabilizationDelay < 5 || stabilizationDelay > 600) {
      showToast('Jeda stabilisasi harus berada di antara 5 dan 600 detik.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        early_close_threshold: Number(threshold),
        forecast_horizon_minutes: Number(horizon),
        roof_stabilization_delay_seconds: Number(stabilizationDelay),
        weather_poll_interval_minutes: Number(pollInterval),
        installation_location: locationName.trim(),
        forecast_feature_enabled: Boolean(forecastEnabled),
      };

      const res = await settingsService.updateSettings(payload);
      setSettings(res);
      showToast('Pengaturan sistem berhasil disimpan.', 'success');
    } catch (err) {
      showToast(err?.message || 'Gagal menyimpan pengaturan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await settingsService.resetSettings();
      setSettings(res);
      setThreshold(res.early_close_threshold ?? 80);
      setHorizon(res.forecast_horizon_minutes ?? 60);
      setStabilizationDelay(res.roof_stabilization_delay_seconds ?? 30);
      setPollInterval(res.weather_poll_interval_minutes ?? 15);
      setLocationName(res.installation_location || 'DKI Jakarta');
      setForecastEnabled(res.forecast_feature_enabled ?? true);
      showToast('Pengaturan telah di-reset ke konfigurasi bawaan pabrik.', 'info');
    } catch (err) {
      showToast(err?.message || 'Gagal mereset pengaturan.', 'error');
    } finally {
      setConfirmResetOpen(false);
    }
  };

  if (loading && !settings) {
    return <LoadingState message="Memuat konfigurasi sistem..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <Settings
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
              Konfigurasi & Parameter Sistem
            </span>
          </div>
          <h2 className={`text-xl md:text-2xl font-extrabold font-sans mt-0.5 ${isDark ? 'text-white' : 'text-charcoal'}`}>
            Pengaturan Sistem & Batas Ambang
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
            Sesuaikan sensitivitas algoritma Early-Close, jeda stabilisasi, dan preferensi notifikasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmResetOpen(true)}
            leftIcon={RotateCcw}
            className={
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                : isCloudy
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }
          >
            Reset Default
          </Button>

          <Button
            variant={isSunny ? 'amber' : isCloudy ? 'slate' : 'sky'}
            size="sm"
            onClick={handleSave}
            isLoading={saving}
            leftIcon={Save}
            className={
              isSunny
                ? 'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-soft shadow-amber-500/20 ring-1 ring-amber-400/30'
                : isCloudy
                ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm ring-1 ring-slate-600/30'
                : ''
            }
          >
            Simpan Perubahan
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Algoritma Early-Close & Cuaca */}
        <div
          className={`rounded-3xl p-6 transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
              : isSunny
              ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
              : isCloudy
              ? 'bg-white border border-slate-200/80 shadow-sm'
              : 'bg-white border border-slate-200/80 shadow-soft-md'
          }`}
        >
          <div
            className={`flex items-center gap-3 mb-6 pb-4 border-b ${
              isDark ? 'border-slate-800' : isSunny ? 'border-amber-100/80' : isCloudy ? 'border-slate-200/80' : 'border-slate-100'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isDark
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : isSunny
                  ? 'bg-amber-50 text-amber-500 border border-amber-200/80'
                  : isCloudy
                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                  : 'bg-sky-50 text-sky-500'
              }`}
            >
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>
                Parameter Algoritma Early-Close (V2.0)
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                Aturan prediksi cuaca yang memicu penutupan kanopi sebelum hujan tiba
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Threshold Input */}
            <div>
              <label
                htmlFor="threshold"
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-charcoal'}`}
              >
                Ambang Batas Probabilitas Hujan (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="threshold"
                  type="range"
                  min="30"
                  max="95"
                  step="5"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className={`flex-1 cursor-pointer ${
                    isSunny ? 'accent-amber-500' : isCloudy ? 'accent-slate-600' : isDark ? 'accent-sky-400' : 'accent-sky-500'
                  }`}
                />
                <span
                  className={`font-mono font-bold text-sm px-3 py-1.5 rounded-xl border min-w-[56px] text-center ${
                    isDark
                      ? 'border-sky-500/40 text-sky-400 bg-slate-800/80'
                      : isSunny
                      ? 'border-amber-200 text-amber-700 bg-amber-50/70'
                      : isCloudy
                      ? 'border-slate-300 text-slate-800 bg-slate-100'
                      : 'border-sky-200 text-sky-700 bg-sky-50/70'
                  }`}
                >
                  {threshold}%
                </span>
              </div>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                Bawaan: 80%. Kanopi otomatis menutup jika prakiraan hujan &gt;= nilai ini.
              </p>
            </div>

            {/* Forecast Horizon */}
            <div>
              <label
                htmlFor="horizon"
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-charcoal'}`}
              >
                Horizon Waktu Prediksi (Menit)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="horizon"
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={horizon}
                  onChange={(e) => setHorizon(Number(e.target.value))}
                  className={`flex-1 cursor-pointer ${
                    isSunny ? 'accent-amber-500' : isCloudy ? 'accent-slate-600' : isDark ? 'accent-sky-400' : 'accent-sky-500'
                  }`}
                />
                <span
                  className={`font-mono font-bold text-sm px-3 py-1.5 rounded-xl border min-w-[64px] text-center ${
                    isDark
                      ? 'border-sky-500/40 text-sky-400 bg-slate-800/80'
                      : isSunny
                      ? 'border-amber-200 text-amber-700 bg-amber-50/70'
                      : isCloudy
                      ? 'border-slate-300 text-slate-800 bg-slate-100'
                      : 'border-sky-200 text-sky-700 bg-sky-50/70'
                  }`}
                >
                  {horizon} m
                </span>
              </div>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                Bawaan: 60 menit. Jarak waktu prakiraan yang dianalisis oleh algoritma.
              </p>
            </div>

            {/* Weather Poll Interval */}
            <div>
              <label
                htmlFor="pollInterval"
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-charcoal'}`}
              >
                Interval Sinkronisasi API Cuaca
              </label>
              <select
                id="pollInterval"
                value={pollInterval}
                onChange={(e) => setPollInterval(Number(e.target.value))}
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 transition-colors focus:ring-1 focus:ring-sky-500 ${
                  isDark
                    ? 'bg-slate-800 border border-slate-700 text-white focus:border-sky-500'
                    : isCloudy
                    ? 'bg-slate-50 border border-slate-300 text-charcoal focus:bg-white focus:ring-slate-400 focus:border-slate-400'
                    : 'bg-slate-50 border border-slate-200 text-charcoal focus:bg-white focus:border-sky-500'
                }`}
              >
                <option value={10}>Setiap 10 Menit</option>
                <option value={15}>Setiap 15 Menit (Disarankan)</option>
                <option value={30}>Setiap 30 Menit</option>
                <option value={60}>Setiap 60 Menit</option>
              </select>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                Frekuensi pengambilan data regional dari BMKG.
              </p>
            </div>

            {/* Installation Location */}
            <div>
              <label
                htmlFor="location"
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-charcoal'}`}
              >
                Wilayah / Lokasi Instalasi
              </label>
              <input
                id="location"
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="mis. DKI Jakarta"
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 transition-colors focus:ring-1 focus:ring-sky-500 ${
                  isDark
                    ? 'bg-slate-800 border border-slate-700 text-white focus:border-sky-500'
                    : isCloudy
                    ? 'bg-slate-50 border border-slate-300 text-charcoal focus:bg-white focus:ring-slate-400 focus:border-slate-400'
                    : 'bg-slate-50 border border-slate-200 text-charcoal focus:bg-white focus:border-sky-500'
                }`}
              />
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                Lokasi geografis untuk pemetaan koordinat cuaca regional BMKG.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Kontrol Fisik & Stabilisasi Sensor */}
        <div
          className={`rounded-3xl p-6 transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
              : isSunny
              ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
              : isCloudy
              ? 'bg-white border border-slate-200/80 shadow-sm'
              : 'bg-white border border-slate-200/80 shadow-soft-md'
          }`}
        >
          <div
            className={`flex items-center gap-3 mb-6 pb-4 border-b ${
              isDark ? 'border-slate-800' : isSunny ? 'border-amber-100/80' : isCloudy ? 'border-slate-200/80' : 'border-slate-100'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isDark
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : isSunny
                  ? 'bg-amber-50 text-amber-500 border border-amber-200/80'
                  : isCloudy
                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                  : 'bg-sky-50 text-sky-500'
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>
                Proteksi Fisik & Jeda Stabilisasi
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                Pengaturan sinkronisasi hardware yang diteruskan ke kontroler ESP8266
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stabilization Delay */}
            <div>
              <label
                htmlFor="stabilizationDelay"
                className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-charcoal'}`}
              >
                Jeda Pasca-Hujan (Stabilisasi Sensor)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="stabilizationDelay"
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={stabilizationDelay}
                  onChange={(e) => setStabilizationDelay(Number(e.target.value))}
                  className={`flex-1 cursor-pointer ${
                    isSunny ? 'accent-amber-500' : isCloudy ? 'accent-slate-600' : isDark ? 'accent-sky-400' : 'accent-sky-500'
                  }`}
                />
                <span
                  className={`font-mono font-bold text-sm px-3 py-1.5 rounded-xl border min-w-[56px] text-center ${
                    isDark
                      ? 'border-sky-500/40 text-sky-400 bg-slate-800/80'
                      : isSunny
                      ? 'border-amber-200 text-amber-700 bg-amber-50/70'
                      : isCloudy
                      ? 'border-slate-300 text-slate-800 bg-slate-100'
                      : 'border-sky-200 text-sky-700 bg-sky-50/70'
                  }`}
                >
                  {stabilizationDelay}s
                </span>
              </div>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                Waktu tunggu setelah sensor kering sebelum atap diperbolehkan membuka kembali.
              </p>
            </div>

            {/* Toggle Forecast Feature */}
            <div
              className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                isDark
                  ? 'bg-slate-800/70 border border-slate-700/60'
                  : isSunny
                  ? 'bg-amber-50/50 border border-amber-200/80'
                  : isCloudy
                  ? 'bg-slate-100/70 border border-slate-300'
                  : 'bg-slate-50 border border-slate-200/70'
              }`}
            >
              <div>
                <span className={`text-xs font-semibold block ${isDark ? 'text-white' : 'text-charcoal'}`}>
                  Aktifkan Fitur Early-Close
                </span>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
                  Jika dinonaktifkan, atap hanya mengandalkan sensor hujan fisik lokal murni.
                </span>
              </div>
              <input
                type="checkbox"
                checked={forecastEnabled}
                onChange={(e) => setForecastEnabled(e.target.checked)}
                className={`w-5 h-5 rounded cursor-pointer ${
                  isSunny
                    ? 'accent-amber-500 text-amber-500 focus:ring-amber-400'
                    : isCloudy
                    ? 'accent-slate-600 text-slate-600 focus:ring-slate-400'
                    : 'accent-sky-500 text-sky-500 focus:ring-sky-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Informasi Hardware & Layanan (Read-Only) */}
        <div
          className={`rounded-3xl p-6 transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/70 border border-slate-700/60 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
              : isSunny
              ? 'bg-white border border-amber-100/80 shadow-sm shadow-amber-100/50'
              : isCloudy
              ? 'bg-white border border-slate-200/80 shadow-sm'
              : 'bg-white border border-slate-200/80 shadow-soft-md'
          }`}
        >
          <div
            className={`flex items-center gap-3 mb-4 pb-3 border-b ${
              isDark ? 'border-slate-800' : isSunny ? 'border-amber-100/80' : isCloudy ? 'border-slate-200/80' : 'border-slate-100'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
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
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>
              Informasi Spesifikasi Sistem (Read-Only)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Firmware IoT</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>ESP8266 Arduino Framework V2.0</span>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Backend API</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>FastAPI + Python 3.12 REST</span>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>Penyedia Cuaca</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>BMKG Open Data API</span>
            </div>
          </div>

          <div
            className={`mt-4 p-3 rounded-xl text-[11px] flex items-start gap-2 ${
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
              Perubahan parameter di atas disimpan pada database backend FastAPI. Sinkronisasi ke mikrokontroler fisik dilakukan saat ESP8266 online melalui protokol MQTT.
            </span>
          </div>
        </div>
      </form>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="Reset Pengaturan ke Bawaan?"
        message="Tindakan ini akan mengembalikan seluruh ambang batas (Early-Close 80%, Horizon 60m, Jeda 30s) ke konfigurasi standar pabrik."
        confirmLabel="Reset Pengaturan"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleReset}
        onClose={() => setConfirmResetOpen(false)}
      />
    </motion.div>
  );
}

export default SettingsPage;
