import React from 'react';

/**
 * Badge component for product tags, discount ribbons, certifications, and status indicators
 */
export const Badge = ({
  variant = 'origin',
  size = 'md',
  pill = false,
  dot = false,
  className = '',
  children,
  ...rest
}) => {
  const baseStyles = 'inline-flex items-center font-bold tracking-wider uppercase transition-colors';

  const variants = {
    origin: 'bg-brand-emerald text-brand-canvas shadow-xs',
    gold: 'bg-brand-gold-bright text-brand-emerald-dark shadow-xs',
    discount: 'bg-brand-gold text-brand-emerald-deep shadow-xs',
    danger: 'bg-red-700 text-white shadow-xs',
    neutral: 'bg-brand-sand-light text-brand-muted',
    subtle: 'bg-brand-emerald-light text-brand-emerald-dark',
    outline: 'border border-brand-sand text-brand-muted bg-white',
    count: 'bg-brand-gold-subtle text-brand-gold-dark font-mono font-bold',
  };

  const sizes = {
    xs: 'text-[9px] px-1.5 py-0.5',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-1',
    lg: 'text-xs px-3 py-1',
  };

  const rounded = pill ? 'rounded-full' : 'rounded';

  return (
    <span
      className={`
        ${baseStyles}
        ${variants[variant] || variants.origin}
        ${sizes[size] || sizes.md}
        ${rounded}
        ${className}
      `}
      {...rest}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            variant === 'origin' ? 'bg-brand-gold-bright' : 'bg-current'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
