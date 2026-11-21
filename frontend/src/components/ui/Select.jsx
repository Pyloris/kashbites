import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select dropdown component with consistent Kashmiri borders and styling
 */
export const Select = ({
  label,
  options = [],
  error,
  className = '',
  containerClassName = '',
  required = false,
  id,
  value,
  onChange,
  children,
  ...rest
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-brand-muted mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full appearance-none bg-white border rounded-lg px-3 py-2 pr-8 text-xs font-semibold
            text-brand-emerald outline-none cursor-pointer transition-all
            ${
              error
                ? 'border-red-400 focus:border-red-600'
                : 'border-brand-sand-dark focus:border-brand-emerald'
            }
            ${className}
          `}
          {...rest}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-subtle">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && <p className="mt-1 text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
