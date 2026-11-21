import React from 'react';
import { Plus, Minus } from 'lucide-react';

/**
 * QuantityStepper component with rounded sand border
 */
export const QuantityStepper = ({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className = '',
}) => {
  const handleDecrement = (e) => {
    e.stopPropagation();
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (value < max) {
      onChange(value + 1);
    }
  };

  const sizes = {
    sm: {
      btn: 'px-2 py-0.5 text-xs',
      value: 'px-2 py-0.5 text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      btn: 'px-2.5 py-1 text-xs',
      value: 'px-3 py-1 text-xs font-semibold',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      btn: 'px-3 py-1.5 text-sm',
      value: 'px-4 py-1.5 text-sm font-semibold',
      icon: 'w-4 h-4',
    },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div
      className={`inline-flex items-center border border-brand-sand-dark rounded-lg bg-white select-none overflow-hidden ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={`${currentSize.btn} text-brand-emerald hover:bg-brand-canvas active:bg-brand-sand-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Decrease quantity"
      >
        <Minus className={currentSize.icon} />
      </button>

      <span className={`${currentSize.value} font-mono font-bold text-brand-text text-center min-w-6`}>
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={`${currentSize.btn} text-brand-emerald hover:bg-brand-canvas active:bg-brand-sand-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Increase quantity"
      >
        <Plus className={currentSize.icon} />
      </button>
    </div>
  );
};

export default QuantityStepper;
