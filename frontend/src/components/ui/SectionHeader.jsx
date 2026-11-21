import React from 'react';

/**
 * SectionHeader component with the royal Kashmiri eyebrow, serif display heading, and subtitle
 */
export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  centered = false,
  className = '',
  action,
}) => {
  return (
    <div
      className={`
        flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-brand-sand
        ${centered ? 'text-center items-center sm:justify-center' : ''}
        ${className}
      `}
    >
      <div>
        {eyebrow && (
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-gold block mb-1">
            {eyebrow}
          </span>
        )}
        {title && (
          <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-brand-emerald-dark tracking-tight">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xs sm:text-sm text-brand-muted mt-1.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default SectionHeader;
