import React from 'react';
import { Card, Button, Alert } from '../../../components/ui/index.js';

export const AlertsTab = ({
  notifications,
  setNotifications,
  profileSuccessMsg,
  onSubmit,
}) => {
  return (
    <Card className="p-6 sm:p-8 space-y-6">
      <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
        Notification & Dispatch Alerts
      </h3>

      {profileSuccessMsg && (
        <Alert variant="success">{profileSuccessMsg}</Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
        <div className="space-y-4">
          <label className="flex items-start gap-3 p-4 rounded-xl border border-brand-sand bg-white cursor-pointer hover:border-brand-emerald">
            <input
              type="checkbox"
              checked={notifications.smsAlerts}
              onChange={(e) =>
                setNotifications({ ...notifications, smsAlerts: e.target.checked })
              }
              className="mt-0.5 rounded text-brand-emerald focus:ring-brand-emerald"
            />
            <div>
              <span className="text-xs font-bold text-brand-emerald block">
                SMS Airway Bill & Dispatch Alerts
              </span>
              <span className="text-xs text-brand-text-muted">
                Real-time SMS updates when your package departs Srinagar Airport (SXR) and arrives out-for-delivery.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-brand-sand bg-white cursor-pointer hover:border-brand-emerald">
            <input
              type="checkbox"
              checked={notifications.whatsappAlerts}
              onChange={(e) =>
                setNotifications({ ...notifications, whatsappAlerts: e.target.checked })
              }
              className="mt-0.5 rounded text-brand-emerald focus:ring-brand-emerald"
            />
            <div>
              <span className="text-xs font-bold text-brand-emerald block">
                WhatsApp Packaging Video & Lab QC Dispatch
              </span>
              <span className="text-xs text-brand-text-muted">
                Receive your package's nitrogen hermetic sealing video and lab purity verification via WhatsApp.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-brand-sand bg-white cursor-pointer hover:border-brand-emerald">
            <input
              type="checkbox"
              checked={notifications.harvestNewsletter}
              onChange={(e) =>
                setNotifications({ ...notifications, harvestNewsletter: e.target.checked })
              }
              className="mt-0.5 rounded text-brand-emerald focus:ring-brand-emerald"
            />
            <div>
              <span className="text-xs font-bold text-brand-emerald block">
                Exclusive Fresh Harvest Reservations
              </span>
              <span className="text-xs text-brand-text-muted">
                Be notified of limited first-bloom Pampore Saffron and rare single-tree Mamra Almond allocations.
              </span>
            </div>
          </label>
        </div>

        <Button type="submit" variant="primary" size="md">
          Update Alert Preferences
        </Button>
      </form>
    </Card>
  );
};

export default AlertsTab;
