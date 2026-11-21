import React from 'react';
import {
  KashmirOriginIcon,
  DirectFromGrowersIcon,
  CarefullySelectedIcon,
  QualityTrustIcon,
} from '../../../components/ui/index.js';
import { Card, SectionHeader } from '../../../components/ui/index.js';

export const TrustSection = () => {
  const pillars = [
    {
      title: 'Kashmir Origin',
      subtitle: 'Shopian & Pulwama Slopes',
      desc: '100% grown in the mineral-rich glacial soil and high altitude climates of Kashmir, endowing walnuts & almonds with higher natural oil content.',
      icon: <KashmirOriginIcon className="w-8 h-8 text-brand-emerald" />,
    },
    {
      title: 'Direct From Growers',
      subtitle: 'Empowering Local Orchards',
      desc: 'Ethically sourced without middlemen directly from generational farming families. Fresh 2026 autumn crop guaranteed.',
      icon: <DirectFromGrowersIcon className="w-8 h-8 text-brand-emerald" />,
    },
    {
      title: 'Carefully Selected',
      subtitle: 'Hand-Cracked & Sorted',
      desc: 'Triple manual sorting to weed out flawed or bitter nuts. Packed in airtight moisture-barrier pouches with vacuum freshness seal.',
      icon: <CarefullySelectedIcon className="w-8 h-8 text-brand-emerald" />,
    },
    {
      title: 'Quality You Can Trust',
      subtitle: 'Zero Chemical Bleaching',
      desc: 'Unlike commercial mass-market dry fruits that use toxic peroxide bleach, KashBites nuts remain 100% natural, untreated & raw.',
      icon: <QualityTrustIcon className="w-8 h-8 text-brand-emerald" />,
    },
  ];

  return (
    <section className="py-12 bg-brand-canvas border-b border-brand-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <SectionHeader
            eyebrow="The KashBites Promise"
            title="Authentic Purity from the Valley of Kashmir"
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <Card
              key={idx}
              className="p-6 transition-all hover:shadow-md flex flex-col items-start"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-emerald-tint flex items-center justify-center mb-4 border border-brand-emerald/15">
                {pillar.icon}
              </div>
              <h3 className="font-serif-brand text-lg font-bold text-brand-text-display mb-0.5">
                {pillar.title}
              </h3>
              <span className="text-xs font-semibold text-brand-gold mb-2 block">
                {pillar.subtitle}
              </span>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                {pillar.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
