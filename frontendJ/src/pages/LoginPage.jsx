import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adminPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { login } = useAuth();
  const { isMockMode, showToast } = useApp();
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
    <div className="min-h-screen bg-warm-offwhite flex items-center justify-center p-4 selection:bg-sage/40">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-forest-deep text-sage shadow-soft-md mb-3 border border-forest">
            <Shield className="w-8 h-8 text-sage" />
          </div>
          <h1 className="text-2xl font-extrabold text-charcoal font-sans tracking-tight">
            SkyShelter
          </h1>
          <p className="text-xs text-muted-gray mt-1">
            Weather-Responsive Roofing System V2.0
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-lg p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-charcoal">Masuk ke Dashboard</h2>
            <p className="text-xs text-muted-gray mt-0.5">
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
                className="block text-xs font-semibold text-charcoal mb-1.5"
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-sage/40 bg-warm-surface text-charcoal text-sm placeholder:text-muted-gray/60 focus:bg-white focus:border-forest focus:ring-1 focus:ring-forest transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-charcoal mb-1.5"
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-sage/40 bg-warm-surface text-charcoal text-sm placeholder:text-muted-gray/60 focus:bg-white focus:border-forest focus:ring-1 focus:ring-forest transition-all"
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
              variant="primary"
              size="lg"
              isLoading={loading}
              rightIcon={ArrowRight}
              className="w-full mt-2"
            >
              Masuk ke Sistem
            </Button>
          </form>

          {/* Quick Demo Helper */}
          {isMockMode && (
            <div className="mt-6 pt-4 border-t border-sage/20 rounded-xl bg-warm-surface/70 p-3 text-xs text-muted-gray">
              <div className="flex items-center gap-1.5 font-semibold text-forest-deep mb-1">
                <Sparkles className="w-3.5 h-3.5 text-soft-amber" />
                <span>Kredensial Default Simulasi:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Username: <code className="bg-sage/20 px-1 py-0.5 rounded text-charcoal font-mono">admin</code>
                {' '}| Password:{' '}
                <code className="bg-sage/20 px-1 py-0.5 rounded text-charcoal font-mono">adminPassword123!</code>
              </p>
            </div>
          )}
        </div>

        {/* System Architecture Note */}
        <p className="text-center text-[11px] text-muted-gray mt-6">
          Sistem Kendali Atap Jemuran Berbasis Sensor Hujan & Prediksi Cuaca BMKG
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
