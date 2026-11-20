import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { fetchOrders } from '../services/api.js';
import { IOrder, IUserAddress, ICartItem } from '../types/index.js';
import {
  User as UserIcon,
  MapPin,
  Package,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface UserProfilePageProps {
  onBackToShop: () => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onBackToShop,
  onTrackOrder,
}) => {
  const { user, updateProfile, addAddress, deleteAddress, setDefaultAddress, logout } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'rewards'>('profile');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notifications, setNotifications] = useState({
    smsAlerts: user?.notifications?.smsAlerts ?? true,
    whatsappAlerts: user?.notifications?.whatsappAlerts ?? true,
    harvestNewsletter: user?.notifications?.harvestNewsletter ?? true,
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Add Address Form State
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<IUserAddress>>({
    label: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    pincode: '190001',
    isDefault: false,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchOrders().then((data: IOrder[]) => {
      setOrders(data);
      setIsOrdersLoading(false);
    });
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EAF2EC] flex items-center justify-center text-[#143E26] mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="font-serif-brand text-2xl font-bold text-[#0E331E] mb-2">
          Please Sign In
        </h2>
        <p className="text-xs text-[#526356] mb-6">
          You must be logged in to view your profile, addresses, and harvest orders.
        </p>
        <button
          onClick={onBackToShop}
          className="px-6 py-2.5 bg-[#143E26] text-white rounded-xl text-xs font-bold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({ name, phone, notifications });
    if (success) {
      setProfileSuccessMsg('Your profile has been saved successfully.');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) {
      alert('Please fill out all address fields');
      return;
    }
    const success = await addAddress(newAddress);
    if (success) {
      setShowAddAddressForm(false);
      setNewAddress({
        label: 'Home',
        fullName: user.name,
        phone: user.phone,
        addressLine1: '',
        addressLine2: '',
        city: 'Srinagar',
        state: 'Jammu & Kashmir',
        pincode: '',
        isDefault: false,
      });
    }
  };

  const handleReorder = (order: IOrder) => {
    order.items.forEach((item: ICartItem) => {
      addToCart(
        {
          _id: item.productId,
          name: item.name,
          slug: item.slug,
          category: 'walnuts',
          tagline: '',
          description: '',
          price: item.price,
          originalPrice: item.price * 1.25,
          rating: 5,
          reviewCount: 1,
          images: [item.image],
          netWeights: [{ weight: item.weight, price: item.price, inStock: true }],
          nutrition: {} as any,
          certificate: {} as any,
          packagingVideo: {} as any,
          badges: [],
          featured: false,
          isCombo: false,
          inStock: true,
        },
        item.weight,
        item.quantity
      );
    });
    setIsCartOpen(true);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Hero Header Card */}
        <div className="bg-[#0E2E1C] text-[#FAF7F2] rounded-2xl p-6 sm:p-8 border-2 border-[#C59432]/40 shadow-xl mb-8 relative overflow-hidden">
          {/* Subtle gold background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#DFB248_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            
            {/* User Avatar & Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#17462B] border-2 border-[#DFB248] flex items-center justify-center font-serif-brand text-2xl sm:text-3xl font-bold text-[#DFB248] shadow-inner shrink-0">
                {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-white">
                    {user.name}
                  </h1>
                  <span className="text-[10px] bg-[#C59432] text-[#0A2416] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {user.memberTier}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#CBD8D0] mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#DFB248]" />
                    {user.email}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#DFB248]" />
                    {user.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Loyalty Points Strip & Logout */}
            <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#1B4B30] pt-4 sm:pt-0">
              <div className="bg-[#143B25] p-3 rounded-xl border border-[#2D6340] text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#DFB248] block">
                  Chinar Reward Points
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-white">
                  {user.chinarPoints} pts
                </span>
                <span className="text-[10px] text-[#A2B5A8] block">
                  Worth ₹{user.chinarPoints} off orders
                </span>
              </div>

              <button
                onClick={() => {
                  logout();
                  onBackToShop();
                }}
                className="p-2.5 rounded-xl bg-[#143B25] hover:bg-red-950/60 text-[#CBD8D0] hover:text-red-200 border border-[#2D6340] hover:border-red-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>

          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8DEC8] pb-4 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#143E26] text-white shadow-xs'
                : 'bg-white text-[#4A5D4F] border border-[#E0D7C6] hover:bg-[#FAF4E6]'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'bg-[#143E26] text-white shadow-xs'
                : 'bg-white text-[#4A5D4F] border border-[#E0D7C6] hover:bg-[#FAF4E6]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
            <span className="bg-[#DFB248] text-[#0A2416] px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {user.addresses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#143E26] text-white shadow-xs'
                : 'bg-white text-[#4A5D4F] border border-[#E0D7C6] hover:bg-[#FAF4E6]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders & History</span>
            <span className="bg-[#DFB248] text-[#0A2416] px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rewards'
                ? 'bg-[#143E26] text-white shadow-xs'
                : 'bg-white text-[#4A5D4F] border border-[#E0D7C6] hover:bg-[#FAF4E6]'
            }`}
          >
            <Award className="w-4 h-4 text-[#C59432]" />
            <span>Chinar Rewards</span>
          </button>
        </div>

        {/* Tab 1: Edit Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6DECF] shadow-xs max-w-2xl">
            <h3 className="font-serif-brand text-xl font-bold text-[#0E331E] mb-1">
              Personal Information
            </h3>
            <p className="text-xs text-[#526356] mb-6">
              Update your account credentials and direct farm harvest alert preferences.
            </p>

            {profileSuccessMsg && (
              <div className="mb-6 p-3 rounded-xl bg-[#EAF2EC] border border-[#2D7A46]/30 text-[#2D7A46] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3C4E41] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3C4E41] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs p-3 rounded-xl border border-[#E5DECF] bg-[#F5EFE6] text-[#6E7F72] cursor-not-allowed"
                />
                <span className="text-[10px] text-[#8C9C90] mt-1 block">
                  Email is locked to your verified account identity.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3C4E41] mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                />
              </div>

              {/* Notification Toggles */}
              <div className="pt-4 border-t border-[#EFE8DC] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3C4E41] block">
                  Delivery & Harvest Notifications
                </span>

                <label className="flex items-center gap-3 cursor-pointer text-xs text-[#2D4032]">
                  <input
                    type="checkbox"
                    checked={notifications.smsAlerts}
                    onChange={(e) =>
                      setNotifications({ ...notifications, smsAlerts: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#143E26] focus:ring-0"
                  />
                  <span>SMS updates on dispatch and out-for-delivery status</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs text-[#2D4032]">
                  <input
                    type="checkbox"
                    checked={notifications.whatsappAlerts}
                    onChange={(e) =>
                      setNotifications({ ...notifications, whatsappAlerts: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#143E26] focus:ring-0"
                  />
                  <span>WhatsApp direct air-courier tracking link alerts</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs text-[#2D4032]">
                  <input
                    type="checkbox"
                    checked={notifications.harvestNewsletter}
                    onChange={(e) =>
                      setNotifications({ ...notifications, harvestNewsletter: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#143E26] focus:ring-0"
                  />
                  <span>Early bird notices when autumn walnuts and Mamra almonds arrive in Srinagar</span>
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#143E26] hover:bg-[#0D2D1B] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Saved Shipping Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-brand text-2xl font-bold text-[#0E331E]">
                  Saved Shipping Addresses
                </h3>
                <p className="text-xs text-[#526356]">
                  Manage delivery addresses for seamless 1-click checkout.
                </p>
              </div>

              <button
                onClick={() => setShowAddAddressForm(true)}
                className="px-4 py-2.5 bg-[#143E26] hover:bg-[#0D2D1B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 text-[#DFB248]" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Add Address Form Modal / Inline Box */}
            {showAddAddressForm && (
              <form
                onSubmit={handleAddAddressSubmit}
                className="p-6 bg-white rounded-2xl border-2 border-[#C59432] shadow-md space-y-4 max-w-2xl"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DC]">
                  <h4 className="font-serif-brand text-lg font-bold text-[#0E331E]">
                    Add New Delivery Address
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddAddressForm(false)}
                    className="text-xs text-[#8C9C90] hover:text-[#0E331E]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#4F6354] font-medium mb-1">Address Label</label>
                    <select
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#D5CABB] bg-white outline-none"
                    >
                      <option value="Home">Home</option>
                      <option value="Work / Office">Work / Office</option>
                      <option value="Farm / Orchard">Farm / Orchard</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#4F6354] font-medium mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#4F6354] font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#4F6354] font-medium mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="House / Flat No, Landmark, Road"
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#4F6354] font-medium mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#4F6354] font-medium mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 190001"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#3C4E41] cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded text-[#143E26]"
                  />
                  <span>Make this my default shipping address for checkout</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#143E26] hover:bg-[#0D2D1B] text-white rounded-xl text-xs font-bold"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAddressForm(false)}
                    className="px-4 py-2.5 bg-[#FAF7F2] border border-[#D5CABB] text-xs font-semibold rounded-xl text-[#526356]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((addr: IUserAddress) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-2xl bg-white border transition-all ${
                    addr.isDefault ? 'border-[#143E26] ring-2 ring-[#143E26]/20' : 'border-[#E6DECF]'
                  } flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#143E26] bg-[#EAF2EC] px-2 py-0.5 rounded">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[11px] font-bold text-[#2D7A46] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Default Address
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-[#0E331E]">{addr.fullName}</h4>
                    <p className="text-xs text-[#526356] mt-1">
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                    </p>
                    <p className="text-xs text-[#526356]">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-xs text-[#8C9C90] mt-1">Phone: {addr.phone}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#EFE8DC] text-xs">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[#143E26] font-semibold hover:underline"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[#8C9C90] text-[11px]">Primary Destination</span>
                    )}

                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: My Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif-brand text-2xl font-bold text-[#0E331E]">
                Your Harvest Orders
              </h3>
              <p className="text-xs text-[#526356]">
                Review past shipments, track air courier status, and reorder favourite batches.
              </p>
            </div>

            {isOrdersLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-44 rounded-2xl bg-[#EBE4D5] animate-pulse"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DEC8]">
                <Package className="w-12 h-12 text-[#9C8F7A] mx-auto mb-3" />
                <h4 className="font-serif-brand text-xl font-bold text-[#0E331E] mb-1">
                  No orders yet
                </h4>
                <p className="text-xs text-[#7A8E7F] max-w-xs mx-auto mb-4">
                  Discover authentic Kagzi walnuts, Mamra almonds and royal gift hampers.
                </p>
                <button
                  onClick={onBackToShop}
                  className="px-5 py-2.5 bg-[#143E26] text-white rounded-xl text-xs font-bold"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.orderNumber}
                    className="p-5 sm:p-6 bg-white rounded-2xl border border-[#E6DECF] shadow-xs flex flex-col justify-between"
                  >
                    {/* Order Head Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE8DC] text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#143E26]">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[#8C9C90]">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EAF2EC] text-[#2D7A46] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {ord.orderStatus}
                        </span>
                        <span className="font-mono font-bold text-sm text-[#0E331E]">
                          ₹{ord.total}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Previews */}
                    <div className="py-4 space-y-3">
                      {ord.items.map((it: ICartItem, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={it.image}
                              alt={it.name}
                              className="w-12 h-12 rounded-lg object-cover border border-[#E6DECF]"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-serif-brand font-bold text-sm text-[#0E331E] block">
                                {it.name}
                              </span>
                              <span className="text-[#7A8E7F]">
                                Pack Size: {it.weight} · Qty: {it.quantity}
                              </span>
                            </div>
                          </div>

                          <span className="font-mono font-bold text-[#0E331E]">
                            ₹{it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[#EFE8DC] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-[#526356]">
                        Delivering to: <strong className="text-[#0E331E]">{ord.shippingAddress.fullName}</strong> ({ord.shippingAddress.city} - {ord.shippingAddress.pincode})
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onTrackOrder(ord.orderNumber)}
                          className="px-3.5 py-1.5 rounded-lg border border-[#143E26] text-[#143E26] font-bold hover:bg-[#EAF2EC] transition-colors flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Parcel</span>
                        </button>

                        <button
                          onClick={() => handleReorder(ord)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#143E26] hover:bg-[#0D2D1B] text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder All</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Chinar Rewards & Club */}
        {activeTab === 'rewards' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6DECF] shadow-xs max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[#FAF0D6] border border-[#DFB248]">
                <Award className="w-8 h-8 text-[#9E6D0E]" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#C59432]">
                  Loyalty Programme
                </span>
                <h3 className="font-serif-brand text-2xl font-bold text-[#0E331E]">
                  Chinar Harvest Club
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#4E6153] leading-relaxed mb-6">
              As a valued patron of KashBites, every order directly supports generational Kashmiri farming families and earns you Chinar Points that never expire.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8]">
                <span className="text-xs font-semibold text-[#7A8E7F] block">Your Balance</span>
                <span className="font-mono text-2xl font-bold text-[#143E26]">{user.chinarPoints}</span>
                <span className="text-[11px] text-[#526356] block mt-0.5">Points available</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8]">
                <span className="text-xs font-semibold text-[#7A8E7F] block">Reward Value</span>
                <span className="font-mono text-2xl font-bold text-[#C59432]">₹{user.chinarPoints}</span>
                <span className="text-[11px] text-[#526356] block mt-0.5">Instant checkout credit</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8]">
                <span className="text-xs font-semibold text-[#7A8E7F] block">Tier Level</span>
                <span className="font-serif-brand text-xl font-bold text-[#0E331E]">{user.memberTier}</span>
                <span className="text-[11px] text-[#2D7A46] font-semibold block mt-0.5">Active Member</span>
              </div>
            </div>

            <div className="border-t border-[#EFE8DC] pt-6">
              <h4 className="font-serif-brand text-base font-bold text-[#0E331E] mb-3">
                Member Privileges
              </h4>
              <ul className="space-y-2.5 text-xs text-[#526356]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D7A46]" />
                  <span>Complimentary Priority Air Courier on all hampers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D7A46]" />
                  <span>Early harvest allocation: First pick of fresh Autumn 2026 walnuts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D7A46]" />
                  <span>Direct lab authenticity certificates mailed with your orders</span>
                </li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
