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
    success: 'bg-sky-50 text-sky-700 border-sky-200',
    secondary: 'bg-sky-50 text-sky-700 border-sky-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    warning: 'bg-soft-amber-light text-[#9A6B1A] border-soft-amber/30',
    danger: 'bg-soft-red-light text-soft-red border-soft-red/30',
    neutral: 'bg-sky-50 text-sky-700 border-sky-200',
    muted: 'bg-gray-100 text-muted-gray border-gray-200',
    // Dynamic Weather Variations
    sunny: 'bg-amber-100 text-amber-800 border-amber-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    cloudy: 'bg-slate-200 text-slate-800 border-slate-300',
    slate: 'bg-slate-200 text-slate-800 border-slate-300',
    rainy: 'bg-cyan-100 text-cyan-950 border-cyan-400',
    storm: 'bg-red-950/80 text-red-200 border-red-500/80',
    // Physical & Sensor Semantic Badges
    dry: 'bg-sky-50 text-sky-700 border-sky-200',
    wet: 'bg-cyan-100 text-cyan-950 border-cyan-400 font-semibold',
    open: 'bg-sky-50 text-sky-700 border-sky-200',
    closed: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  const dotColors = {
    success: 'bg-sky-500',
    secondary: 'bg-sky-500',
    sky: 'bg-sky-500',
    warning: 'bg-soft-amber',
    danger: 'bg-soft-red',
    neutral: 'bg-sky-500',
    muted: 'bg-muted-gray',
    sunny: 'bg-amber-500',
    amber: 'bg-amber-500',
    cloudy: 'bg-slate-700',
    slate: 'bg-slate-700',
    rainy: 'bg-cyan-500',
    storm: 'bg-red-500',
    dry: 'bg-sky-500',
    wet: 'bg-cyan-500',
    open: 'bg-sky-500',
    closed: 'bg-slate-600',
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
