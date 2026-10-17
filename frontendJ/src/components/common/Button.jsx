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
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2', // 44px min for mobile touch target
    lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-forest-deep text-white hover:bg-forest shadow-soft hover:shadow-soft-md active:bg-forest-deep',
    secondary:
      'bg-sage/20 text-forest-deep hover:bg-sage/35 border border-sage/30 active:bg-sage/40',
    forest:
      'bg-forest text-white hover:bg-forest-light shadow-soft active:bg-forest',
    danger:
      'bg-soft-red text-white hover:opacity-95 shadow-soft active:bg-soft-red/90',
    outline:
      'border border-muted-gray/30 text-charcoal hover:bg-warm-surface active:bg-sage/10',
    ghost:
      'text-charcoal hover:bg-sage/20 active:bg-sage/30',
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
