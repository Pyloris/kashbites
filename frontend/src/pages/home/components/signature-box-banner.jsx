import React from 'react';
import { useCart } from '../../../context/CartContext.jsx';
import { Sparkles, ArrowRight, Gift, Check } from 'lucide-react';
import { Button } from '../../../components/ui/index.js';

export const SignatureBoxBanner = ({ comboProduct, onSelectProduct }) => {
  const { addToCart, buyNow } = useCart();
  const jars = [
    'Kashmiri Walnuts',
    'Mamra Almonds',
    'Dried Apricots',
    'Walnut Kernels',
    'Royal Medley',
    'Green Kishmish',
  ];

  const handleQuickAdd = () => {
    if (comboProduct) {
      addToCart(comboProduct, comboProduct.netWeights?.[0]?.weight, 1);
    }
  };

  const handleBuyNow = () => {
    if (comboProduct) {
      buyNow(comboProduct, comboProduct.netWeights?.[0]?.weight, 1);
    }
  };

  return (
    <section className="py-14 bg-brand-emerald-darker text-brand-text-light relative overflow-hidden border-y border-brand-gold/30">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--color-brand-gold-bright)_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div
              onClick={() => comboProduct && onSelectProduct(comboProduct._id)}
              className="relative group rounded-2xl overflow-hidden border-2 border-brand-gold shadow-2xl cursor-pointer bg-brand-emerald-deep"
            >
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM_2a73fcbc.jpeg"
                alt="KashBites Signature Collection Emerald Gift Box with 6 Jars"
                className="w-full h-[360px] sm:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

              <div className="absolute bottom-4 left-4 right-4 bg-brand-emerald-dark/90 backdrop-blur-md p-3.5 rounded-xl border border-brand-gold/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold block">
                    Inside The Hamper
                  </span>
                  <p className="text-xs text-white font-medium">
                    6 Heritage Glass Jars with Gold Caps (1.2kg Total)
                  </p>
                </div>
                <span className="text-xs font-bold bg-brand-gold text-brand-emerald-darker px-3 py-1.5 rounded-lg">
                  Explore Hamper
                </span>
              </div>
            </div>

            <div className="absolute -top-3 -left-3 bg-brand-gold text-brand-emerald-darker p-2.5 rounded-full shadow-lg border border-white/50 flex items-center justify-center">
              <Gift className="w-5 h-5 text-brand-emerald-darker" />
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold bg-brand-emerald-dark px-3 py-1 rounded-full border border-brand-gold/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                Royal Kashmiri Gifting Edition
              </span>
            </div>

            <h2 className="font-serif-brand text-3xl sm:text-4xl font-bold text-brand-text-light mb-3 leading-tight">
              The KashBites Signature Collection
            </h2>

            <p className="text-sm text-brand-sand-light leading-relaxed mb-6 font-normal">
              A curated selection of Kashmir-origin dry fruits, sourced directly from our growers and packed with care for a truly Kashmiri royal experience. Adorned with 24K gold foil Chinar leaves and a hand-tied emerald double-faced satin ribbon.
            </p>

            <div className="mb-6">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block mb-2">
                Curated 6-Jar Ensemble:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {jars.map((jar, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-brand-emerald-dark/80 border border-brand-emerald/40 flex items-center gap-1.5 text-brand-sand-light"
                  >
                    <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span className="font-medium text-[11px] truncate">{jar}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-brand-emerald/40">
              <div>
                <span className="text-[10px] text-brand-text-subtle uppercase tracking-wider block">
                  Special Festive Offer
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-white">₹1,999</span>
                  <span className="text-sm line-through text-brand-text-subtle font-mono">₹2,599</span>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleQuickAdd}
                  className="text-white border-brand-gold/40 hover:bg-brand-emerald-dark"
                >
                  Add to Cart
                </Button>

                <Button
                  variant="gold"
                  size="md"
                  onClick={handleBuyNow}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Buy Royal Hamper
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignatureBoxBanner;
