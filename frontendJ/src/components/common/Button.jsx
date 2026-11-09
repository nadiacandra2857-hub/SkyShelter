import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2', // 44px min for mobile touch target
    lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-sky-600 text-white hover:bg-sky-700 shadow-soft hover:shadow-soft-md active:bg-sky-800 focus:ring-sky-500',
    sky:
      'bg-sky-500 hover:bg-sky-600 text-white shadow-soft shadow-sky-100 active:bg-sky-700 ring-1 ring-sky-400/30 focus:ring-sky-500',
    amber:
      'bg-amber-500 hover:bg-amber-600 text-white shadow-soft shadow-amber-500/20 active:bg-amber-700 ring-1 ring-amber-400/30 focus:ring-amber-400',
    slate:
      'bg-slate-700 hover:bg-slate-800 text-white shadow-sm active:bg-slate-900 ring-1 ring-slate-600/30 focus:ring-slate-400',
    secondary:
      'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 active:bg-sky-200/80 focus:ring-sky-500',
    forest:
      'bg-sky-500 text-white hover:bg-sky-600 shadow-soft shadow-sky-100 active:bg-sky-700 focus:ring-sky-500',
    danger:
      'bg-soft-red text-white hover:opacity-95 shadow-soft active:bg-soft-red/90 focus:ring-red-400',
    outline:
      'border border-muted-gray/30 text-charcoal hover:bg-warm-surface active:bg-sky-50/50 focus:ring-slate-400',
    ghost:
      'text-charcoal hover:bg-sky-50 active:bg-sky-100 focus:ring-slate-400',
    none: '',
    custom: '',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className="w-4 h-4 flex-shrink-0" />}
          <span>{children}</span>
          {RightIcon && <RightIcon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
}

export default Button;
