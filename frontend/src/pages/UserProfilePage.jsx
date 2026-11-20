import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useGetOrdersQuery } from '../services/orders.api.js';
import { User as UserIcon, MapPin, Package, Award, Plus, Trash2, CheckCircle2, LogOut, Phone, Mail, Truck, RotateCcw, } from 'lucide-react';

export const UserProfilePage = ({ onBackToShop, onTrackOrder, }) => {
    const navigate = useNavigate();
    const outletContext = useOutletContext() || {};
    const handleBackToShop = onBackToShop || outletContext.onBackToShop || (() => navigate('/'));
    const handleTrackOrder = onTrackOrder || outletContext.openTracking || (() => {});

    const { user, updateProfile, addAddress, deleteAddress, setDefaultAddress, logout } = useAuth();
    const { addToCart, setIsCartOpen } = useCart();
    const [activeTab, setActiveTab] = useState('profile');

    const { data: orders = [], isLoading: isOrdersLoading } = useGetOrdersQuery();

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
    const [newAddress, setNewAddress] = useState({
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
    }, []);
    if (!user) {
        return (<div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EAF2EC] flex items-center justify-center text-[#143E26] mb-4">
          <UserIcon className="w-8 h-8"/>
        </div>
        <h2 className="font-serif-brand text-2xl font-bold text-[#0E331E] mb-2">
          Please Sign In
        </h2>
        <p className="text-xs text-[#526356] mb-6">
          You must be logged in to view your profile, addresses, and harvest orders.
        </p>
        <button onClick={handleBackToShop} className="px-6 py-2.5 bg-[#143E26] text-white rounded-xl text-xs font-bold">
          Return to Shop
        </button>
      </div>);
    }
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const success = await updateProfile({ name, phone, notifications });
        if (success) {
            setProfileSuccessMsg('Your profile has been saved successfully.');
            setTimeout(() => setProfileSuccessMsg(''), 3000);
        }
    };
    const handleAddAddressSubmit = async (e) => {
        e.preventDefault();
        if (!newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) {
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
                pincode: '190001',
                isDefault: false,
            });
        }
    };
    return (<div className="bg-[#FAF7F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-[#E8DEC8] gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#C59432]">
              Kashmir Harvest Privilege Member
            </span>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#0E331E]">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-[#526356] mt-0.5">
              Manage your Valley deliveries, address book, and pure harvest pedigree.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleBackToShop} className="px-4 py-2 border border-[#143E26] text-[#143E26] rounded-xl text-xs font-bold hover:bg-[#143E26]/5 transition-colors">
              Continue Shopping
            </button>
            <button onClick={logout} className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
              <LogOut className="w-3.5 h-3.5"/>
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8DEC8] mt-6 gap-2 overflow-x-auto">
          <button onClick={() => setActiveTab('profile')} className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === 'profile'
            ? 'border-[#143E26] text-[#143E26]'
            : 'border-transparent text-[#526356] hover:text-[#0E331E]'}`}>
            <UserIcon className="w-4 h-4"/>
            Personal Details
          </button>
          <button onClick={() => setActiveTab('orders')} className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === 'orders'
            ? 'border-[#143E26] text-[#143E26]'
            : 'border-transparent text-[#526356] hover:text-[#0E331E]'}`}>
            <Package className="w-4 h-4"/>
            Order History & Tracking ({orders.length})
          </button>
          <button onClick={() => setActiveTab('addresses')} className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === 'addresses'
            ? 'border-[#143E26] text-[#143E26]'
            : 'border-transparent text-[#526356] hover:text-[#0E331E]'}`}>
            <MapPin className="w-4 h-4"/>
            Saved Delivery Addresses ({user.addresses.length})
          </button>
        </div>

        {/* Tab 1: Profile & Communications */}
        {activeTab === 'profile' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DEC8] shadow-2xs">
              <h3 className="font-serif-brand text-lg font-bold text-[#0E331E] mb-4">
                Personal Profile Information
              </h3>

              {profileSuccessMsg && (<div className="mb-6 p-3 bg-[#EAF2EC] border border-[#143E26]/20 text-[#143E26] text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#143E26]"/>
                  {profileSuccessMsg}
                </div>)}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#526356] block mb-1">
                    Full Name
                  </label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full text-xs p-3 rounded-xl border border-[#E8DEC8] bg-[#FAF7F2] focus:outline-none focus:border-[#143E26]"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#526356] block mb-1">
                      Email Address (Permanent Account ID)
                    </label>
                    <input type="email" disabled value={user.email} className="w-full text-xs p-3 rounded-xl border border-[#E8DEC8] bg-gray-100 text-[#8B988E] cursor-not-allowed"/>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#526356] block mb-1">
                      Phone Number (For Air Courier Updates)
                    </label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full text-xs p-3 rounded-xl border border-[#E8DEC8] bg-[#FAF7F2] focus:outline-none focus:border-[#143E26]"/>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8DEC8]">
                  <h4 className="text-xs font-bold text-[#143E26] uppercase tracking-wider mb-3">
                    Notification & Dispatch Alerts
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-xs text-[#526356] cursor-pointer">
                      <input type="checkbox" checked={notifications.smsAlerts} onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })} className="rounded text-[#143E26] focus:ring-[#143E26]"/>
                      Receive SMS airway bill dispatch & out-for-delivery alerts
                    </label>
                    <label className="flex items-center gap-3 text-xs text-[#526356] cursor-pointer">
                      <input type="checkbox" checked={notifications.whatsappAlerts} onChange={(e) => setNotifications({ ...notifications, whatsappAlerts: e.target.checked })} className="rounded text-[#143E26] focus:ring-[#143E26]"/>
                      Receive WhatsApp nitrogen-pouch packaging video & courier tracking
                    </label>
                    <label className="flex items-center gap-3 text-xs text-[#526356] cursor-pointer">
                      <input type="checkbox" checked={notifications.harvestNewsletter} onChange={(e) => setNotifications({ ...notifications, harvestNewsletter: e.target.checked })} className="rounded text-[#143E26] focus:ring-[#143E26]"/>
                      Exclusive harvest reservation newsletters (First-bloom saffron & Mamra almonds)
                    </label>
                  </div>
                </div>

                <button type="submit" className="px-6 py-2.5 bg-[#143E26] hover:bg-[#0E331E] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs">
                  Save Changes
                </button>
              </form>
            </div>

            {/* Privilege Badge Panel */}
            <div className="bg-[#103822] text-[#FAF7F2] p-6 sm:p-8 rounded-2xl border-2 border-[#C59432] space-y-4 flex flex-col justify-between shadow-md">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#DFB248]/20 flex items-center justify-center text-[#DFB248] mb-3">
                  <Award className="w-6 h-6"/>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#DFB248] block">
                  Kashmir Provenance Direct
                </span>
                <h4 className="font-serif-brand text-xl font-bold text-[#FCFAF5] mt-1">
                  Single-Origin Patron
                </h4>
                <p className="text-xs text-[#C2D4C6] mt-2 leading-relaxed">
                  Your orders directly support orchard artisan families across Shopian, Pulwama, and Pampore.
                </p>
              </div>

              <div className="pt-4 border-t border-[#DFB248]/30 space-y-2 text-xs text-[#E1EBE3]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#DFB248]"/>
                  <span>Priority SXR Air Cargo Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#DFB248]"/>
                  <span>Free Nitrogen Seal Re-Verification</span>
                </div>
              </div>
            </div>
          </div>)}

        {/* Tab 2: Orders & Tracking */}
        {activeTab === 'orders' && (<div className="mt-8 space-y-4">
            {isOrdersLoading ? (<div className="text-center py-16 bg-white rounded-2xl border border-[#E8DEC8]">
                <div className="w-8 h-8 mx-auto rounded-full border-2 border-[#143E26] border-t-transparent animate-spin mb-3"></div>
                <p className="text-xs text-[#526356]">
                  Retrieving your harvest orders from database...
                </p>
              </div>) : orders.length === 0 ? (<div className="text-center py-16 bg-white rounded-2xl border border-[#E8DEC8]">
                <Package className="w-12 h-12 text-[#8B988E] mx-auto mb-3"/>
                <h4 className="font-serif-brand text-lg font-bold text-[#0E331E]">
                  No harvest orders yet
                </h4>
                <p className="text-xs text-[#526356] mt-1 mb-4">
                  Taste the purest single-origin walnuts, almonds, and saffron from Srinagar.
                </p>
                <button onClick={handleBackToShop} className="px-5 py-2.5 bg-[#143E26] text-white rounded-xl text-xs font-bold">
                  Explore Fresh 2026 Harvest
                </button>
              </div>) : (orders.map((order) => (<div key={order.orderNumber} className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] space-y-4 shadow-2xs">
                  {/* Order Top Meta */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[#E8DEC8] gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif-brand font-bold text-sm text-[#0E331E]">
                          Order #{order.orderNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.orderStatus === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.orderStatus === 'Shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8B988E]">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => handleTrackOrder(order.orderNumber)} className="px-3 py-1.5 bg-[#143E26] hover:bg-[#0E331E] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                        <Truck className="w-3.5 h-3.5"/>
                        Track Air Transit
                      </button>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (<div key={idx} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-[#E8DEC8]"/>
                          <div>
                            <span className="font-bold text-[#143E26] block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[#8B988E]">
                              {item.weight} × {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-[#143E26]">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>))}
                  </div>

                  {/* Order Footer Totals */}
                  <div className="pt-3 border-t border-[#E8DEC8] flex items-center justify-between text-xs text-[#526356]">
                    <div>
                      <span>Payment: </span>
                      <strong className="text-[#143E26]">{order.paymentMethod} ({order.paymentStatus})</strong>
                      {order.trackingNumber && (<span className="ml-3 text-[11px] text-[#C59432]">
                          AWB: {order.trackingNumber} ({order.courierName})
                        </span>)}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px]">Total Paid: </span>
                      <span className="font-bold text-sm text-[#143E26]">
                        ₹{order.total}
                      </span>
                    </div>
                  </div>
                </div>)))}
          </div>)}

        {/* Tab 3: Saved Delivery Addresses */}
        {activeTab === 'addresses' && (<div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-[#0E331E]">
                  Saved Shipping Addresses
                </h3>
                <p className="text-xs text-[#526356]">
                  Air-courier delivery destinations for your Kashmir packages.
                </p>
              </div>

              {!showAddAddressForm && (<button onClick={() => setShowAddAddressForm(true)} className="px-4 py-2 bg-[#143E26] hover:bg-[#0E331E] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Plus className="w-4 h-4"/>
                  Add New Address
                </button>)}
            </div>

            {/* Add Address Form Accordion */}
            {showAddAddressForm && (<form onSubmit={handleAddAddressSubmit} className="p-6 bg-white rounded-2xl border-2 border-[#143E26] space-y-4 max-w-xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif-brand text-base font-bold text-[#143E26]">
                    Add Delivery Address
                  </h4>
                  <button type="button" onClick={() => setShowAddAddressForm(false)} className="text-xs text-[#8B988E] hover:text-black">
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#526356] block mb-1">
                      Label
                    </label>
                    <select value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]">
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#526356] block mb-1">
                      Full Name
                    </label>
                    <input type="text" required value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"/>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#526356] block mb-1">
                    Contact Phone (For Courier Dispatch)
                  </label>
                  <input type="text" required value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"/>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#526356] block mb-1">
                    Address Line 1 (House/Flat, Street)
                  </label>
                  <input type="text" required value={newAddress.addressLine1} onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })} className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"/>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#526356] block mb-1">
                    Address Line 2 (Apartment, Landmark)
                  </label>
                  <input type="text" value={newAddress.addressLine2} onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })} className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"/>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#526356] block mb-1">
                      City
                    </label>
                    <input type="text" required value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"/>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#526356] block mb-1">
                      State
                    </label>
                    <input type="text" required value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"/>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#526356] block mb-1">
                      Pincode
                    </label>
                    <input type="text" required value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"/>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-[#526356] cursor-pointer">
                    <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} className="rounded text-[#143E26] focus:ring-[#143E26]"/>
                    Set as my primary delivery address
                  </label>

                  <button type="submit" className="px-5 py-2 bg-[#143E26] text-white rounded-xl text-xs font-bold hover:bg-[#0E331E]">
                    Save Address
                  </button>
                </div>
              </form>)}

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (<div key={addr.id} className={`p-5 rounded-2xl border transition-all ${addr.isDefault
                ? 'bg-white border-[#143E26] shadow-sm'
                : 'bg-white border-[#E8DEC8]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#143E26] uppercase tracking-wider bg-[#F2ECE1] px-2.5 py-0.5 rounded-md">
                      {addr.label}
                    </span>
                    {addr.isDefault ? (<span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3"/> Default Destination
                      </span>) : (<button onClick={() => setDefaultAddress(addr.id)} className="text-[11px] text-[#C59432] hover:underline font-semibold cursor-pointer">
                        Set as Default
                      </button>)}
                  </div>

                  <p className="font-bold text-sm text-[#0E331E]">
                    {addr.fullName}
                  </p>
                  <p className="text-xs text-[#526356] mt-1">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                  </p>
                  <p className="text-xs text-[#526356]">
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>
                  <p className="text-xs text-[#8B988E] mt-2 flex items-center gap-1">
                    <Phone className="w-3 h-3"/> {addr.phone}
                  </p>

                  <div className="pt-3 mt-3 border-t border-[#E8DEC8] flex justify-end">
                    <button onClick={() => deleteAddress(addr.id)} className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5"/> Delete
                    </button>
                  </div>
                </div>))}
            </div>
          </div>)}
      </div>
    </div>);
};
