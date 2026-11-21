import React from 'react';
import { Mountain, Droplet, Sun, ShieldCheck } from 'lucide-react';
import { Card, SectionHeader } from '../../../components/ui/index.js';

export const KashmirOriginStory = () => {
  const pillars = [
    {
      title: 'Glacier-Fed Valleys',
      desc: 'Orchards in Shopian & Pulwama sit 1,800m above sea level, irrigated by virgin glacial meltwater carrying rich alluvial trace minerals.',
      icon: <Mountain className="w-6 h-6 text-brand-emerald" />,
      tint: 'bg-brand-emerald-tint',
    },
    {
      title: '68% Natural Oil Richness',
      desc: 'Unlike California nuts bred for shelf-life, Kashmiri Mamra almonds and Kagzi walnuts boast natural oils that glisten on your fingertips.',
      icon: <Droplet className="w-6 h-6 text-brand-emerald" />,
      tint: 'bg-brand-emerald-tint',
    },
    {
      title: 'Shade & Sun-Cured',
      desc: 'Slowly cured under crisp autumn Himalayan sunshine. No artificial dehydrators or chemical sulphur spraying.',
      icon: <Sun className="w-6 h-6 text-brand-gold" />,
      tint: 'bg-brand-gold-tint',
    },
    {
      title: 'Zero Bleaching Protocol',
      desc: 'Commercial brands dip walnuts in hydrogen peroxide to create artificial pale shells. KashBites walnuts remain authentic, natural, and raw.',
      icon: <ShieldCheck className="w-6 h-6 text-brand-emerald" />,
      tint: 'bg-brand-emerald-tint',
    },
  ];

  return (
    <section className="py-16 bg-brand-canvas border-b border-brand-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <SectionHeader
            eyebrow="Centennial Himalayan Orchards"
            title="Why Kashmiri Dry Fruits are Incomparable"
            subtitle="Grown in high-altitude valleys flanked by snowcapped peaks, yielding the world's most nutrient-rich harvests."
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => (
            <Card key={idx} className="p-6">
              <div
                className={`w-12 h-12 rounded-xl ${item.tint} flex items-center justify-center mb-4`}
              >
                {item.icon}
              </div>
              <h3 className="font-serif-brand text-lg font-bold text-brand-text-display mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KashmirOriginStory;
