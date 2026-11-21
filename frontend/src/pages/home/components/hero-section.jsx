import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Award, Mountain, Sparkles } from 'lucide-react';
import { Button, Badge } from '../../../components/ui/index.js';

const HERO_SLIDES = [
  {
    id: 'signature-collection-emerald-box',
    slug: 'signature-collection-emerald-box',
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
    heroBg: {
      desktop: '/assets/hero/hero1.png',
      tablet: '/assets/hero/hero2.png',
      mobile: '/assets/hero/hero3.png',
    },
    ctaText: 'Explore Royal Hamper',
  },
  {
    id: 'kashmiri-walnuts',
    slug: 'kashmiri-walnuts',
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
    heroBg: {
      desktop: '/assets/hero/hero2.png',
      tablet: '/assets/hero/hero1.png',
      mobile: '/assets/hero/hero3.png',
    },
    ctaText: 'Shop Kashmiri Walnuts',
  },
  {
    id: 'valley-trio-harvest-combo',
    slug: 'valley-trio-harvest-combo',
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
    heroBg: {
      desktop: '/assets/hero/hero3.png',
      tablet: '/assets/hero/hero2.png',
      mobile: '/assets/hero/hero1.png',
    },
    ctaText: 'Claim Orchard Trio',
  },
];

export const HeroSection = ({ onExplore, onSelectProduct, products = [] }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slide = HERO_SLIDES[currentSlideIndex];

  const handleProductSelect = () => {
    const matched = products.find(
      (p) => p.slug === slide.slug || p._id === slide.id || p.slug === slide.id
    );
    const target = matched?.slug || matched?._id || slide.slug || slide.id;
    if (onSelectProduct) {
      onSelectProduct(target);
    }
  };

  return (
    <section className="relative overflow-hidden text-brand-text-light">
      {/* Responsive Hero Background Picture */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <picture className="w-full h-full block">
          {/* Desktop screens (1024px and wider) */}
          <source
            media="(min-width: 1024px)"
            srcSet={slide.heroBg?.desktop || '/assets/hero/hero1.png'}
          />
          {/* Tablet screens (640px to 1023px) */}
          <source
            media="(min-width: 640px)"
            srcSet={slide.heroBg?.tablet || '/assets/hero/hero2.png'}
          />
          {/* Mobile screens (<640px) */}
          <img
            src={slide.heroBg?.mobile || '/assets/hero/hero3.png'}
            alt="KashBites Kashmir Valley Harvest"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
        </picture>

        {/* Dual-layer scrim overlay to guarantee text legibility & contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-emerald-darker/95 via-brand-emerald-darker/85 to-brand-emerald-darker/60 lg:to-brand-emerald-darker/40"></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-gold bg-brand-emerald-dark px-3 py-1 rounded-full border border-brand-gold/30">
                <Sparkles className="w-3 h-3 text-brand-gold" />
                {slide.kicker}
              </span>
            </div>

            <h1 className="font-serif-brand text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-brand-text-light leading-[1.15] mb-5">
              {slide.title}
            </h1>

            <p className="text-base sm:text-lg text-brand-sand-light leading-relaxed max-w-2xl mb-6 font-normal">
              {slide.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-brand-emerald-dark/80 border border-brand-emerald/40 backdrop-blur-sm mb-8">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-brand-sand block font-medium">
                  Special Launch Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-brand-text-light font-mono tabular-nums">
                    {slide.price}
                  </span>
                  <span className="text-sm line-through text-brand-text-subtle font-mono tabular-nums">
                    {slide.originalPrice}
                  </span>
                </div>
              </div>

              <div className="h-8 w-[1px] bg-brand-emerald/40 hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <Badge variant="gold" size="md">
                  {slide.offerTag}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="gold"
                size="lg"
                onClick={handleProductSelect}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {slide.ctaText}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => onExplore('all')}
                className="text-brand-text-light border border-brand-sand/30 hover:bg-white/10"
              >
                Explore Full Catalog
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-10 pt-6 border-t border-brand-emerald/40">
              <span className="text-xs text-brand-text-subtle font-medium mr-2">Featured Launches:</span>
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    currentSlideIndex === idx
                      ? 'bg-brand-gold text-brand-emerald-dark font-bold shadow-sm'
                      : 'bg-brand-emerald-dark text-brand-sand-light hover:bg-brand-emerald'
                  }`}
                >
                  {s.badge}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative group cursor-pointer" onClick={handleProductSelect}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-gold/40 bg-brand-emerald-darker">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-[380px] sm:h-[450px] lg:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-brand-emerald-darker via-transparent to-black/20 pointer-events-none"></div>

                <div className="absolute bottom-4 left-4 right-4 bg-brand-emerald-dark/90 backdrop-blur-md p-3.5 rounded-xl border border-brand-emerald/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold block">
                      Authentic Kashmiri Packaging
                    </span>
                    <h3 className="font-serif-brand text-lg font-bold text-brand-text-light">
                      {slide.title}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold bg-brand-gold text-brand-emerald-darker px-3 py-1.5 rounded-lg shrink-0">
                    View Details
                  </span>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 bg-brand-gold text-brand-emerald-darker rounded-full p-2.5 shadow-xl border-2 border-brand-text-light flex items-center justify-center">
                <Mountain className="w-5 h-5 text-brand-emerald-darker" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-emerald/30 bg-brand-emerald-deep py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs text-brand-emerald-light">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-brand-gold" />
            <span>100% Kashmir Valley Harvest</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-gold" />
            <span>FSSAI & Directorate of Horticulture Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-gold" />
            <span>Hermetic Cold Nitrogen Packing in Srinagar</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span>Air Express Direct to Your Doorstep</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
