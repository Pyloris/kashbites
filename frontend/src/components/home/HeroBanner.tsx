import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Award, Mountain, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onExplore: (category?: string) => void;
  onSelectProduct: (productId: string) => void;
}

const HERO_SLIDES = [
  {
    id: 'kb-prod-05',
    category: 'combos',
    kicker: 'ROYAL LAUNCH · 2026 SIGNATURE COLLECTION',
    title: 'The Regal Emerald Gift Hamper',
    subtitle:
      'Curated with 6 gold-capped hermetic jars featuring Kashmiri Walnuts, Mamra Almonds, Sun-Dried Apricots & Green Raisins in a gold-embossed Chinar box.',
    offerTag: 'LIMITED FESTIVE RELEASE · SAVE ₹600',
    price: '₹1,999',
    originalPrice: '₹2,599',
    badge: 'Signature Royal Box',
    image: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM_2a73fcbc.jpeg',
    bgTone: 'from-[#0A2616] via-[#103A22] to-[#0A2416]',
    ctaText: 'Explore Royal Hamper',
  },
  {
    id: 'kb-prod-01',
    category: 'walnuts',
    kicker: 'DIRECT FROM SHOPIAN & PULWAMA ORCHARDS',
    title: 'Pure Kashmiri Kagzi Walnuts & Almonds',
    subtitle:
      'Centennial Himalayan orchard harvest naturally endowed with 68% virgin omega-3 oil. Soft shells that easily crack by hand with zero chemical bleaching.',
    offerTag: 'FRESH AUTUMN 2026 CROP · ZERO PRESERVATIVES',
    price: '₹499',
    originalPrice: '₹649',
    badge: 'Bestseller Harvest',
    image: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg',
    bgTone: 'from-[#143221] via-[#1B432E] to-[#122B1D]',
    ctaText: 'Shop Kashmiri Walnuts',
  },
  {
    id: 'kb-prod-07',
    category: 'combos',
    kicker: 'VALUE HARVEST COMBO PACK',
    title: 'The Himalayan Valley Orchard Trio',
    subtitle:
      'Get three full 500g stand-up zipper pouches: Kashmiri Walnuts + Mamra Almonds + Sun-Dried Apricots. Direct farm-to-table freshness.',
    offerTag: 'SPECIAL VALUE BUNDLE · SAVE 25%',
    price: '₹1,499',
    originalPrice: '₹1,999',
    badge: 'Popular Combo',
    image: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.19_PM_fe96f8a7.jpeg',
    bgTone: 'from-[#1B3829] via-[#244A37] to-[#163324]',
    ctaText: 'Claim Orchard Trio',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore, onSelectProduct }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slide = HERO_SLIDES[currentSlideIndex];

  return (
    <section className="relative overflow-hidden bg-[#0A2416] text-[#FAF7F2]">
      {/* Subtle background ambient overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#DFB248_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10">
        
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Offer / Provenance Tag */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#DFB248] bg-[#143823] px-3 py-1 rounded-full border border-[#C59432]/30">
                <Sparkles className="w-3 h-3 text-[#DFB248]" />
                {slide.kicker}
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="font-serif-brand text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-[#FAF7F2] leading-[1.15] mb-5">
              {slide.title}
            </h1>

            {/* Editorial Subtitle */}
            <p className="text-base sm:text-lg text-[#E3DDD1] leading-relaxed max-w-2xl mb-6 font-normal">
              {slide.subtitle}
            </p>

            {/* Pricing & Offer Strip */}
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-[#143924]/80 border border-[#2D5A3C] backdrop-blur-sm mb-8">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#C8BCAB] block font-medium">Special Launch Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-[#FAF7F2] font-mono tabular-nums">{slide.price}</span>
                  <span className="text-sm line-through text-[#9BA89F] font-mono tabular-nums">{slide.originalPrice}</span>
                </div>
              </div>

              <div className="h-8 w-[1px] bg-[#2D5A3C] hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#DFB248] bg-[#2A5237] px-2.5 py-1 rounded">
                  {slide.offerTag}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onSelectProduct(slide.id)}
                className="bg-[#C59432] hover:bg-[#D4A33E] text-[#0A2416] font-bold px-6 py-3.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-2.5 shadow-lg shadow-[#000000]/30 hover:scale-[1.02] active:scale-95"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onExplore('all')}
                className="bg-transparent hover:bg-white/10 text-[#FAF7F2] border border-[#E3DDD1]/30 font-medium px-5 py-3.5 rounded-lg text-sm transition-colors"
              >
                Explore Full Catalog
              </button>
            </div>

            {/* Quick slide tabs for offers */}
            <div className="flex items-center gap-2 mt-10 pt-6 border-t border-[#1C462D]">
              <span className="text-xs text-[#A2B5A8] font-medium mr-2">Featured Launches:</span>
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    currentSlideIndex === idx
                      ? 'bg-[#C59432] text-[#0A2416] font-bold shadow-sm'
                      : 'bg-[#143823] text-[#CBD5CE] hover:bg-[#1B4B2F]'
                  }`}
                >
                  {s.badge}
                </button>
              ))}
            </div>

          </div>

          {/* Right Hero Image Card Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative group cursor-pointer" onClick={() => onSelectProduct(slide.id)}>
              
              {/* Outer decorative gold border ring */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C59432]/40 bg-[#0E2E1C]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-[380px] sm:h-[450px] lg:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Gradient bottom scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2416] via-transparent to-black/20 pointer-events-none"></div>

                {/* Packaging Feature Label */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#0F2F1D]/90 backdrop-blur-md p-3.5 rounded-xl border border-[#2D5A3C] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#DFB248] block">
                      Authentic Kashmiri Packaging
                    </span>
                    <h3 className="font-serif-brand text-lg font-bold text-[#FAF7F2]">
                      {slide.title}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold bg-[#C59432] text-[#0A2416] px-3 py-1.5 rounded-lg shrink-0">
                    View Details
                  </span>
                </div>
              </div>

              {/* Verified Kashmir Origin Rosette Badge */}
              <div className="absolute -top-3 -right-3 bg-[#C59432] text-[#0A2416] rounded-full p-2.5 shadow-xl border-2 border-[#FAF7F2] flex items-center justify-center">
                <Mountain className="w-5 h-5 text-[#0A2416]" />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Trust Metrics Adjacency Bar */}
      <div className="border-t border-[#19442B] bg-[#081F13] py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs text-[#CBD8D0]">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-[#DFB248]" />
            <span>100% Kashmir Valley Harvest</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#DFB248]" />
            <span>FSSAI & Directorate of Horticulture Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#DFB248]" />
            <span>Hermetic Cold Nitrogen Packing in Srinagar</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#DFB248]" />
            <span>Air Express Direct to Your Doorstep</span>
          </div>
        </div>
      </div>

    </section>
  );
};
