import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Truck,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { adminApi } from '../../../services/admin.api.js';
import { AdminHeader } from '../components/AdminHeader.jsx';
import { AdminStatCard } from '../components/AdminStatCard.jsx';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getOrders(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (ordersRes.success && Array.isArray(ordersRes.data)) {
        setOrders(ordersRes.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Operations Dashboard"
        subtitle="Real-time harvest inventory, orders, revenue & cold-storage dispatch overview"
        onRefresh={loadDashboardData}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            title="Total Revenue"
            value={formatCurrency(stats?.revenue?.total || 0)}
            subtitle={`${stats?.orders?.total || 0} lifetime orders logged`}
            icon={DollarSign}
            color="emerald"
          />

          <AdminStatCard
            title="Active Orders"
            value={stats?.orders?.active || 0}
            subtitle={`${stats?.orders?.total || 0} total · ${stats?.orders?.cancelled || 0} cancelled`}
            icon={ShoppingBag}
            color="blue"
          />

          <AdminStatCard
            title="Harvest Products"
            value={stats?.products?.total || 0}
            subtitle={
              stats?.products?.outOfStock > 0
                ? `${stats?.products?.outOfStock} out of stock`
                : 'All variants currently in stock'
            }
            icon={Package}
            color={stats?.products?.outOfStock > 0 ? 'rose' : 'gold'}
          />

          <AdminStatCard
            title="Registered Customers"
            value={stats?.users?.total || 0}
            subtitle={`${stats?.coupons?.active || 0} active promotional coupons`}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Action Shortcuts & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-brand-sand/70 p-6 shadow-2xs space-y-4">
            <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
              Management Modules
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/prelaunch/admin/leads')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-brand-sand/60 hover:bg-brand-emerald-tint/50 transition-colors cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-text-display block group-hover:text-brand-emerald">
                      VIP Prelaunch Leads
                    </span>
                    <span className="text-[11px] text-brand-text-muted">
                      View early subscribers, copy phone numbers & WhatsApp
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-emerald opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => navigate('/prelaunch/admin/inventory')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-brand-sand/60 hover:bg-brand-emerald-tint/50 transition-colors cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-text-display block group-hover:text-brand-emerald">
                      Product Catalog & Weights
                    </span>
                    <span className="text-[11px] text-brand-text-muted">
                      Add products, update pricing & stocks
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-emerald opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => navigate('/prelaunch/admin/orders')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-brand-sand/60 hover:bg-brand-emerald-tint/50 transition-colors cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-text-display block group-hover:text-blue-700">
                      Orders & Cold-Packing
                    </span>
                    <span className="text-[11px] text-brand-text-muted">
                      Update statuses & assign tracking
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => navigate('/prelaunch/admin/webhooks')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-brand-sand/60 hover:bg-brand-emerald-tint/50 transition-colors cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-text-display block group-hover:text-purple-700">
                      Shipping Webhooks
                    </span>
                    <span className="text-[11px] text-brand-text-muted">
                      Configure Delhivery/BlueDart integration
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => navigate('/prelaunch/admin/coupons')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-brand-sand/60 hover:bg-brand-emerald-tint/50 transition-colors cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gold-tint flex items-center justify-center text-brand-gold-dark">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-text-display block group-hover:text-brand-gold-dark">
                      Coupons & Banners
                    </span>
                    <span className="text-[11px] text-brand-text-muted">
                      Create promotional harvest discount codes
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-gold-dark opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-sand/70 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
                Recent Orders
              </h3>
              <button
                onClick={() => navigate('/prelaunch/admin/orders')}
                className="text-xs text-brand-emerald hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-text-muted">
                No orders recorded in the system yet.
              </div>
            ) : (
              <div className="divide-y divide-brand-sand/60">
                {orders.map((ord) => (
                  <div key={ord._id || ord.orderNumber} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-emerald">
                          {ord.orderNumber || ord.orderId}
                        </span>
                        <span className="text-xs font-medium text-brand-text-display truncate">
                          · {ord.shippingAddress?.fullName || ord.customer?.fullName || 'Customer'}
                        </span>
                      </div>
                      <span className="text-[11px] text-brand-text-muted">
                        {ord.items?.length || 1} items · {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-brand-text-display block">
                        ₹{ord.total || ord.totalAmount}
                      </span>
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-emerald-tint text-brand-emerald">
                        {ord.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
