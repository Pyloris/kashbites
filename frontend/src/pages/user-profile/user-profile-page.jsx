import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetOrdersQuery } from '../../services/orders.api.js';
import {
  ProfileDetailsCard,
  OrdersHistoryCard,
  AddressBookCard,
  PrivilegeBadgePanel,
} from './components/index.js';
import { Tabs, Button } from '../../components/ui/index.js';
import {
  User as UserIcon,
  Package,
  MapPin,
  LogOut,
} from 'lucide-react';

export const UserProfilePage = ({ onBackToShop, onTrackOrder }) => {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const handleBackToShop = onBackToShop || outletContext.onBackToShop || (() => navigate('/'));
  const handleTrackOrder = onTrackOrder || outletContext.openTracking || (() => {});

  const { user, updateProfile, addAddress, deleteAddress, setDefaultAddress, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: orders = [], isLoading: isOrdersLoading } = useGetOrdersQuery();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notifications, setNotifications] = useState({
    smsAlerts: user?.notifications?.smsAlerts ?? true,
    whatsappAlerts: user?.notifications?.whatsappAlerts ?? true,
    harvestNewsletter: user?.notifications?.harvestNewsletter ?? true,
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-emerald-tint flex items-center justify-center text-brand-emerald mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="font-serif-brand text-2xl font-bold text-brand-text-display mb-2">
          Please Sign In
        </h2>
        <p className="text-xs text-brand-text-muted mb-6">
          You must be logged in to view your profile, addresses, and harvest orders.
        </p>
        <Button variant="primary" size="md" onClick={handleBackToShop}>
          Return to Shop
        </Button>
      </div>
    );
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const success = await updateProfile({ name, phone, notifications });
    if (success) {
      setProfileSuccessMsg('Your profile has been saved successfully.');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    }
  };

  const tabItems = [
    { id: 'profile', label: 'Personal Details', icon: UserIcon },
    { id: 'orders', label: 'Order History & Tracking', count: orders.length, icon: Package },
    { id: 'addresses', label: 'Saved Delivery Addresses', count: user.addresses?.length || 0, icon: MapPin },
  ];

  return (
    <div className="bg-brand-canvas min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-brand-sand gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-gold">
              Kashmir Harvest Privilege Member
            </span>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-brand-text-display">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-brand-text-muted mt-0.5">
              Manage your Valley deliveries, address book, and pure harvest pedigree.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleBackToShop}>
              Continue Shopping
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Tabs
            tabs={tabItems}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />
        </div>

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <ProfileDetailsCard
              user={user}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              notifications={notifications}
              setNotifications={setNotifications}
              profileSuccessMsg={profileSuccessMsg}
              onSubmit={handleProfileSubmit}
            />
            <PrivilegeBadgePanel />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="mt-8">
            <OrdersHistoryCard
              orders={orders}
              isLoading={isOrdersLoading}
              onTrackOrder={handleTrackOrder}
              onBackToShop={handleBackToShop}
            />
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="mt-8">
            <AddressBookCard
              user={user}
              onAddAddress={addAddress}
              onDeleteAddress={deleteAddress}
              onSetDefaultAddress={setDefaultAddress}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
