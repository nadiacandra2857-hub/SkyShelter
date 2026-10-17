import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

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
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
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
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-lg border border-sage/30 z-10"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    variant === 'danger'
                      ? 'bg-soft-red-light text-soft-red'
                      : 'bg-forest/10 text-forest'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 id="dialog-title" className="text-base font-semibold text-charcoal">
                  {title}
                </h3>
              </div>
              {!isLoading && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-gray hover:bg-warm-surface hover:text-charcoal transition-colors"
                  aria-label="Tutup dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <p className="text-sm text-muted-gray mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
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
