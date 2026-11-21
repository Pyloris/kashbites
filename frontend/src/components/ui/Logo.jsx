import React from 'react';

export const Logo = ({
  className = '',
  size = 'md',
  variant = 'dark',
  alt = 'KashBites - A Taste of Kashmir',
}) => {
  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-18 sm:h-20',
  };

  const heightClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/assets/logos/logo-full-name.png"
        alt={alt}
        className={`${heightClass} w-auto object-contain transition-all duration-200 ${
          variant === 'light' ? 'brightness-0 invert opacity-95' : ''
        }`}
        loading="eager"
      />
    </div>
  );
};

export default Logo;
