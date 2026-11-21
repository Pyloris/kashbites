import React from 'react';

/**
 * PriceTag component for standardized, elegant price typography
 */
export const PriceTag = ({
  price,
  currentPrice,
  originalPrice,
  currency = '₹',
  size = 'md',
  showSavings = false,
  className = '',
  taxesNote = '',
}) => {
  const finalPrice = price ?? currentPrice ?? 0;
  const sizes = {
    sm: {
      price: 'text-sm font-bold',
      original: 'text-xs',
      currency: 'text-xs',
    },
    md: {
      price: 'text-lg sm:text-xl font-bold',
      original: 'text-xs',
      currency: 'text-sm sm:text-base',
    },
    lg: {
      price: 'text-2xl sm:text-3xl font-bold',
      original: 'text-sm',
      currency: 'text-lg sm:text-xl',
    },
    xl: {
      price: 'text-3xl sm:text-4xl font-extrabold',
      original: 'text-base',
      currency: 'text-xl sm:text-2xl',
    },
  };

  const currentSize = sizes[size] || sizes.md;
  const savingsPercent =
    originalPrice && originalPrice > finalPrice
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="inline-flex items-baseline gap-2">
        <span className={`${currentSize.price} text-brand-emerald-dark font-mono tabular-nums tracking-tight`}>
          <span className={`${currentSize.currency} font-sans mr-0.5`}>{currency}</span>
          {finalPrice}
        </span>

        {originalPrice && originalPrice > finalPrice && (
          <span className={`${currentSize.original} text-slate-400 line-through font-mono`}>
            {currency}{originalPrice}
          </span>
        )}

        {showSavings && savingsPercent > 0 && (
          <span className="text-[10px] font-bold bg-brand-gold text-brand-emerald-deep px-1.5 py-0.5 rounded shadow-2xs">
            Save {savingsPercent}%
          </span>
        )}
      </div>

      {taxesNote && (
        <span className="text-[11px] text-brand-text-muted mt-0.5">
          {taxesNote}
        </span>
      )}
    </div>
  );
};

export default PriceTag;
