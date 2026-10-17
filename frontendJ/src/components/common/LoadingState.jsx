import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({
  message = 'Memuat data sistem...',
  subtext = 'Menghubungkan ke sensor & layanan...',
  className = '',
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white/70 backdrop-blur-sm border border-sage/20 ${className}`}
    >
      <div className="relative mb-3 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-sage/30 border-t-forest animate-spin" />
      </div>
      <p className="text-sm font-semibold text-charcoal">{message}</p>
      {subtext && <p className="text-xs text-muted-gray mt-1">{subtext}</p>}
    </div>
  );
}

export default LoadingState;
