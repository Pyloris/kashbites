import React from 'react';
import { Card, SectionHeader } from '../../../components/ui/index.js';
import { Mountain, Droplet, Award, ShieldCheck } from 'lucide-react';

export const AboutPillars = () => {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <SectionHeader
          eyebrow="Orchard Pedigree"
          title="Four Hallmarks of True Kashmiri Harvests"
          align="center"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="w-12 h-12 rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald mb-4">
            <Mountain className="w-6 h-6" />
          </div>
          <h3 className="font-serif-brand text-lg font-bold text-brand-text-display mb-1">
            Glacial Meltwater Irrigation
          </h3>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            Alpine snow runoff carries high mineral sediments directly feeding the deep taproots of century-old trees.
          </p>
        </Card>

        <Card className="p-6">
          <div className="w-12 h-12 rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald mb-4">
            <Droplet className="w-6 h-6" />
          </div>
          <h3 className="font-serif-brand text-lg font-bold text-brand-text-display mb-1">
            Direct Farmer Royalties
          </h3>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            Eliminating layers of middlemen guarantees higher payments for artisan Kashmiri farming families.
          </p>
        </Card>

        <Card className="p-6">
          <div className="w-12 h-12 rounded-xl bg-brand-gold-tint flex items-center justify-center text-brand-gold mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif-brand text-lg font-bold text-brand-text-display mb-1">
            Lab Batch Certified
          </h3>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            Every carton carries a verifiable lab analysis testing for moisture, aflatoxins, and absolute purity.
          </p>
        </Card>

        <Card className="p-6">
          <div className="w-12 h-12 rounded-xl bg-brand-emerald-tint flex items-center justify-center text-brand-emerald mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif-brand text-lg font-bold text-brand-text-display mb-1">
            Air Cargo Dispatch
          </h3>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            Flown out directly from Srinagar Airport (SXR) to avoid prolonged truck transits across highway blockades.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AboutPillars;
