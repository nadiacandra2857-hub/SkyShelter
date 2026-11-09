import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function ConfirmDialog({
  isOpen,
  title = 'Konfirmasi Tindakan',
  message,
  confirmLabel = 'Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'danger', // 'danger' | 'primary'
  isLoading = false,
  onConfirm,
  onClose,
}) {
  const { theme, activeCondition } = useWeatherTheme();
  const isDark = theme?.isDark;
  const isSunny = activeCondition === 'sunny' && !isDark;
  const isCloudy = activeCondition === 'cloudy' && !isDark;

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={!isLoading ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            className={`relative w-full max-w-md rounded-2xl p-6 shadow-soft-lg z-10 transition-colors border ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-white shadow-2xl shadow-black/80'
                : 'bg-white border-slate-200/80 text-charcoal'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    variant === 'danger'
                      ? 'bg-soft-red-light text-soft-red'
                      : isDark
                      ? 'bg-slate-800 text-sky-400 border border-slate-700'
                      : isCloudy
                      ? 'bg-slate-100 text-slate-700 border border-slate-300'
                      : isSunny
                      ? 'bg-amber-50 text-amber-500 border border-amber-200'
                      : 'bg-sky-50 text-sky-500'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 id="dialog-title" className={`text-base font-semibold ${isDark ? 'text-white' : 'text-charcoal'}`}>
                  {title}
                </h3>
              </div>
              {!isLoading && (
                <button
                  type="button"
                  onClick={onClose}
                  className={`rounded-lg p-1.5 transition-colors ${
                    isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-muted-gray hover:bg-slate-100 hover:text-charcoal'
                  }`}
                  aria-label="Tutup dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-slate-300' : 'text-muted-gray'}`}>
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                disabled={isLoading}
                className={isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : ''}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={
                  variant === 'danger'
                    ? 'danger'
                    : isCloudy
                    ? 'slate'
                    : isSunny
                    ? 'amber'
                    : 'primary'
                }
                size="md"
                isLoading={isLoading}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
