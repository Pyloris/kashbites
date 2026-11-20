import React from 'react';
import { KashmirOriginIcon, DirectFromGrowersIcon, CarefullySelectedIcon, QualityTrustIcon, } from '../common/TrustIcons.jsx';
export const TrustSection = () => {
    const pillars = [
        {
            title: 'Kashmir Origin',
            subtitle: 'Shopian & Pulwama Slopes',
            desc: '100% grown in the mineral-rich glacial soil and high altitude climates of Kashmir, endowing walnuts & almonds with higher natural oil content.',
            icon: <KashmirOriginIcon className="w-8 h-8 text-[#143E26]"/>,
        },
        {
            title: 'Direct From Growers',
            subtitle: 'Empowering Local Orchards',
            desc: 'Ethically sourced without middlemen directly from generational farming families. Fresh 2026 autumn crop guaranteed.',
            icon: <DirectFromGrowersIcon className="w-8 h-8 text-[#143E26]"/>,
        },
        {
            title: 'Carefully Selected',
            subtitle: 'Hand-Cracked & Sorted',
            desc: 'Triple manual sorting to weed out flawed or bitter nuts. Packed in airtight moisture-barrier pouches with vacuum freshness seal.',
            icon: <CarefullySelectedIcon className="w-8 h-8 text-[#143E26]"/>,
        },
        {
            title: 'Quality You Can Trust',
            subtitle: 'Zero Chemical Bleaching',
            desc: 'Unlike commercial mass-market dry fruits that use toxic peroxide bleach, KashBites nuts remain 100% natural, untreated & raw.',
            icon: <QualityTrustIcon className="w-8 h-8 text-[#143E26]"/>,
        },
    ];
    return (<section className="py-12 bg-[#FAF7F2] border-b border-[#E8DEC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Subtle Section Kicker */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-[0.2em] text-[#C59432] uppercase block mb-1">
            The KashBites Promise
          </span>
          <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#0E331E]">
            Authentic Purity from the Valley of Kashmir
          </h2>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (<div key={idx} className="bg-white p-6 rounded-xl border border-[#E6DECF] shadow-xs hover:shadow-md transition-shadow flex flex-col items-start">
              <div className="w-14 h-14 rounded-xl bg-[#EAF2EC] flex items-center justify-center mb-4 border border-[#D1E2D6]">
                {pillar.icon}
              </div>
              <h3 className="font-serif-brand text-lg font-bold text-[#0E331E] mb-0.5">
                {pillar.title}
              </h3>
              <span className="text-xs font-semibold text-[#C59432] mb-2 block">
                {pillar.subtitle}
              </span>
              <p className="text-xs text-[#526356] leading-relaxed">
                {pillar.desc}
              </p>
            </div>))}
        </div>

      </div>
    </section>);
};
