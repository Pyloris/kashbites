import React from 'react';
import { AlertCircle, CheckCircle2, Info, Sparkles, X } from 'lucide-react';

/**
 * Alert / Callout banner component for alerts, promos, and system notices
 */
export const Alert = ({
  variant = 'info',
  title,
  message,
  onClose,
  className = '',
  children,
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
    },
    success: {
      container: 'bg-brand-emerald-light border-brand-emerald/30 text-brand-emerald-dark',
      icon: CheckCircle2,
      iconColor: 'text-brand-emerald',
    },
    warning: {
      container: 'bg-brand-gold-subtle border-brand-gold/50 text-brand-gold-dark',
      icon: Sparkles,
      iconColor: 'text-brand-gold',
    },
    danger: {
      container: 'bg-red-50 border-red-200 text-red-700',
      icon: AlertCircle,
      iconColor: 'text-red-600',
    },
    promo: {
      container: 'bg-brand-gold-subtle border-brand-gold-bright/60 text-brand-gold-dark',
      icon: Sparkles,
      iconColor: 'text-brand-gold-deep',
    },
  };

  const current = variants[variant] || variants.info;
  const IconComponent = current.icon;

  return (
    <div
      className={`
        p-3 rounded-xl border flex items-start justify-between gap-3 text-xs
        ${current.container}
        ${className}
      `}
    >
      <div className="flex items-start gap-2.5">
        <IconComponent className={`w-4 h-4 shrink-0 mt-0.5 ${current.iconColor}`} />
        <div>
          {title && <span className="font-bold block mb-0.5">{title}</span>}
          {message && <p className="leading-relaxed">{message}</p>}
          {children}
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
