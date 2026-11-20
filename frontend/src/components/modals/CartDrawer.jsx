import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
export const CartDrawer = ({ onProceedToCheckout }) => {
    const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, discount, shippingFee, total, couponCode, applyCoupon, } = useCart();
    const [inputCoupon, setInputCoupon] = useState('');
    const [couponError, setCouponError] = useState(false);
    const [couponSuccess, setCouponSuccess] = useState(false);
    if (!isCartOpen)
        return null;
    const handleApply = (e) => {
        e.preventDefault();
        const success = applyCoupon(inputCoupon);
        if (success) {
            setCouponSuccess(true);
            setCouponError(false);
        }
        else {
            setCouponError(true);
            setCouponSuccess(false);
        }
    };
    const freeShippingThreshold = 999;
    const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
    const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
    return (<div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FCFAF5] h-full shadow-2xl flex flex-col justify-between text-[#1E2E21] border-l border-[#DFD5C3]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-[#103822] text-[#FAF7F2] flex items-center justify-between border-b-2 border-[#C59432]">
          <div className="flex items-center gap-2">
            <h3 className="font-serif-brand text-xl font-bold">Your Kashmiri Cart</h3>
            <span className="text-xs bg-[#1F5435] text-[#DFB248] px-2 py-0.5 rounded-full font-bold">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#FAF4E6] p-3 border-b border-[#E8DEC8] text-xs">
          {amountNeeded > 0 ? (<p className="text-[#645028] mb-1 font-medium">
              Add <strong className="font-mono text-[#0E331E]">₹{amountNeeded}</strong> more for <strong>FREE Air Express Delivery</strong>
            </p>) : (<p className="text-[#2D7A46] mb-1 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C59432]"/>
              🎉 Congratulations! You have unlocked FREE Air Express!
            </p>)}

          <div className="w-full bg-[#E5D7BE] h-2 rounded-full overflow-hidden">
            <div className="bg-[#C59432] h-full transition-all duration-300 rounded-full" style={{ width: `${progressToFreeShipping}%` }}></div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#EFE8DC]">
          {items.length === 0 ? (<div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#EAF2EC] flex items-center justify-center text-[#143E26] mb-4">
                <ShieldCheck className="w-8 h-8"/>
              </div>
              <h4 className="font-serif-brand text-lg font-bold text-[#0E331E] mb-1">
                Your cart is empty
              </h4>
              <p className="text-xs text-[#7A8E7F] max-w-xs mx-auto mb-6">
                Discover authentic Kagzi walnuts, Mamra almonds and royal emerald gift hampers.
              </p>
              <button onClick={() => setIsCartOpen(false)} className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#143E26] text-white hover:bg-[#0D2D1B]">
                Start Shopping
              </button>
            </div>) : (items.map((item) => (<div key={`${item.productId}-${item.weight}`} className="py-4 flex gap-3.5 items-start">
                <img src={item.image} alt={item.name} className="w-18 h-18 rounded-lg object-cover bg-white border border-[#E6DECF] shrink-0" referrerPolicy="no-referrer"/>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-serif-brand font-bold text-sm text-[#0E331E] line-clamp-1">
                      {item.name}
                    </h4>
                    <button onClick={() => removeFromCart(item.productId, item.weight)} className="text-[#9C8F7A] hover:text-red-600 transition-colors ml-2">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>

                  <span className="text-[11px] text-[#7A8E7F] block">
                    Pack Size: <strong className="text-[#143E26]">{item.weight}</strong>
                  </span>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#D5CABB] rounded bg-white">
                      <button onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)} className="px-2 py-0.5 text-xs text-[#143E26] hover:bg-[#FAF7F2]">
                        <Minus className="w-3 h-3"/>
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)} className="px-2 py-0.5 text-xs text-[#143E26] hover:bg-[#FAF7F2]">
                        <Plus className="w-3 h-3"/>
                      </button>
                    </div>

                    <span className="font-mono font-bold text-sm text-[#0E331E]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              </div>)))}
        </div>

        {/* Bottom Checkout & Totals Summary */}
        {items.length > 0 && (<div className="p-4 sm:p-5 bg-white border-t border-[#DFD5C3] space-y-3">
            
            {/* Promo Code Input */}
            <form onSubmit={handleApply} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-[#9C8F7A] absolute left-2.5 top-2.5"/>
                <input type="text" placeholder="Promo Code (Try: KASHMIR10)" value={inputCoupon} onChange={(e) => setInputCoupon(e.target.value)} className="w-full text-xs pl-8 pr-2 py-2 rounded-lg border border-[#D5CABB] uppercase font-mono tracking-wider outline-none focus:border-[#143E26]"/>
              </div>
              <button type="submit" className="px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#C59432] text-xs font-bold text-[#143E26] hover:bg-[#EFE7D8]">
                Apply
              </button>
            </form>

            {couponSuccess && (<p className="text-[11px] text-[#2D7A46] font-semibold">
                ✓ Coupon KASHMIR10 applied! You saved ₹{discount}
              </p>)}
            {couponError && (<p className="text-[11px] text-red-600 font-semibold">
                Invalid coupon. Try using code KASHMIR10
              </p>)}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#5C6E61] pt-1">
              <div className="flex justify-between">
                <span>Cart Subtotal</span>
                <span className="font-mono text-[#0E331E]">₹{subtotal}</span>
              </div>
              {discount > 0 && (<div className="flex justify-between text-[#2D7A46] font-semibold">
                  <span>Harvest Discount (10%)</span>
                  <span className="font-mono">-₹{discount}</span>
                </div>)}
              <div className="flex justify-between">
                <span>Air Express Shipping</span>
                <span className="font-mono">
                  {shippingFee === 0 ? <strong className="text-[#2D7A46]">FREE</strong> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#0E331E] pt-2 border-t border-[#EFE8DC]">
                <span>Total Amount</span>
                <span className="font-mono text-xl text-[#0E331E]">₹{total}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
            }} className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#143E26] hover:bg-[#0D2D1B] text-white flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98">
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#DFB248]"/>
            </button>

            <p className="text-[10px] text-center text-[#7A8E7F]">
              Cash on Delivery (COD) & UPI Supported · Cold-Packed in Srinagar
            </p>
          </div>)}

      </div>
    </div>);
};
