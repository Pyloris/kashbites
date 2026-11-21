import React from 'react';
import { Card } from '../../../components/ui/index.js';
import { ShieldCheck, FileText, Lock, Eye } from 'lucide-react';

export const PrivacySections = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-serif-brand text-xl font-bold text-brand-text-display">
            1. Our Privacy Pledge
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-brand-text-body leading-relaxed">
          At KashBites (KashBites Agro Pvt Ltd), we value your trust as deeply as our Kashmir Valley harvests. We respect your personal privacy and comply strictly with the Information Technology Act, 2000 (India) and applicable consumer privacy guidelines. We do not sell, rent, or trade your personal information to third-party advertisers.
        </p>
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="font-serif-brand text-xl font-bold text-brand-text-display">
            2. Information We Collect
          </h2>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-brand-text-body leading-relaxed">
          <p>We collect only the essential information necessary to deliver fresh harvest packages to your doorstep:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-brand-text-muted">
            <li><strong>Identity & Contact Details:</strong> Full name, telephone number, and email address for order notifications and airway bills.</li>
            <li><strong>Delivery Destination:</strong> Shipping address, apartment details, city, state, and pincode across India.</li>
            <li><strong>Order & Transaction Records:</strong> Purchase history, chosen payment mode (Cash on Delivery, UPI, Card), and tracking logs.</li>
            <li><strong>Device & Usage Data:</strong> IP address and session cookies strictly used to maintain your shopping cart and authentication session.</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-serif-brand text-xl font-bold text-brand-text-display">
            3. Payment & Transaction Security
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-brand-text-body leading-relaxed">
          KashBites never stores your complete credit/debit card numbers or bank credentials on our servers. All digital payments are processed through PCI-DSS Level 1 compliant gateways using 256-bit SSL encryption. Cash on Delivery (COD) transactions require phone confirmation prior to Srinagar air dispatch.
        </p>
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="font-serif-brand text-xl font-bold text-brand-text-display">
            4. Courier & Logistics Partners
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-brand-text-body leading-relaxed">
          Your name, phone number, and delivery address are shared solely with certified priority air cargo partners (such as BlueDart, Delhivery, or India Post Speed Post) to route your package from Srinagar Airport (SXR) to your destination pincode.
        </p>
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        <h2 className="font-serif-brand text-xl font-bold text-brand-text-display">
          5. Contact Our Privacy Officer
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-body leading-relaxed">
          If you wish to review, update, or request deletion of your account records, please contact our data grievance desk:
        </p>
        <div className="p-4 rounded-xl bg-brand-canvas border border-brand-sand text-xs space-y-1">
          <p><strong>Grievance Officer:</strong> Mohammad Owais / Data Protection Officer</p>
          <p><strong>Email:</strong> privacy@kashbites.com / mohammadowais616@gmail.com</p>
          <p><strong>Processing Facility:</strong> Industrial Growth Centre, Sanat Nagar, Srinagar, J&K – 190005</p>
        </div>
      </Card>
    </div>
  );
};

export default PrivacySections;
