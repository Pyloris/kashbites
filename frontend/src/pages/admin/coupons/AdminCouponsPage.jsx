import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Trash2, X, Sparkles } from 'lucide-react';
import { adminApi } from '../../../services/admin.api.js';
import { AdminHeader } from '../components/AdminHeader.jsx';

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Coupon form
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrder, setMinOrder] = useState(499);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  // Offer form
  const [offerTitle, setOfferTitle] = useState('');
  const [offerSubtitle, setOfferSubtitle] = useState('');
  const [offerBadge, setOfferBadge] = useState('10% OFF CODE: KASHMIR10');
  const [offerCouponCode, setOfferCouponCode] = useState('KASHMIR10');
  const [offerDiscount, setOfferDiscount] = useState(10);

  const showNotice = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [coupRes, offRes] = await Promise.all([
        adminApi.getCoupons(),
        adminApi.getOffers(),
      ]);

      if (coupRes.success && Array.isArray(coupRes.data)) {
        setCoupons(coupRes.data);
      }
      if (offRes.success && Array.isArray(offRes.data)) {
        setOffers(offRes.data);
      }
    } catch (err) {
      console.error('Error loading coupon/offer data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApi.createCoupon({
        code: couponCode.trim().toUpperCase(),
        description: couponDesc.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrder),
        expiryDate,
        isActive: true,
      });

      if (res.success) {
        showNotice(`Coupon "${couponCode}" created`);
        setShowCouponModal(false);
        setCouponCode('');
        setCouponDesc('');
        loadData();
      } else {
        alert(res.message || 'Failed to create coupon');
      }
    } catch (err) {
      console.error('Coupon create error:', err);
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    const id = coupon._id || coupon.code;
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;

    try {
      const res = await adminApi.deleteCoupon(id);
      if (res.success) {
        showNotice(`Deleted coupon "${coupon.code}"`);
        loadData();
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApi.createOffer({
        title: offerTitle.trim(),
        subtitle: offerSubtitle.trim(),
        badgeText: offerBadge.trim(),
        discountPercentage: Number(offerDiscount),
        targetCategory: 'all',
        couponCode: offerCouponCode.trim().toUpperCase(),
        isActive: true,
      });

      if (res.success) {
        showNotice(`Promotional offer banner created`);
        setShowOfferModal(false);
        setOfferTitle('');
        setOfferSubtitle('');
        loadData();
      }
    } catch (err) {
      console.error('Offer create error:', err);
    }
  };

  const handleDeleteOffer = async (offer) => {
    const id = offer._id || offer.id;
    if (!window.confirm(`Delete offer "${offer.title}"?`)) return;

    try {
      const res = await adminApi.deleteOffer(id);
      if (res.success) {
        showNotice(`Deleted offer banner`);
        loadData();
      }
    } catch (err) {
      console.error('Delete offer error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Coupons & Promotional Banners"
        subtitle="Manage discount codes, minimum order rules and promotional storefront launches"
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOfferModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-sand bg-white hover:bg-brand-canvas text-xs font-medium text-brand-text-body transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
              <span>New Banner Offer</span>
            </button>

            <button
              onClick={() => setShowCouponModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-emerald hover:bg-brand-emerald-dark text-brand-gold text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-brand-emerald-tint border border-brand-emerald/30 text-xs text-brand-emerald font-semibold">
            {toastMessage}
          </div>
        )}

        {/* Coupons Section */}
        <div className="space-y-3">
          <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
            Active Discount Coupons ({coupons.length})
          </h3>

          <div className="bg-white rounded-2xl border border-brand-sand/70 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-canvas text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-sand/70">
                <tr>
                  <th className="py-3 px-4 font-bold">Promo Code</th>
                  <th className="py-3 px-4 font-bold">Benefit</th>
                  <th className="py-3 px-4 font-bold">Min Order</th>
                  <th className="py-3 px-4 font-bold">Expiry Date</th>
                  <th className="py-3 px-4 font-bold">Usage Count</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/60">
                {coupons.map((c) => (
                  <tr key={c._id || c.code} className="hover:bg-brand-canvas/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-emerald">
                      <span className="bg-brand-emerald-tint px-2 py-1 rounded-lg border border-brand-emerald/20">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-brand-text-display">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `Flat ₹${c.discountValue} OFF`}
                      <span className="text-[11px] text-brand-text-muted block">{c.description}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">₹{c.minOrderAmount || 0}</td>
                    <td className="py-3.5 px-4 text-brand-text-muted">{c.expiryDate || 'No Expiry'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">{c.usageCount || 0} used</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c)}
                        className="p-1.5 rounded-lg text-brand-text-subtle hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promotional Offers Section */}
        <div className="space-y-3">
          <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
            Storefront Banner Campaigns ({offers.length})
          </h3>

          <div className="bg-white rounded-2xl border border-brand-sand/70 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-canvas text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-sand/70">
                <tr>
                  <th className="py-3 px-4 font-bold">Campaign Title</th>
                  <th className="py-3 px-4 font-bold">Badge Text</th>
                  <th className="py-3 px-4 font-bold">Linked Coupon</th>
                  <th className="py-3 px-4 font-bold">Discount</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/60">
                {offers.map((o) => (
                  <tr key={o._id || o.id} className="hover:bg-brand-canvas/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-text-display block">{o.title}</span>
                      <span className="text-[11px] text-brand-text-muted">{o.subtitle}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-brand-gold-tint text-brand-gold-dark font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {o.badgeText}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-emerald">
                      {o.couponCode || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {o.discountPercentage ? `${o.discountPercentage}%` : 'Special'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteOffer(o)}
                        className="p-1.5 rounded-lg text-brand-text-subtle hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete offer banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-sand">
            <div className="flex items-center justify-between pb-3 border-b border-brand-sand">
              <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
                Create Discount Coupon
              </h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-brand-text-subtle hover:text-brand-text-display cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="pt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HARVEST25"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 25% off festive launch order"
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 rounded-xl border border-brand-sand text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-emerald text-brand-gold font-bold text-xs shadow-md cursor-pointer"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-sand">
            <div className="flex items-center justify-between pb-3 border-b border-brand-sand">
              <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
                Create Promotional Offer
              </h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-brand-text-subtle hover:text-brand-text-display cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="pt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Fresh Harvest Launch Special"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  required
                  placeholder="Free Air Courier on orders over ₹999"
                  value={offerSubtitle}
                  onChange={(e) => setOfferSubtitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    required
                    value={offerBadge}
                    onChange={(e) => setOfferBadge(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Linked Coupon
                  </label>
                  <input
                    type="text"
                    required
                    value={offerCouponCode}
                    onChange={(e) => setOfferCouponCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald uppercase font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 rounded-xl border border-brand-sand text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-emerald text-brand-gold font-bold text-xs shadow-md cursor-pointer"
                >
                  Create Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
