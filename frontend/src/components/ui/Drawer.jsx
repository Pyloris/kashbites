import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Drawer component for sliding panels (Cart, Filters, Navigation)
 */
export const Drawer = ({
  isOpen,
  onClose,
  title,
  badge,
  children,
  footer,
  width = 'max-w-md',
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`
          relative w-full ${width} bg-brand-card h-full shadow-2xl flex flex-col justify-between
          text-brand-text border-l border-brand-sand animate-in slide-in-from-right duration-300
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-brand-emerald-forest text-brand-text-light flex items-center justify-between border-b-2 border-brand-gold shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-serif-brand text-xl font-bold">{title}</h3>
            {badge && (
              <span className="text-xs bg-brand-emerald-medium text-brand-gold-bright px-2 py-0.5 rounded-full font-bold">
                {badge}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-brand-sand bg-white shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
