import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  ShoppingBag,
  Users,
  UserCheck,
  Truck,
  Store,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { Logo } from '../../../components/ui/index.js';

const NAV_ITEMS = [
  { to: '/prelaunch/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/prelaunch/admin/leads', label: 'VIP Prelaunch Leads', icon: UserCheck },
  { to: '/prelaunch/admin/inventory', label: 'Products & Stock', icon: Package },
  { to: '/prelaunch/admin/categories', label: 'Categories', icon: Layers },
  { to: '/prelaunch/admin/coupons', label: 'Coupons & Offers', icon: Tag },
  { to: '/prelaunch/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
  { to: '/prelaunch/admin/users', label: 'Customer Accounts', icon: Users },
  { to: '/prelaunch/admin/webhooks', label: 'Shipping Webhooks', icon: Truck },
];

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/prelaunch/admin/auth');
  };

  return (
    <aside className="w-64 bg-brand-emerald-darker text-brand-text-light flex flex-col shrink-0 min-h-screen border-r border-brand-emerald/40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-brand-emerald/30">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Logo variant="light" size="sm" />
            <span className="text-[10px] bg-brand-gold text-brand-emerald-darker px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Admin
            </span>
          </div>
          <p className="text-[11px] text-brand-sand-light/80 font-medium tracking-wide">
            Kashmir Valley Atelier
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-sand-medium/70">
          Management
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-emerald text-brand-gold font-bold shadow-sm border border-brand-gold/30'
                    : 'text-brand-sand-light hover:bg-brand-emerald/40 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-brand-gold" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Storefront / Profile */}
      <div className="p-4 border-t border-brand-emerald/30 space-y-3 bg-brand-emerald-deep">
        <div className="flex items-center justify-between text-xs">
          <div className="truncate">
            <span className="font-semibold text-white block truncate">
              {adminUser?.fullName || adminUser?.name || 'Administrator'}
            </span>
            <span className="text-[11px] text-brand-sand-medium truncate block">
              @{adminUser?.username || 'admin'} · {adminUser?.role || 'superadmin'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => navigate('/prelaunch')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-emerald-dark hover:bg-brand-emerald text-brand-sand-light text-[11px] font-medium border border-brand-emerald/50 transition-colors cursor-pointer"
            title="Open customer storefront"
          >
            <Store className="w-3.5 h-3.5 text-brand-gold" />
            <span>Storefront</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-200 text-[11px] font-medium border border-red-800/40 transition-colors flex items-center gap-1 cursor-pointer"
            title="Log out of admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
