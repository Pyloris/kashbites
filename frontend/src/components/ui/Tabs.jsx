import React from 'react';

/**
 * Tabs component for Category selectors and profile navigation
 */
export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  pill = true,
}) => {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 md:pb-0 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center
              ${pill ? 'rounded-lg' : 'rounded-none border-b-2'}
              ${
                isActive
                  ? 'bg-brand-emerald text-white shadow-xs'
                  : 'bg-white text-brand-muted border border-brand-sand hover:bg-brand-gold-tint hover:text-brand-emerald-dark'
              }
            `}
          >
            {tab.icon && (
              <tab.icon className={`w-3.5 h-3.5 mr-1.5 ${isActive ? 'text-brand-gold-bright' : 'text-current'}`} />
            )}
            <span>{tab.label || tab.name}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive
                    ? 'bg-brand-gold-bright text-brand-emerald-deep'
                    : 'bg-brand-sand-light text-brand-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
