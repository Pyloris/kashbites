import React from 'react';
import { SectionHeader } from '../../../components/ui/index.js';

export const AboutStory = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      <div className="lg:col-span-6 relative">
        <div className="relative rounded-2xl overflow-hidden border-2 border-brand-gold shadow-xl">
          <img
            src="/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM_2a73fcbc.jpeg"
            alt="KashBites Heritage Gift Box"
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-emerald-darker/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold block">
              Sanat Nagar Processing Atelier, Srinagar
            </span>
            <p className="font-serif-brand text-lg font-bold">
              Cold-Nitrogen Packed at 16°C
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 space-y-6">
        <SectionHeader
          eyebrow="Our Mission"
          title="Restoring Integrity to Kashmiri Dry Fruits"
          align="left"
        />
        <p className="text-xs sm:text-sm text-brand-text-body leading-relaxed">
          For decades, commercial mass-market suppliers have blended imported third-grade produce, chemically dipped walnuts in toxic hydrogen peroxide bleach to artificially whiten shells, and stripped essential natural oils.
        </p>
        <p className="text-xs sm:text-sm text-brand-text-body leading-relaxed">
          At KashBites, we took an uncompromising oath: <strong>100% single-origin provenance</strong>, harvested from generational cooperatives in Shopian, Pulwama, and Ganderbal. Untreated, unbleached, and packed inside nitrogen-displaced hermetic barriers within hours of cracking.
        </p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-brand-emerald-tint border border-brand-emerald/20">
            <span className="font-mono text-2xl font-bold text-brand-emerald block">68%</span>
            <span className="text-xs text-brand-text-muted">Natural Omega-3 Oil Content</span>
          </div>
          <div className="p-4 rounded-xl bg-brand-gold-tint border border-brand-gold/30">
            <span className="font-mono text-2xl font-bold text-brand-gold-dark block">0.0%</span>
            <span className="text-xs text-brand-text-muted">Chemical Bleach or Sulphur</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutStory;
