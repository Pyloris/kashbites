import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { Drawer, Button, QuantityStepper, PriceTag } from '../ui/index.js';
import { ShoppingBag, ArrowRight, Trash2, ShieldCheck, Tag } from 'lucide-react';

export const CartDrawer = ({ onProceedToCheckout }) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode,
    applyCoupon,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    openCartCheckout,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setInputCoupon('');
    }
  };

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      title="Your Harvest Box"
      subtitle="Direct from Kashmir Valley Orchards"
      footer={
        items.length > 0 && (
          <div className="space-y-4 w-full">
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-brand-gold absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Promo code (e.g. KASHMIR10)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-sand bg-white uppercase placeholder:normal-case focus:outline-none focus:border-brand-emerald"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Apply
              </Button>
            </form>

            {couponError && (
              <span className="text-[11px] text-red-600 block">{couponError}</span>
            )}
            {couponCode && (
              <span className="text-[11px] text-brand-emerald font-semibold flex items-center gap-1">
                Coupon "{couponCode}" applied successfully!
              </span>
            )}

            <div className="space-y-2 text-xs border-t border-brand-sand pt-3">
              <div className="flex justify-between text-brand-text-muted">
                <span>Subtotal:</span>
                <span className="font-mono text-brand-text-display">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-brand-emerald font-medium">
                  <span>Harvest Privilege Discount:</span>
                  <span className="font-mono">-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between text-brand-text-muted">
                <span>Air Express Shipping:</span>
                <span className="font-mono text-brand-emerald font-semibold">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-brand-text-display border-t border-brand-sand pt-2">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-brand-emerald">₹{total}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                if (openCartCheckout) {
                  openCartCheckout();
                } else {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }
                onProceedToCheckout?.();
              }}
              rightIcon={<ArrowRight className="w-4 h-4 text-brand-gold" />}
            >
              Proceed to Checkout · ₹{total}
            </Button>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-serif-brand text-xl font-bold text-brand-text-display">
              Your Harvest Box is Empty
            </h4>
            <p className="text-xs text-brand-text-muted mt-1 max-w-xs">
              Explore our freshly cracked walnuts, sweet Mamra almonds, and saffron collections.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsCartOpen(false)}>
            Browse Harvest Collections
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-brand-sand">
          {items.map((item) => (
            <div key={`${item.productId}-${item.weight}`} className="py-4 flex gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl border border-brand-sand shrink-0"
              />

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-serif-brand text-sm font-bold text-brand-text-display leading-tight">
                      {item.name}
                    </h5>
                    <button
                      onClick={() => removeFromCart(item.productId, item.weight)}
                      className="text-brand-text-subtle hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[11px] text-brand-gold-dark font-medium block mt-0.5">
                    Sealed {item.weight} Pouch
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(q) => updateQuantity(item.productId, item.weight, q)}
                    size="sm"
                  />
                  <span className="font-mono text-xs font-bold text-brand-emerald">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;
