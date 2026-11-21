import React from 'react';
import { Card, Input, Button, Alert } from '../../../components/ui/index.js';

export const ProfileDetailsCard = ({
  user,
  name,
  setName,
  phone,
  setPhone,
  notifications,
  setNotifications,
  profileSuccessMsg,
  onSubmit,
}) => {
  return (
    <Card className="md:col-span-2">
      <Card.Header>
        <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
          Personal Profile Information
        </h3>
      </Card.Header>

      <Card.Body>
        {profileSuccessMsg && (
          <Alert variant="success" className="mb-6">
            {profileSuccessMsg}
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address (Permanent Account ID)"
              type="email"
              disabled
              value={user.email}
              helperText="Account ID cannot be changed"
            />

            <Input
              label="Phone Number (For Air Courier Updates)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="pt-4 border-t border-brand-sand">
            <h4 className="text-xs font-bold text-brand-emerald uppercase tracking-wider mb-3">
              Notification & Dispatch Alerts
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-xs text-brand-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.smsAlerts}
                  onChange={(e) =>
                    setNotifications({ ...notifications, smsAlerts: e.target.checked })
                  }
                  className="rounded text-brand-emerald focus:ring-brand-emerald"
                />
                Receive SMS airway bill dispatch & out-for-delivery alerts
              </label>
              <label className="flex items-center gap-3 text-xs text-brand-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.whatsappAlerts}
                  onChange={(e) =>
                    setNotifications({ ...notifications, whatsappAlerts: e.target.checked })
                  }
                  className="rounded text-brand-emerald focus:ring-brand-emerald"
                />
                Receive WhatsApp nitrogen-pouch packaging video & courier tracking
              </label>
              <label className="flex items-center gap-3 text-xs text-brand-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.harvestNewsletter}
                  onChange={(e) =>
                    setNotifications({ ...notifications, harvestNewsletter: e.target.checked })
                  }
                  className="rounded text-brand-emerald focus:ring-brand-emerald"
                />
                Exclusive harvest reservation newsletters (First-bloom saffron & Mamra almonds)
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" size="md">
            Save Changes
          </Button>
        </form>
      </Card.Body>
    </Card>
  );
};

export default ProfileDetailsCard;
