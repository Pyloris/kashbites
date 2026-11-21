import React from 'react';
import { Card } from '../../../components/ui/index.js';
import { Award, Truck, RotateCcw, Scale } from 'lucide-react';

export const TermsSections = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gold-tint flex items-center justify-center text-brand-gold-dark">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="font-serif-brand text-xl font-bold text-brand-text-display">
            1. 100% Single-Origin Warranty
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-brand-text-body leading-relaxed">
          Every package bearing the KashBites seal is warranted to be 100% authentic Kashmiri crop, directly harvested from our certified grower network across Shopian, Pulwama, and Ganderbal. We guarantee zero chemical bleaching agents (such as hydrogen peroxide or sulphur dioxide) and natural oil preservation.
        </p>
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
            <Truck className="w-5 h-5" />
          </div>
          <h2 className="font-serif-brand text-xl font-bold text-brand-text-display">
            2. Air Express Dispatch & Delivery
          </h2>
        </div>
        <div className="space-y-2 text-xs sm:text-sm text-brand-text-body leading-relaxed">
          <p>
            Orders are processed and cold-nitrogen hermetically sealed at our Srinagar facility. Standard air transit time is <strong>2 to 4 business days</strong> for major metro locations (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai) and 3 to 6 days for other pincodes.
          </p>
          <p className="text-brand-text-muted">
            Adverse weather in the Kashmir Valley causing Srinagar Airport ground delays will be immediately communicated to you via SMS and WhatsApp.
          </p>
        </div>
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h2 className="font-serif-brand text-xl font-bold text-brand-text-display">
            3. Replacement & Refund Policy
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-brand-text-body leading-relaxed">
          If your parcel arrives with a compromised vacuum seal, transit moisture damage, or if you find the harvest quality unsatisfactory, simply reach out to us within <strong>7 days of delivery</strong> with a photo or video. We will issue a <strong>100% complimentary air-freight replacement</strong> or full refund without hassle.
        </p>
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gold-tint flex items-center justify-center text-brand-gold-dark">
            <Scale className="w-5 h-5" />
          </div>
          <h2 className="font-serif-brand text-xl font-bold text-brand-text-display">
            4. Pricing & Taxes
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-brand-text-body leading-relaxed">
          All prices displayed on the storefront are inclusive of applicable GST. Complimentary free air-courier delivery is granted automatically for all orders exceeding ₹999 across India.
        </p>
      </Card>
    </div>
  );
};

export default TermsSections;
