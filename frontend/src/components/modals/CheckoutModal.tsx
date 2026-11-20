import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { submitOrder } from '../../services/api.js';
import { IOrder, IShippingAddress } from '../../types/index.js';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Banknote, QrCode, MapPin } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: IOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, discount, shippingFee, total, couponCode, clearCart } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState<IShippingAddress>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    pincode: '190001',
  });

  useEffect(() => {
    if (user && user.addresses.length > 0) {
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

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'CARD'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<IOrder | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.pincode) {
      alert('Please fill out all required address fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await submitOrder({
        items,
        shippingAddress: address,
        paymentMethod,
        couponCode,
      });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FCFAF5] rounded-2xl shadow-2xl border-2 border-[#C59432]/40 overflow-hidden text-[#1E2E21] max-h-[90vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="bg-[#103822] text-[#FAF7F2] p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#C59432] shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-serif-brand text-xl font-bold">
              {completedOrder ? 'Order Confirmed!' : 'Express Checkout · Direct from Srinagar'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {completedOrder ? (
            /* Order Success Receipt */
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#EAF2EC] flex items-center justify-center text-[#2D7A46]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#C59432]">
                  Payment {completedOrder.paymentMethod === 'COD' ? 'Pending on Delivery' : 'Received'}
                </span>
                <h4 className="font-serif-brand text-2xl font-bold text-[#0E331E] mt-1">
                  Thank you, {completedOrder.shippingAddress.fullName}!
                </h4>
                <p className="text-xs text-[#526356] mt-1">
                  Your order <strong className="font-mono text-[#143E26] text-sm">{completedOrder.orderNumber}</strong> has been assigned to our Srinagar Cold-Packing facility.
                </p>
              </div>

              {/* Order Receipt Box */}
              <div className="bg-white p-5 rounded-xl border border-[#E6DECF] text-left text-xs space-y-3">
                <div className="flex justify-between pb-3 border-b border-[#EFE8DC]">
                  <div>
                    <span className="text-[#8C9C90] block">Delivery Destination:</span>
                    <strong className="text-[#143E26]">
                      {completedOrder.shippingAddress.addressLine1}, {completedOrder.shippingAddress.city} - {completedOrder.shippingAddress.pincode}
                    </strong>
                    <span className="text-[#8C9C90] block mt-0.5">Contact: {completedOrder.shippingAddress.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#8C9C90] block">Payment Method:</span>
                    <strong className="text-[#143E26] uppercase">{completedOrder.paymentMethod}</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-[#0E331E] block">Items in Parcel:</span>
                  {completedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[#4F6354]">
                      <span>{it.quantity}x {it.name} ({it.weight})</span>
                      <span className="font-mono font-semibold">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#EFE8DC] flex justify-between text-sm font-bold text-[#0E331E]">
                  <span>Total Payable:</span>
                  <span className="font-mono text-base">₹{completedOrder.total}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF4E6] border border-[#E5D7BE] text-xs text-[#7A612A] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C59432] shrink-0" />
                <span>Estimated Air Express Delivery: <strong>3-4 business days</strong> with live SMS updates.</span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-[#143E26] hover:bg-[#0D2D1B] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Delivery Address Section */}
              <div>
                <h4 className="font-serif-brand text-lg font-bold text-[#0E331E] mb-3 flex items-center gap-2">
                  <span>1. Delivery Address</span>
                  <span className="text-xs font-sans text-[#8C9C90] font-normal">(Across all India pincodes)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#526356] font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#526356] font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#526356] font-medium mb-1">Flat / House No. / Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="House/Apartment, Street name, Locality"
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#526356] font-medium mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#526356] font-medium mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 110001"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <h4 className="font-serif-brand text-lg font-bold text-[#0E331E] mb-3">
                  2. Select Payment Method
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[#143E26] bg-[#EAF2EC] ring-1 ring-[#143E26]'
                        : 'border-[#E6DECF] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 text-[#143E26]">
                      <Banknote className="w-5 h-5 text-[#2D7A46]" />
                      <span className="font-bold text-xs">Cash on Delivery</span>
                    </div>
                    <span className="text-[11px] text-[#526356]">
                      Pay cash or UPI upon package inspection.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-[#143E26] bg-[#EAF2EC] ring-1 ring-[#143E26]'
                        : 'border-[#E6DECF] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 text-[#143E26]">
                      <QrCode className="w-5 h-5 text-[#C59432]" />
                      <span className="font-bold text-xs">Instant UPI</span>
                    </div>
                    <span className="text-[11px] text-[#526356]">
                      GPay, PhonePe, Paytm, QR.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-[#143E26] bg-[#EAF2EC] ring-1 ring-[#143E26]'
                        : 'border-[#E6DECF] bg-white hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 text-[#143E26]">
                      <CreditCard className="w-5 h-5 text-[#143E26]" />
                      <span className="font-bold text-xs">Card / NetBanking</span>
                    </div>
                    <span className="text-[11px] text-[#526356]">
                      Visa, Mastercard, RuPay.
                    </span>
                  </button>
                </div>
              </div>

              {/* Order Summary Confirmation */}
              <div className="p-4 rounded-xl bg-[#FAF4E6] border border-[#E5D7BE] text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#645028]">Items in Shipment:</span>
                  <span className="font-bold text-[#0E331E]">{items.length} items</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#645028]">Subtotal:</span>
                  <span className="font-mono text-[#0E331E]">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center mb-1 text-[#2D7A46]">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#645028]">Air Express Shipping:</span>
                  <span className="font-mono text-[#2D7A46] font-bold">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#DFD0B5] flex justify-between items-center text-sm font-bold text-[#0E331E]">
                  <span>Total Amount:</span>
                  <span className="font-mono text-base text-[#143E26]">₹{total}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-3.5 bg-[#143E26] hover:bg-[#0D2D1B] disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing Your Kashmiri Harvest Order...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#DFB248]" />
                    <span>Confirm Order · ₹{total}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
