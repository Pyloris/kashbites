import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal dialog with signature KashBites emerald ribbon header & gold border
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  className = '',
  closeOnBackdrop = true,
  headerContent,
  footer,
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

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`
          relative w-full ${sizes[size] || sizes.md} bg-brand-card rounded-2xl shadow-2xl
          border-2 border-brand-gold/40 overflow-hidden text-brand-text max-h-[90vh] flex flex-col
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Emerald background & Gold border */}
        <div className="bg-brand-emerald-forest text-brand-text-light p-4 sm:p-5 flex items-center justify-between border-b-2 border-brand-gold shrink-0">
          {headerContent || (
            <div>
              <h3 className="font-serif-brand text-lg sm:text-xl font-bold">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-brand-sand-dark mt-0.5 font-normal">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-brand-sand/60 bg-brand-sand-surface/40 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
