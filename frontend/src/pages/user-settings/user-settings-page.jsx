import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  AccountTab,
  AlertsTab,
  SecurityTab,
  AddressesTab,
} from './components/index.js';
import { Tabs, Button, SectionHeader } from '../../components/ui/index.js';
import {
  User as UserIcon,
  Shield,
  Bell,
  MapPin,
} from 'lucide-react';

export const UserSettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, deleteAddress, setDefaultAddress } = useAuth();

  const [activeTab, setActiveTab] = useState('account');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  const [notifications, setNotifications] = useState({
    smsAlerts: user?.notifications?.smsAlerts ?? true,
    whatsappAlerts: user?.notifications?.whatsappAlerts ?? true,
    harvestNewsletter: user?.notifications?.harvestNewsletter ?? true,
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-emerald-tint flex items-center justify-center text-brand-emerald mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="font-serif-brand text-2xl font-bold text-brand-text-display mb-2">
          Sign In Required
        </h2>
        <p className="text-xs text-brand-text-muted mb-6">
          Please sign in to manage your account settings, addresses, and delivery preferences.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/prelaunch')}>
          Return to Storefront
        </Button>
      </div>
    );
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const success = await updateProfile({ name, phone, notifications });
    if (success) {
      setProfileSuccessMsg('Settings saved successfully.');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account Profile', icon: UserIcon },
    { id: 'notifications', label: 'Alerts & Communications', icon: Bell },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'addresses', label: 'Addresses Book', count: user.addresses?.length || 0, icon: MapPin },
  ];

  return (
    <div className="bg-brand-canvas min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-brand-sand gap-4">
          <div>
            <SectionHeader
              eyebrow="Account Management"
              title="User Settings & Preferences"
              subtitle="Manage your personal details, courier delivery alerts, and security settings."
              align="left"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate('/prelaunch/profile')}>
            View Order History
          </Button>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

        {activeTab === 'account' && (
          <AccountTab
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            email={user.email}
            profileSuccessMsg={profileSuccessMsg}
            onSubmit={handleProfileSubmit}
          />
        )}

        {activeTab === 'notifications' && (
          <AlertsTab
            notifications={notifications}
            setNotifications={setNotifications}
            profileSuccessMsg={profileSuccessMsg}
            onSubmit={handleProfileSubmit}
          />
        )}

        {activeTab === 'security' && <SecurityTab />}

        {activeTab === 'addresses' && (
          <AddressesTab
            addresses={user.addresses || []}
            onSetDefaultAddress={setDefaultAddress}
            onDeleteAddress={deleteAddress}
          />
        )}
      </div>
    </div>
  );
};

export default UserSettingsPage;
