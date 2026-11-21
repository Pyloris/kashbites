import React from 'react';
import { Card } from '../../../components/ui/index.js';
import { Phone, MessageCircle, Mail } from 'lucide-react';

export const ContactChannels = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
          <Phone className="w-6 h-6" />
        </div>
        <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
          Phone & Support
        </h3>
        <p className="text-xs text-brand-text-muted">
          Monday to Saturday · 9:30 AM to 7:00 PM IST
        </p>
        <p className="font-bold text-sm text-brand-emerald">
          +91 98765 43210 / +91 194 2439182
        </p>
      </Card>

      <Card className="p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-xl bg-brand-gold-tint flex items-center justify-center text-brand-gold">
          <MessageCircle className="w-6 h-6" />
        </div>
        <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
          WhatsApp Concierge
        </h3>
        <p className="text-xs text-brand-text-muted">
          Fast response for tracking & custom corporate gifting
        </p>
        <p className="font-bold text-sm text-brand-gold-dark">
          +91 98765 43210 (WhatsApp)
        </p>
      </Card>

      <Card className="p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
          Email Helpdesk
        </h3>
        <p className="text-xs text-brand-text-muted">
          Orchard cooperative & enterprise bulk inquiries
        </p>
        <p className="font-bold text-sm text-brand-emerald">
          support@kashbites.com
        </p>
      </Card>
    </div>
  );
};

export default ContactChannels;
