import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export function ErrorState({
  title = 'Gagal Memuat Data',
  message = 'Terjadi kendala saat berkomunikasi dengan server backend atau layanan sensor.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-soft-red-light/60 border border-soft-red/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-soft-red/10 flex items-center justify-center text-soft-red mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-charcoal mb-1">{title}</h4>
      <p className="text-xs md:text-sm text-muted-gray max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={RefreshCw}
          className="bg-white hover:bg-warm-surface"
        >
          Coba Muat Ulang
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
