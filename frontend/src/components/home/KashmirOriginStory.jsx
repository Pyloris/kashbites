import React from 'react';
import { Mountain, Droplet, Sun, ShieldCheck } from 'lucide-react';
export const KashmirOriginStory = () => {
    return (<section className="py-16 bg-[#FAF7F2] border-b border-[#E8DEC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-[#C59432] uppercase block mb-1">
            Centennial Himalayan Orchards
          </span>
          <h2 className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#0E331E]">
            Why Kashmiri Dry Fruits are Incomparable
          </h2>
          <p className="text-xs sm:text-sm text-[#526356] mt-2">
            Grown in high-altitude valleys flanked by snowcapped peaks, yielding the world’s most nutrient-rich harvests.
          </p>
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-[#E6DECF] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#EAF2EC] text-[#143E26] flex items-center justify-center mb-4">
              <Mountain className="w-6 h-6 text-[#143E26]"/>
            </div>
            <h3 className="font-serif-brand text-lg font-bold text-[#0E331E] mb-1">
              Glacier-Fed Valleys
            </h3>
            <p className="text-xs text-[#5C6E61] leading-relaxed">
              Orchards in Shopian & Pulwama sit 1,800m above sea level, irrigated by virgin glacial meltwater carrying rich alluvial trace minerals.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DECF] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#EAF2EC] text-[#143E26] flex items-center justify-center mb-4">
              <Droplet className="w-6 h-6 text-[#143E26]"/>
            </div>
            <h3 className="font-serif-brand text-lg font-bold text-[#0E331E] mb-1">
              68% Natural Oil Richness
            </h3>
            <p className="text-xs text-[#5C6E61] leading-relaxed">
              Unlike California nuts bred for shelf-life, Kashmiri Mamra almonds and Kagzi walnuts boast natural oils that glisten on your fingertips.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DECF] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#FAF0D6] text-[#9E6D0E] flex items-center justify-center mb-4">
              <Sun className="w-6 h-6 text-[#C59432]"/>
            </div>
            <h3 className="font-serif-brand text-lg font-bold text-[#0E331E] mb-1">
              Shade & Sun-Cured
            </h3>
            <p className="text-xs text-[#5C6E61] leading-relaxed">
              Slowly cured under crisp autumn Himalayan sunshine. No artificial dehydrators or chemical sulphur spraying.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DECF] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#EAF2EC] text-[#143E26] flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-[#2D7A46]"/>
            </div>
            <h3 className="font-serif-brand text-lg font-bold text-[#0E331E] mb-1">
              Zero Bleaching Protocol
            </h3>
            <p className="text-xs text-[#5C6E61] leading-relaxed">
              Commercial brands dip walnuts in hydrogen peroxide to create artificial pale shells. KashBites walnuts remain authentic, natural, and raw.
            </p>
          </div>

        </div>

      </div>
    </section>);
};
