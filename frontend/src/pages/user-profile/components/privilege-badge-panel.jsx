import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

export const PrivilegeBadgePanel = () => {
  return (
    <div className="bg-brand-emerald-dark text-brand-text-light p-6 sm:p-8 rounded-2xl border-2 border-brand-gold space-y-4 flex flex-col justify-between shadow-md">
      <div>
        <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold mb-3">
          <Award className="w-6 h-6" />
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold block">
          Kashmir Provenance Direct
        </span>
        <h4 className="font-serif-brand text-xl font-bold text-white mt-1">
          Single-Origin Patron
        </h4>
        <p className="text-xs text-brand-sand-light mt-2 leading-relaxed">
          Your orders directly support orchard artisan families across Shopian, Pulwama, and Pampore.
        </p>
      </div>

      <div className="pt-4 border-t border-brand-gold/30 space-y-2 text-xs text-brand-emerald-light">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-gold" />
          <span>Priority SXR Air Cargo Dispatch</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-gold" />
          <span>Free Nitrogen Seal Re-Verification</span>
        </div>
      </div>
    </div>
  );
};

export default PrivilegeBadgePanel;
