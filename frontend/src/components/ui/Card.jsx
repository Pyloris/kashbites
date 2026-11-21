import React from 'react';

/**
 * Card Component with optional Header, Body, and Footer
 */
export const Card = ({
  hoverable = false,
  elevated = false,
  bordered = true,
  surface = 'white',
  className = '',
  onClick,
  children,
  ...rest
}) => {
  const surfaces = {
    white: 'bg-white',
    card: 'bg-brand-card',
    sand: 'bg-brand-sand-light',
    tint: 'bg-brand-emerald-light',
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${surfaces[surface] || surfaces.white}
        rounded-xl overflow-hidden
        ${bordered ? 'border border-brand-sand' : ''}
        ${elevated ? 'shadow-md' : 'shadow-xs'}
        ${hoverable ? 'hover:border-brand-gold/60 hover:shadow-lg transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
};

Card.Header = ({ className = '', children, ...rest }) => (
  <div className={`p-4 sm:p-5 border-b border-brand-sand/60 ${className}`} {...rest}>
    {children}
  </div>
);

Card.Body = ({ className = '', children, ...rest }) => (
  <div className={`p-4 sm:p-5 ${className}`} {...rest}>
    {children}
  </div>
);

Card.Footer = ({ className = '', children, ...rest }) => (
  <div className={`p-4 sm:p-5 border-t border-brand-sand/60 bg-brand-sand-surface/30 ${className}`} {...rest}>
    {children}
  </div>
);

export default Card;
