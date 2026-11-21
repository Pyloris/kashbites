import React from 'react';

/**
 * Button component supporting KashBites design tokens:
 * - primary: Forest Emerald (brand-emerald)
 * - secondary: Sand Cream (brand-sand-light)
 * - gold: Royal Gold (brand-gold)
 * - outline: Bordered Emerald
 * - ghost: Transparent hover
 * - danger: Crimson Red
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  onClick,
  type = 'button',
  ...rest
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2';

  const variants = {
    primary: 'bg-brand-emerald text-white hover:bg-brand-emerald-dark active:bg-brand-emerald-deep focus-visible:outline-brand-emerald shadow-xs',
    secondary: 'bg-brand-sand-light text-brand-text hover:bg-brand-sand active:bg-brand-sand-dark focus-visible:outline-brand-sand',
    gold: 'bg-brand-gold text-brand-emerald-deep hover:bg-brand-gold-bright active:bg-brand-gold-dark font-bold shadow-xs focus-visible:outline-brand-gold',
    outline: 'border border-brand-emerald/40 text-brand-emerald hover:bg-brand-emerald-light active:bg-brand-emerald-light/80 focus-visible:outline-brand-emerald',
    outlineSand: 'border border-brand-sand text-brand-text hover:bg-brand-sand-light active:bg-brand-sand',
    ghost: 'text-brand-muted hover:bg-black/5 hover:text-brand-emerald-dark active:bg-black/10',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600 shadow-xs',
    dangerGhost: 'text-red-600 hover:bg-red-50 hover:text-red-700',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 rounded-md gap-1',
    sm: 'text-xs px-3.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 rounded-xl gap-2.5',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <svg className={`animate-spin ${iconSizes[size]}`} viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={`${iconSizes[size]} shrink-0`} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className={`${iconSizes[size]} shrink-0`} />}
        </>
      )}
    </button>
  );
};

export default Button;
