import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSubmitOrderMutation } from '../../services/orders.api.js';
import { Modal, Input, Button, Badge } from '../ui/index.js';
import { CheckCircle2, ShieldCheck, Truck, CreditCard, Banknote, QrCode } from 'lucide-react';

export const CheckoutModal = ({ isOpen, onClose, onOrderSuccess }) => {
  const { items, subtotal, discount, shippingFee, total, couponCode, clearCart } = useCart();
  const { user } = useAuth();
  const [submitOrderMutation] = useSubmitOrderMutation();
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    pincode: '190001',
  });

  useEffect(() => {
    if (user && user.addresses?.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (defaultAddr) {
        setAddress({
          fullName: defaultAddr.fullName,
          phone: defaultAddr.phone,
          addressLine1: defaultAddr.addressLine1,
          addressLine2: defaultAddr.addressLine2,
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode,
        });
      }
    } else if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: user.name,
        phone: user.phone,
      }));
    }
  }, [user, isOpen]);

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.pincode) {
      alert('Please fill out all required address fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const order = await submitOrderMutation({
        items,
        shippingAddress: address,
        paymentMethod,
        couponCode,
      }).unwrap();
      if (order) {
        setCompletedOrder(order);
        clearCart();
        onOrderSuccess(order);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={completedOrder ? 'Order Confirmed!' : 'Express Checkout · Direct from Srinagar'}
      subtitle={completedOrder ? `Order #${completedOrder.orderNumber}` : 'Hand-harvested in Kashmir, cold-packed & air-couriered'}
    >
      {completedOrder ? (
        <div className="text-center py-4 space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <Badge variant={completedOrder.paymentMethod === 'COD' ? 'gold' : 'origin'} className="mb-2">
              Payment {completedOrder.paymentMethod === 'COD' ? 'Pending on Delivery' : 'Received'}
            </Badge>
            <h4 className="font-serif-brand text-2xl font-bold text-brand-text-display mt-1">
              Thank you, {completedOrder.shippingAddress.fullName}!
            </h4>
            <p className="text-xs text-brand-text-muted mt-1">
              Your order <strong className="font-mono text-brand-emerald text-sm">{completedOrder.orderNumber}</strong> has been assigned to our Srinagar Cold-Packing facility.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-sand text-left text-xs space-y-3">
            <div className="flex justify-between pb-3 border-b border-brand-sand-subtle">
              <div>
                <span className="text-brand-text-subtle block">Delivery Destination:</span>
                <strong className="text-brand-emerald">
                  {completedOrder.shippingAddress.addressLine1}, {completedOrder.shippingAddress.city} - {completedOrder.shippingAddress.pincode}
                </strong>
                <span className="text-brand-text-subtle block mt-0.5">Contact: {completedOrder.shippingAddress.phone}</span>
              </div>
              <div className="text-right">
                <span className="text-brand-text-subtle block">Payment Method:</span>
                <strong className="text-brand-emerald uppercase">{completedOrder.paymentMethod}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-brand-text-display block">Items in Parcel:</span>
              {completedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-brand-text-body">
                  <span>{it.quantity}x {it.name} ({it.weight})</span>
                  <span className="font-mono font-semibold">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-brand-sand-subtle flex justify-between text-sm font-bold text-brand-text-display">
              <span>Total Payable:</span>
              <span className="font-mono text-base text-brand-emerald">₹{completedOrder.total}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-brand-gold-tint border border-brand-gold/30 text-xs text-brand-gold-dark flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-gold shrink-0" />
            <span>Estimated Air Express Delivery: <strong>3-4 business days</strong> with live SMS updates.</span>
          </div>

          <Button variant="primary" size="lg" className="w-full" onClick={onClose}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h4 className="font-serif-brand text-lg font-bold text-brand-text-display mb-3 flex items-center gap-2">
              <span>1. Delivery Address</span>
              <span className="text-xs font-sans text-brand-text-subtle font-normal">(Across all India pincodes)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <Input
                label="Full Name *"
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              />

              <Input
                label="Phone Number *"
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Flat / House No. / Street Address *"
                  type="text"
                  required
                  placeholder="House/Apartment, Street name, Locality"
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                />
              </div>

              <Input
                label="City / Town *"
                type="text"
                required
                placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />

              <Input
                label="PIN Code *"
                type="text"
                required
                placeholder="e.g. 110001"
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              />
            </div>
          </div>

          <div>
            <h4 className="font-serif-brand text-lg font-bold text-brand-text-display mb-3">
              2. Select Payment Method
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'border-brand-emerald bg-brand-emerald-tint ring-1 ring-brand-emerald'
                    : 'border-brand-sand bg-white hover:bg-brand-canvas'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-brand-emerald">
                  <Banknote className="w-5 h-5 text-brand-emerald" />
                  <span className="font-bold text-xs">Cash on Delivery</span>
                </div>
                <span className="text-[11px] text-brand-text-muted">
                  Pay cash or UPI upon package inspection.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'border-brand-emerald bg-brand-emerald-tint ring-1 ring-brand-emerald'
                    : 'border-brand-sand bg-white hover:bg-brand-canvas'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-brand-emerald">
                  <QrCode className="w-5 h-5 text-brand-gold" />
                  <span className="font-bold text-xs">Instant UPI</span>
                </div>
                <span className="text-[11px] text-brand-text-muted">
                  GPay, PhonePe, Paytm, QR.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'border-brand-emerald bg-brand-emerald-tint ring-1 ring-brand-emerald'
                    : 'border-brand-sand bg-white hover:bg-brand-canvas'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-brand-emerald">
                  <CreditCard className="w-5 h-5 text-brand-emerald" />
                  <span className="font-bold text-xs">Card / NetBanking</span>
                </div>
                <span className="text-[11px] text-brand-text-muted">
                  Visa, Mastercard, RuPay.
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-gold-tint border border-brand-sand text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-brand-text-muted">Items in Shipment:</span>
              <span className="font-bold text-brand-text-display">{items.length} items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-text-muted">Subtotal:</span>
              <span className="font-mono text-brand-text-display">₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-brand-emerald font-semibold">
                <span>Discount:</span>
                <span className="font-mono">-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-brand-text-muted">Air Express Shipping:</span>
              <span className="font-mono text-brand-emerald font-bold">
                {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
              </span>
            </div>
            <div className="pt-2 border-t border-brand-sand flex justify-between items-center text-sm font-bold text-brand-text-display">
              <span>Total Amount:</span>
              <span className="font-mono text-base text-brand-emerald">₹{total}</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isSubmitting || items.length === 0}
            loading={isSubmitting}
            leftIcon={<ShieldCheck className="w-4 h-4 text-brand-gold" />}
          >
            Confirm Order · ₹{total}
          </Button>
        </form>
      )}
    </Modal>
  );
};

export default CheckoutModal;
