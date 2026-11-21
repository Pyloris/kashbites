import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '../../../components/ui/index.js';
import { Plus, CheckCircle2, Phone, Trash2 } from 'lucide-react';

export const AddressBookCard = ({
  user,
  onAddAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) return;
    const success = await onAddAddress(newAddress);
    if (success) {
      setShowAddForm(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
            Saved Shipping Addresses
          </h3>
          <p className="text-xs text-brand-text-muted">
            Air-courier delivery destinations for your Kashmir packages.
          </p>
        </div>

        {!showAddForm && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Address
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="border-2 border-brand-emerald space-y-4 max-w-xl">
          <div className="flex items-center justify-between pb-3 border-b border-brand-sand">
            <h4 className="font-serif-brand text-base font-bold text-brand-emerald">
              Add Delivery Address
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-brand-text-subtle hover:text-brand-text-display cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-brand-text-muted block mb-1">
                  Label
                </label>
                <select
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-brand-sand bg-brand-canvas focus:outline-none focus:border-brand-emerald"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <Input
                label="Full Name"
                type="text"
                required
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
              />
            </div>

            <Input
              label="Contact Phone"
              type="tel"
              required
              value={newAddress.phone}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
            />

            <Input
              label="Address Line 1"
              type="text"
              required
              value={newAddress.addressLine1}
              onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
            />

            <Input
              label="Address Line 2"
              type="text"
              value={newAddress.addressLine2}
              onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              />
              <Input
                label="State"
                type="text"
                required
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
              />
              <Input
                label="Pincode"
                type="text"
                required
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-brand-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, isDefault: e.target.checked })
                  }
                  className="rounded text-brand-emerald focus:ring-brand-emerald"
                />
                Set as default destination
              </label>

              <Button type="submit" variant="primary" size="sm">
                Save Address
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user.addresses?.map((addr) => (
          <Card
            key={addr.id}
            className={`p-5 ${
              addr.isDefault ? 'border-brand-emerald ring-1 ring-brand-emerald' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="neutral" size="sm">
                {addr.label}
              </Badge>
              {addr.isDefault ? (
                <Badge variant="origin" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Primary Destination
                </Badge>
              ) : (
                <button
                  onClick={() => onSetDefaultAddress(addr.id)}
                  className="text-[11px] text-brand-gold hover:underline font-semibold cursor-pointer"
                >
                  Set as Default
                </button>
              )}
            </div>

            <p className="font-bold text-sm text-brand-text-display">{addr.fullName}</p>
            <p className="text-xs text-brand-text-muted mt-1">
              {addr.addressLine1}
              {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
            </p>
            <p className="text-xs text-brand-text-muted">
              {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
            </p>
            <p className="text-xs text-brand-text-subtle mt-2 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {addr.phone}
            </p>

            <div className="pt-3 mt-3 border-t border-brand-sand flex justify-end">
              <button
                onClick={() => onDeleteAddress(addr.id)}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AddressBookCard;
