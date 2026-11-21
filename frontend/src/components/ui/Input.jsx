import React from 'react';

/**
 * Input component with label, prefix icon, error state, and clearable support
 */
export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  containerClassName = '',
  required = false,
  id,
  type = 'text',
  ...rest
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-brand-muted mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          required={required}
          className={`
            w-full text-xs py-2.5 rounded-xl border bg-white outline-none transition-all
            ${Icon ? 'pl-9 pr-3' : 'px-3'}
            ${
              error
                ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-200'
                : 'border-brand-sand-dark focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/20'
            }
            text-brand-text placeholder:text-brand-subtle/70
            disabled:bg-brand-sand-light/50 disabled:cursor-not-allowed
            ${className}
          `}
          {...rest}
        />
      </div>

      {error ? (
        <p className="mt-1 text-[11px] text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-[11px] text-brand-subtle">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
