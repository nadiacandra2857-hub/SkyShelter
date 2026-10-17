import React from 'react';

export function StatusBadge({
  children,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  showDot = true,
  className = '',
}) {
  const variantStyles = {
    success: 'bg-soft-green-light text-forest border-forest/20',
    warning: 'bg-soft-amber-light text-[#9A6B1A] border-soft-amber/30',
    danger: 'bg-soft-red-light text-soft-red border-soft-red/30',
    neutral: 'bg-warm-surface text-charcoal border-sage/30',
    muted: 'bg-gray-100 text-muted-gray border-gray-200',
  };

  const dotColors = {
    success: 'bg-forest',
    warning: 'bg-soft-amber',
    danger: 'bg-soft-red',
    neutral: 'bg-charcoal',
    muted: 'bg-muted-gray',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors select-none ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                dotColors[variant] || dotColors.neutral
              }`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              dotColors[variant] || dotColors.neutral
            }`}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

export default StatusBadge;
