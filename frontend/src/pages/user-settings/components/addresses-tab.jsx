import React from 'react';
import { Card, Badge } from '../../../components/ui/index.js';
import { CheckCircle2, Trash2, Phone } from 'lucide-react';

export const AddressesTab = ({
  addresses = [],
  onSetDefaultAddress,
  onDeleteAddress,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
          Saved Delivery Addresses ({addresses.length})
        </h3>
        <p className="text-xs text-brand-text-muted">
          Addresses used for 2-3 business day air delivery across India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
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

export default AddressesTab;
