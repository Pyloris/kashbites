import React from 'react';
import { RefreshCw, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

export const AdminHeader = ({ title, subtitle, onRefresh, isRefreshing = false, actions }) => {
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();

  return (
    <header className="bg-white border-b border-brand-sand/60 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 shadow-2xs">
      <div>
        <h2 className="font-serif-brand text-2xl font-bold text-brand-text-display tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-brand-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-sand bg-white hover:bg-brand-canvas text-xs font-medium text-brand-text-body transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh active records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-emerald ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        )}

        {actions}

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-emerald-tint text-brand-emerald hover:bg-brand-emerald hover:text-white border border-brand-emerald/20 text-xs font-semibold transition-all cursor-pointer"
        >
          <Store className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Storefront</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
