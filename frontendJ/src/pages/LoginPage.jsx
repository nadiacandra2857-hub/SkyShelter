import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useWeatherTheme } from '../context/WeatherThemeContext';

export function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adminPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { login } = useAuth();
  const { showToast } = useApp();
  const { theme, activeCondition } = useWeatherTheme();
  const isDark = theme?.isDark;
  const isSunny = activeCondition === 'sunny' && !isDark;
  const isCloudy = activeCondition === 'cloudy' && !isDark;

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Username atau email wajib diisi.');
      return;
    }
    if (!password) {
      setErrorMessage('Password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      showToast('Login berhasil! Selamat datang di SkyShelter.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(
        err?.message || 'Login gagal. Periksa kembali username dan password Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.pageBg} flex items-center justify-center p-4 selection:bg-sky-200 transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-3xl shadow-soft-md mb-3 border transition-colors ${
              isDark
                ? 'bg-slate-950 text-sky-400 border-slate-800'
                : isSunny
                ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20'
                : isCloudy
                ? 'bg-slate-700 text-white border-slate-600'
                : 'bg-sky-500 text-white border-sky-400 shadow-sky-500/20'
            }`}
          >
            <Shield className="w-8 h-8" />
          </div>
          <h1 className={`text-2xl font-extrabold font-sans tracking-tight ${isDark ? 'text-white' : 'text-charcoal'}`}>
            SkyShelter
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
            Weather-Responsive Roofing System V2.0
          </p>
        </div>

        {/* Card Form */}
        <div
          className={`rounded-3xl border shadow-soft-lg p-6 sm:p-8 transition-colors ${
            isDark
              ? 'bg-slate-900/90 border-slate-700/80 text-white backdrop-blur-md'
              : isSunny
              ? 'bg-white/95 border-amber-200/90 shadow-amber-100/40 text-charcoal'
              : isCloudy
              ? 'bg-white/95 border-slate-300/80 text-charcoal'
              : 'bg-white/95 border-sky-200/90 shadow-sky-100/40 text-charcoal'
          }`}
        >
          <div className="mb-6">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>Masuk ke Dashboard</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
              Autentikasi untuk memantau sensor dan kendali atap jemuran
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-xl bg-soft-red-light border border-soft-red/40 flex items-start gap-2.5 text-xs text-soft-red"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label
                htmlFor="username"
                className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-charcoal'}`}
              >
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-gray">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500 focus:ring-sky-500'
                      : isSunny
                      ? 'bg-amber-50/50 border-amber-200 text-charcoal placeholder:text-muted-gray/60 focus:bg-white focus:border-amber-500 focus:ring-amber-500'
                      : isCloudy
                      ? 'bg-slate-50 border-slate-300 text-charcoal placeholder:text-muted-gray/60 focus:bg-white focus:border-slate-500 focus:ring-slate-500'
                      : 'bg-slate-50 border-slate-200 text-charcoal placeholder:text-muted-gray/60 focus:bg-white focus:border-sky-500 focus:ring-sky-500'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-charcoal'}`}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-gray">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500 focus:ring-sky-500'
                      : isSunny
                      ? 'bg-amber-50/50 border-amber-200 text-charcoal placeholder:text-muted-gray/60 focus:bg-white focus:border-amber-500 focus:ring-amber-500'
                      : isCloudy
                      ? 'bg-slate-50 border-slate-300 text-charcoal placeholder:text-muted-gray/60 focus:bg-white focus:border-slate-500 focus:ring-slate-500'
                      : 'bg-slate-50 border-slate-200 text-charcoal placeholder:text-muted-gray/60 focus:bg-white focus:border-sky-500 focus:ring-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-gray hover:text-charcoal transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant={isSunny ? 'amber' : isCloudy ? 'slate' : 'sky'}
              size="lg"
              isLoading={loading}
              rightIcon={ArrowRight}
              className={`w-full mt-2 font-semibold ${
                isSunny
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-soft shadow-amber-500/20'
                  : isCloudy
                  ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm'
                  : 'bg-sky-500 hover:bg-sky-600 text-white shadow-soft shadow-sky-500/20'
              }`}
            >
              Masuk ke Sistem
            </Button>
          </form>
        </div>

        {/* System Architecture Note */}
        <p className={`text-center text-[11px] mt-6 ${isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
          Sistem Kendali Atap Jemuran Berbasis Sensor Hujan & Prediksi Cuaca Open-Meteo
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
