import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export function EmptyState({
  title = 'Tidak Ada Data',
  message = 'Belum ada rekaman yang sesuai dengan kriteria atau filter yang dipilih.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white/60 border border-sage/20 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-sage/20 flex items-center justify-center text-forest mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-charcoal mb-1">{title}</h4>
      <p className="text-xs text-muted-gray max-w-sm mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
