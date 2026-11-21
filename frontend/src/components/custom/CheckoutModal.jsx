import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  useSubmitOrderMutation,
  useInitiateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useCancelTemporaryOrderMutation,
} from '../../services/orders.api.js';
import { appConfig } from '../../config/app-config.js';
import { Modal, Input, Button, Badge, Alert } from '../ui/index.js';
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  QrCode,
  Lock,
  RotateCcw,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const CheckoutModal = ({ isOpen, onClose, onOrderSuccess }) => {
  const {
    checkoutSource,
    checkoutItems,
    checkoutSubtotal,
    checkoutDiscount,
    checkoutShippingFee,
    checkoutTotal,
    couponCode,
    handleCheckoutSuccess,
    closeCheckout,
  } = useCart();

  const { user } = useAuth();

  const [submitOrderMutation] = useSubmitOrderMutation();
  const [initiateRazorpayOrder] = useInitiateRazorpayOrderMutation();
  const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();
  const [cancelTemporaryOrder] = useCancelTemporaryOrderMutation();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    pincode: '190001',
  });

  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // Default to Razorpay Online
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Sync user profile & default addresses when opened or auth changes
  useEffect(() => {
    if (user && user.addresses?.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setAddress({
        fullName: user.name || defaultAddr.fullName || '',
        email: user.email || '',
        phone: user.phone || defaultAddr.phone || '',
        addressLine1: defaultAddr.addressLine1 || '',
        addressLine2: defaultAddr.addressLine2 || '',
        city: defaultAddr.city || 'Srinagar',
        state: defaultAddr.state || 'Jammu & Kashmir',
        pincode: defaultAddr.pincode || '190001',
      });
    } else if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user, isOpen]);

  // Reset transient messages on modal toggle
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setNoticeMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModalClose = () => {
    setCompletedOrder(null);
    setErrorMessage('');
    setNoticeMessage('');
    closeCheckout();
    if (onClose) onClose();
  };

  const validateForm = () => {
    if (!address.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!address.email.trim() || !address.email.includes('@') || !address.email.includes('.')) {
      setErrorMessage('Please enter a valid email address for order updates.');
      return false;
    }
    const cleanPhone = address.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!address.addressLine1.trim()) {
      setErrorMessage('Please enter your flat / street delivery address.');
      return false;
    }
    if (!address.city.trim()) {
      setErrorMessage('Please enter your city / town.');
      return false;
    }
    const cleanPincode = address.pincode.replace(/[^0-9]/g, '');
    if (cleanPincode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setNoticeMessage('');

    if (!validateForm()) return;

    if (!checkoutItems || checkoutItems.length === 0) {
      setErrorMessage('Your checkout parcel is empty. Please select a product first.');
      return;
    }

    setIsSubmitting(true);

    // ==========================================
    // 1. CASH ON DELIVERY (COD) FLOW
    // ==========================================
    if (paymentMethod === 'COD') {
      try {
        const order = await submitOrderMutation({
          items: checkoutItems,
          shippingAddress: address,
          paymentMethod: 'COD',
          couponCode,
          source: checkoutSource,
        }).unwrap();

        if (order) {
          setCompletedOrder(order);
          handleCheckoutSuccess(order);
          if (onOrderSuccess) onOrderSuccess(order);
        }
      } catch (err) {
        console.error('COD order creation failed:', err);
        setErrorMessage(err?.data?.message || err?.message || 'Failed to place COD order. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ==========================================
    // 2. ONLINE PAYMENT FLOW (RAZORPAY)
    // ==========================================
    try {
      // Step A: Initiate Razorpay order on backend (creates temporary order session)
      const initRes = await initiateRazorpayOrder({
        items: checkoutItems,
        shippingAddress: address,
        couponCode,
        source: checkoutSource,
      }).unwrap();

      const rzpData = initRes?.data || initRes;
      if (!rzpData || !rzpData.razorpayOrderId) {
        throw new Error('Backend failed to issue Razorpay order ID.');
      }

      const { temporaryOrderId, razorpayOrderId, amount, currency, keyId } = rzpData;

      // Step B: Ensure Razorpay SDK script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout SDK failed to load. Please check your network connection.');
      }

      // Step C: Launch Razorpay standard checkout dialog
      const options = {
        key: keyId || appConfig.razorpay.keyId,
        amount,
        currency: currency || 'INR',
        name: 'KashBites',
        description:
          checkoutSource === 'buy_now'
            ? `Buy Now · ${checkoutItems[0]?.name || 'Direct Harvest'}`
            : `KashBites Order · ${checkoutItems.length} Harvest Products`,
        image: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg',
        order_id: razorpayOrderId,
        prefill: {
          name: address.fullName,
          email: address.email,
          contact: address.phone,
        },
        notes: {
          temporaryOrderId,
          checkoutSource,
        },
        theme: {
          color: '#0f382c', // Royal Kashmiri emerald brand color
        },
        handler: async function (response) {
          setIsSubmitting(true);
          try {
            // Step D: Server-side cryptographic signature verification
            const verifyRes = await verifyRazorpayPayment({
              temporaryOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).unwrap();

            const confirmedOrder = verifyRes?.order || verifyRes?.data?.order || verifyRes;
            setCompletedOrder(confirmedOrder);
            handleCheckoutSuccess(confirmedOrder);
            if (onOrderSuccess) onOrderSuccess(confirmedOrder);
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            setErrorMessage(
              verifyErr?.data?.message ||
                verifyErr?.message ||
                'Payment verification failed. If your account was debited, your order will automatically confirm within a few minutes.'
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: async function () {
            setIsSubmitting(false);
            setNoticeMessage('Payment checkout was dismissed. Your selected parcel remains saved; you can retry anytime.');
            try {
              await cancelTemporaryOrder({
                temporaryOrderId,
                reason: 'Customer closed Razorpay popup',
              }).unwrap();
            } catch {
              // Non-blocking cleanup notification
            }
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (failResp) {
        setIsSubmitting(false);
        const reason = failResp?.error?.description || failResp?.error?.reason || 'Payment was declined by the bank.';
        setErrorMessage(`Payment Unsuccessful: ${reason}. Please retry or choose another payment method.`);
      });

      rzpInstance.open();
    } catch (err) {
      console.error('Razorpay checkout initiation error:', err);
      setErrorMessage(err?.data?.message || err?.message || 'Failed to initialize online payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      maxWidth="max-w-2xl"
      title={completedOrder ? 'Order Confirmed!' : 'Express Checkout · Direct from Srinagar'}
      subtitle={
        completedOrder
          ? `Order #${completedOrder.orderNumber}`
          : checkoutSource === 'buy_now'
          ? 'Instant Single-Product Checkout (Cart Preserved)'
          : 'Hand-harvested in Kashmir, cold-packed & air-couriered'
      }
    >
      {completedOrder ? (
        <div className="text-center py-4 space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-emerald-tint flex items-center justify-center text-brand-emerald animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <Badge
              variant={completedOrder.paymentStatus === 'Paid' ? 'origin' : 'gold'}
              className="mb-2"
            >
              {completedOrder.paymentStatus === 'Paid'
                ? 'Payment Verified via Razorpay (Paid)'
                : 'Payment Pending on Delivery (COD)'}
            </Badge>
            <h4 className="font-serif-brand text-2xl font-bold text-brand-text-display mt-1">
              Thank you, {completedOrder.shippingAddress?.fullName || 'Customer'}!
            </h4>
            <p className="text-xs text-brand-text-muted mt-1">
              Your order <strong className="font-mono text-brand-emerald text-sm">{completedOrder.orderNumber}</strong> has
              been scheduled for Srinagar cold-packing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-sand text-left text-xs space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-brand-sand-subtle gap-2">
              <div>
                <span className="text-brand-text-subtle block font-semibold">Delivery Destination:</span>
                <strong className="text-brand-emerald block">
                  {completedOrder.shippingAddress?.addressLine1}, {completedOrder.shippingAddress?.city} -{' '}
                  {completedOrder.shippingAddress?.pincode}
                </strong>
                <span className="text-brand-text-subtle block mt-0.5">
                  Contact: {completedOrder.shippingAddress?.phone} · {completedOrder.shippingAddress?.email}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-brand-text-subtle block font-semibold">Payment Method:</span>
                <strong className="text-brand-emerald uppercase">
                  {completedOrder.paymentMethod === 'ONLINE' ? 'Razorpay (Online)' : completedOrder.paymentMethod}
                </strong>
                <span className="text-[11px] block text-brand-text-muted">
                  Status: {completedOrder.paymentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-brand-text-display block">Items in Parcel:</span>
              {(completedOrder.items || []).map((it, idx) => (
                <div key={idx} className="flex justify-between text-brand-text-body">
                  <span>
                    {it.quantity}x {it.name} ({it.weight})
                  </span>
                  <span className="font-mono font-semibold">₹{Number(it.price) * Number(it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-brand-sand-subtle flex justify-between text-sm font-bold text-brand-text-display">
              <span>Total Amount:</span>
              <span className="font-mono text-base text-brand-emerald">₹{completedOrder.total}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-brand-gold-tint border border-brand-gold/30 text-xs text-brand-gold-dark flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-gold shrink-0" />
            <span>
              Estimated Air Express Delivery: <strong>3-4 business days</strong> with live SMS updates.
            </span>
          </div>

          <Button variant="primary" size="lg" className="w-full" onClick={handleModalClose}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Notifications and Alerts */}
          {errorMessage && (
            <Alert variant="danger" title="Checkout Error" message={errorMessage} onClose={() => setErrorMessage('')} />
          )}
          {noticeMessage && (
            <Alert variant="warning" title="Notice" message={noticeMessage} onClose={() => setNoticeMessage('')} />
          )}

          {/* Section 1: Customer & Address Information */}
          <div>
            <h4 className="font-serif-brand text-lg font-bold text-brand-text-display mb-3 flex items-center gap-2">
              <span>1. Customer & Delivery Address</span>
              <span className="text-xs font-sans text-brand-text-subtle font-normal">
                (Guest checkout enabled · No password needed)
              </span>
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
                label="Phone Number (for SMS & tracking updates) *"
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Email Address (for invoice & digital receipt) *"
                  type="email"
                  required
                  placeholder="e.g. rahul.sharma@example.com"
                  value={address.email}
                  onChange={(e) => setAddress({ ...address, email: e.target.value })}
                />
              </div>

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

              <div className="sm:col-span-2">
                <Input
                  label="Apartment, Suite, Landmark (Optional)"
                  type="text"
                  placeholder="e.g. Near Dal Gate, Behind Police Station"
                  value={address.addressLine2}
                  onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                />
              </div>

              <Input
                label="City / Town *"
                type="text"
                required
                placeholder="e.g. New Delhi, Mumbai, Srinagar"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />

              <Input
                label="State *"
                type="text"
                required
                placeholder="e.g. Jammu & Kashmir, Delhi, Maharashtra"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />

              <div className="sm:col-span-2">
                <Input
                  label="6-Digit PIN Code *"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 190001"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method Selection */}
          <div>
            <h4 className="font-serif-brand text-lg font-bold text-brand-text-display mb-3 flex items-center justify-between">
              <span>2. Select Payment Method</span>
              <span className="text-xs text-brand-text-subtle font-normal flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-brand-gold" /> 256-bit Secure
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Online Payment (Razorpay) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                  paymentMethod === 'ONLINE'
                    ? 'border-brand-emerald bg-brand-emerald-tint ring-2 ring-brand-emerald shadow-xs'
                    : 'border-brand-sand bg-white hover:bg-brand-canvas'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-brand-emerald">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-emerald" />
                    <span className="font-bold text-xs text-brand-text-display">Online Payment (Razorpay)</span>
                  </div>
                  <span className="text-[10px] bg-brand-gold/20 text-brand-gold-dark font-bold px-1.5 py-0.5 rounded">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-brand-text-muted leading-relaxed">
                  UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, NetBanking & Wallets.
                </p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-brand-sand-subtle text-[10px] text-brand-emerald font-semibold">
                  <QrCode className="w-3.5 h-3.5" /> Instant UPI QR · Zero Processing Fee
                </div>
              </button>

              {/* Cash on Delivery (COD) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'border-brand-emerald bg-brand-emerald-tint ring-2 ring-brand-emerald shadow-xs'
                    : 'border-brand-sand bg-white hover:bg-brand-canvas'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 text-brand-emerald">
                  <Banknote className="w-5 h-5 text-brand-emerald" />
                  <span className="font-bold text-xs text-brand-text-display">Cash on Delivery (COD)</span>
                </div>
                <p className="text-[11px] text-brand-text-muted leading-relaxed">
                  Inspect the Kashmiri authenticity seal before paying cash or UPI to the courier.
                </p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-brand-sand-subtle text-[10px] text-brand-text-muted">
                  <Truck className="w-3.5 h-3.5 text-brand-gold" /> Standard verification at delivery
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Order Summary */}
          <div className="p-4 rounded-xl bg-brand-gold-tint border border-brand-sand text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-brand-sand-subtle">
              <span className="font-bold text-brand-text-display">
                {checkoutSource === 'buy_now' ? 'Buy Now Item:' : 'Cart Items in Shipment:'}
              </span>
              <span className="text-brand-text-muted font-medium">
                {checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-brand-text-body text-[11px]">
                  <span>
                    {item.quantity}x {item.name} ({item.weight})
                  </span>
                  <span className="font-mono font-medium">₹{Number(item.price) * Number(item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-brand-sand space-y-1.5">
              <div className="flex justify-between items-center text-brand-text-muted">
                <span>Subtotal:</span>
                <span className="font-mono text-brand-text-display">₹{checkoutSubtotal}</span>
              </div>

              {checkoutDiscount > 0 && (
                <div className="flex justify-between items-center text-brand-emerald font-semibold">
                  <span>Harvest Privilege Discount {couponCode ? `(${couponCode})` : ''}:</span>
                  <span className="font-mono">-₹{checkoutDiscount}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-brand-text-muted">
                <span>Air Express Shipping:</span>
                <span className="font-mono text-brand-emerald font-bold">
                  {checkoutShippingFee === 0 ? 'FREE' : `₹${checkoutShippingFee}`}
                </span>
              </div>

              <div className="pt-2 border-t border-brand-sand flex justify-between items-center text-sm font-bold text-brand-text-display">
                <span>Total Payable:</span>
                <span className="font-mono text-base text-brand-emerald">₹{checkoutTotal}</span>
              </div>
            </div>
          </div>

          {/* Submission Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full text-sm font-bold shadow-md cursor-pointer"
            disabled={isSubmitting || checkoutItems.length === 0}
            loading={isSubmitting}
            leftIcon={
              paymentMethod === 'ONLINE' ? (
                <Lock className="w-4 h-4 text-brand-gold" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
              )
            }
          >
            {isSubmitting
              ? 'Processing Secure Checkout...'
              : paymentMethod === 'ONLINE'
              ? `Pay Now via Razorpay · ₹${checkoutTotal}`
              : `Confirm Cash on Delivery · ₹${checkoutTotal}`}
          </Button>

          <p className="text-[11px] text-center text-brand-text-muted">
            100% Himalayan Authenticity Guarantee · Direct Air Courier from Srinagar, Kashmir
          </p>
        </form>
      )}
    </Modal>
  );
};

export default CheckoutModal;
