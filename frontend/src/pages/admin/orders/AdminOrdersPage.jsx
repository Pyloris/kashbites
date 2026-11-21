import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';
import { adminApi } from '../../../services/admin.api.js';
import { AdminHeader } from '../components/AdminHeader.jsx';

const STATUS_OPTIONS = [
  'Confirmed',
  'Srinagar Cold-Packing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Selected Order for Modal View
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);

  const showNotice = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await adminApi.getOrders();
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (order, newStatus) => {
    try {
      const orderId = order._id || order.orderNumber || order.orderId;
      const res = await adminApi.updateOrderStatus(orderId, newStatus, `Status updated via Admin Portal to ${newStatus}`);
      if (res.success) {
        showNotice(`Order ${order.orderNumber || order.orderId} updated to "${newStatus}"`);
        loadOrders();
      } else {
        alert(res.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Order status update error:', err);
    }
  };

  const handlePushWebhook = async (order) => {
    try {
      const orderId = order.orderNumber || order.orderId || order._id;
      const res = await adminApi.pushOrderWebhook(orderId);
      if (res.success) {
        showNotice(`Dispatched order ${orderId} to shipping carrier webhook`);
        loadOrders();
      } else {
        alert(res.message || 'Webhook push error');
      }
    } catch (err) {
      console.error('Push webhook error:', err);
    }
  };

  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason('Customer requested cancellation prior to cold-packing dispatch');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!orderToCancel) return;
    try {
      const orderId = orderToCancel._id || orderToCancel.orderNumber || orderToCancel.orderId;
      const res = await adminApi.cancelOrder(orderId, cancelReason);
      if (res.success) {
        showNotice(`Cancelled order ${orderToCancel.orderNumber || orderToCancel.orderId}`);
        setShowCancelModal(false);
        loadOrders();
      }
    } catch (err) {
      console.error('Cancel order error:', err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const num = o.orderNumber || o.orderId || '';
    const name = o.shippingAddress?.fullName || o.customer?.fullName || '';
    const matchSearch =
      !search ||
      num.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      selectedStatus === 'All' ||
      o.orderStatus?.toLowerCase() === selectedStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Orders & Cold-Chain Fulfillment"
        subtitle={`Tracking ${orders.length} farm-to-table customer shipments`}
        onRefresh={loadOrders}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-brand-emerald-tint border border-brand-emerald/30 text-xs text-brand-emerald font-semibold">
            {toastMessage}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-brand-sand/70 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-brand-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # or customer..."
              className="w-full text-xs pl-10 pr-3.5 py-2 rounded-xl border border-brand-sand bg-white text-brand-text-display placeholder:text-brand-text-subtle focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', ...STATUS_OPTIONS].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-brand-emerald text-brand-gold font-bold shadow-xs'
                    : 'bg-brand-canvas text-brand-text-body hover:bg-brand-sand/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-brand-sand/70 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-canvas text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-sand/70">
                <tr>
                  <th className="py-3 px-4 font-bold">Order #</th>
                  <th className="py-3 px-4 font-bold">Customer & City</th>
                  <th className="py-3 px-4 font-bold">Items & Harvest</th>
                  <th className="py-3 px-4 font-bold">Total / Payment</th>
                  <th className="py-3 px-4 font-bold">Order Status</th>
                  <th className="py-3 px-4 font-bold text-right">Carrier / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-brand-text-muted">
                      No customer orders match the chosen filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const orderNum = ord.orderNumber || ord.orderId;
                    const custName = ord.shippingAddress?.fullName || ord.customer?.fullName || 'Customer';
                    const custCity = ord.shippingAddress?.city || ord.customer?.city || 'India';
                    const totalAmt = ord.total || ord.totalAmount || 0;

                    return (
                      <tr key={ord._id || orderNum} className="hover:bg-brand-canvas/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-emerald">
                          {orderNum}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-brand-text-display block truncate max-w-[160px]">
                            {custName}
                          </span>
                          <span className="text-[11px] text-brand-text-muted">{custCity}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 max-w-xs">
                            {ord.items?.map((it, idx) => (
                              <div key={idx} className="text-[11px] text-brand-text-body truncate">
                                {it.quantity}x {it.name} ({it.weight})
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-brand-text-display block">
                            ₹{totalAmt}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-canvas border border-brand-sand text-brand-text-muted font-medium">
                            {ord.paymentMethod} · {ord.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleStatusChange(ord, e.target.value)}
                            className="text-xs py-1 px-2.5 rounded-lg border border-brand-sand bg-white font-medium text-brand-text-display focus:outline-none focus:border-brand-emerald"
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => handlePushWebhook(ord)}
                            className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-emerald hover:bg-brand-emerald-tint transition-colors cursor-pointer"
                            title="Push manifest to shipping carrier"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-emerald hover:bg-brand-emerald-tint transition-colors cursor-pointer"
                            title="View order details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {ord.orderStatus !== 'Cancelled' && (
                            <button
                              onClick={() => openCancelModal(ord)}
                              className="p-1.5 rounded-lg text-brand-text-subtle hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Cancel order"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-sand max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-sand">
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
                  Order Details · {selectedOrder.orderNumber || selectedOrder.orderId}
                </h3>
                <span className="text-xs text-brand-text-muted">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-brand-text-subtle hover:text-brand-text-display cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-4 space-y-4 text-xs">
              {/* Delivery Address */}
              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-sand">
                <span className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Recipient & Delivery Address
                </span>
                <p className="font-bold text-brand-text-display">
                  {selectedOrder.shippingAddress?.fullName || selectedOrder.customer?.fullName}
                </p>
                <p className="text-brand-text-body mt-0.5">
                  {selectedOrder.shippingAddress?.addressLine1 || selectedOrder.customer?.address}
                </p>
                <p className="text-brand-text-body">
                  {selectedOrder.shippingAddress?.city || selectedOrder.customer?.city},{' '}
                  {selectedOrder.shippingAddress?.state || selectedOrder.customer?.state} -{' '}
                  {selectedOrder.shippingAddress?.pincode || selectedOrder.customer?.pincode}
                </p>
                <p className="text-brand-text-muted mt-1 font-mono">
                  Phone: {selectedOrder.shippingAddress?.phone || selectedOrder.customer?.phone}
                </p>
              </div>

              {/* Items List */}
              <div>
                <span className="font-bold text-brand-emerald uppercase tracking-wider block mb-2">
                  Items in Shipment
                </span>
                <div className="divide-y divide-brand-sand border border-brand-sand rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-brand-text-display block">
                          {it.name}
                        </span>
                        <span className="text-[11px] text-brand-text-muted">
                          {it.weight} · Qty: {it.quantity}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-brand-emerald">
                        ₹{it.price * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-brand-sand text-right font-medium">
                <div className="flex justify-between text-brand-text-muted">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{selectedOrder.subtotal || selectedOrder.total}</span>
                </div>
                <div className="flex justify-between text-brand-text-muted">
                  <span>Air Shipping:</span>
                  <span className="font-mono">
                    {selectedOrder.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.shippingFee || 0}`}
                  </span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-brand-emerald">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-brand-text-display border-t border-brand-sand pt-1.5">
                  <span>Total Paid/Collectable:</span>
                  <span className="font-mono text-brand-emerald">
                    ₹{selectedOrder.total || selectedOrder.totalAmount}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-brand-emerald text-brand-gold font-bold text-xs cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && orderToCancel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-sand">
            <h3 className="font-serif-brand text-lg font-bold text-red-600 mb-1 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Cancel Order {orderToCancel.orderNumber || orderToCancel.orderId}</span>
            </h3>
            <p className="text-xs text-brand-text-muted mb-4">
              Cancelling will update order status and halt automated cold-chain logistics dispatch.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Cancellation Reason
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl border border-brand-sand text-xs font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
