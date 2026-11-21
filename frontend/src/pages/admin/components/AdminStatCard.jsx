import React from 'react';

export const AdminStatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald' }) => {
  const colorStyles = {
    emerald: 'bg-brand-emerald-tint text-brand-emerald border-brand-emerald/20',
    gold: 'bg-brand-gold-tint text-brand-gold-dark border-brand-gold/30',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-sand/70 p-5 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorStyles[color] || colorStyles.emerald}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <span className="text-2xl font-bold font-serif-brand text-brand-text-display">
          {value}
        </span>
        {subtitle && (
          <p className="text-xs text-brand-text-muted mt-1 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default AdminStatCard;
