import React from 'react';
import { Card } from '../../../components/ui/index.js';
import { MapPin, Clock, ShieldCheck } from 'lucide-react';

export const FacilityInfo = () => {
  return (
    <div className="lg:col-span-5 space-y-6">
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-brand-gold" />
          <h4 className="font-serif-brand text-lg font-bold text-brand-text-display">
            Srinagar Packaging Facility
          </h4>
        </div>
        <p className="text-xs text-brand-text-muted leading-relaxed">
          KashBites Agro Pvt Ltd<br />
          Plot No. 42-B, Industrial Growth Centre, Sanat Nagar,<br />
          Srinagar, Jammu & Kashmir – 190005, India
        </p>
        <div className="pt-3 border-t border-brand-sand space-y-2 text-xs text-brand-text-muted">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-emerald" />
            <span>Facility Hours: 8:30 AM - 6:30 PM (Mon-Sat)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            <span>FSSAI License: 11026999000142</span>
          </div>
        </div>
      </Card>

      <div className="p-6 rounded-2xl bg-brand-emerald-dark text-brand-text-light border border-brand-gold/40 space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold block">
          Direct Orchard Sourcing
        </span>
        <h5 className="font-serif-brand text-base font-bold">
          Are you a Kashmiri Orchard Grower?
        </h5>
        <p className="text-xs text-brand-sand-light leading-relaxed">
          We work directly with certified organic walnut, almond, and saffron farmers across Shopian, Pulwama, and Budgam. Reach out to join our harvest cooperative.
        </p>
      </div>
    </div>
  );
};

export default FacilityInfo;
