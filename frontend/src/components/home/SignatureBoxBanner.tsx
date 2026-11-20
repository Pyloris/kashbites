import React from 'react';
import { useCart } from '../../context/CartContext.js';
import { IProduct } from '../../types/index.js';
import { Sparkles, ArrowRight, Gift, Check, ShieldCheck } from 'lucide-react';

interface SignatureBoxBannerProps {
  comboProduct?: IProduct;
  onSelectProduct: (productId: string) => void;
}

export const SignatureBoxBanner: React.FC<SignatureBoxBannerProps> = ({
  comboProduct,
  onSelectProduct,
}) => {
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
      addToCart(comboProduct, comboProduct.netWeights[0]?.weight, 1);
    }
  };

  const handleBuyNow = () => {
    if (comboProduct) {
      buyNow(comboProduct, comboProduct.netWeights[0]?.weight, 1);
    }
  };

  return (
    <section className="py-14 bg-[#0A2617] text-[#FAF7F2] relative overflow-hidden border-y border-[#C59432]/30">
      
      {/* Decorative Chinar Leaf Pattern Background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#DFB248_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Visual: Emerald Box & Jars from attached photos */}
          <div className="lg:col-span-6 relative">
            <div
              onClick={() => comboProduct && onSelectProduct(comboProduct._id)}
              className="relative group rounded-2xl overflow-hidden border-2 border-[#C59432] shadow-2xl cursor-pointer bg-[#071F12]"
            >
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM_2a73fcbc.jpeg"
                alt="KashBites Signature Collection Emerald Gift Box with 6 Jars"
                className="w-full h-[360px] sm:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

              <div className="absolute bottom-4 left-4 right-4 bg-[#0A2416]/90 backdrop-blur-md p-3.5 rounded-xl border border-[#DFB248]/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#DFB248] block">
                    Inside The Hamper
                  </span>
                  <p className="text-xs text-white font-medium">
                    6 Heritage Glass Jars with Gold Caps (1.2kg Total)
                  </p>
                </div>
                <span className="text-xs font-bold bg-[#C59432] text-[#0A2416] px-3 py-1.5 rounded-lg">
                  Explore Hamper
                </span>
              </div>
            </div>

            {/* Rosette Tag */}
            <div className="absolute -top-3 -left-3 bg-[#C59432] text-[#0A2416] p-2.5 rounded-full shadow-lg border border-white/50 flex items-center justify-center">
              <Gift className="w-5 h-5 text-[#0A2416]" />
            </div>
          </div>

          {/* Right Editorial Copy */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#DFB248] bg-[#143E26] px-3 py-1 rounded-full border border-[#DFB248]/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#DFB248]" />
                Royal Kashmiri Gifting Edition
              </span>
            </div>

            <h2 className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#FAF7F2] mb-3 leading-tight">
              The KashBites Signature Collection
            </h2>

            <p className="text-sm text-[#D7CEC0] leading-relaxed mb-6 font-normal">
              A curated selection of Kashmir-origin dry fruits, sourced directly from our growers and packed with care for a truly Kashmiri royal experience. Adorned with 24K gold foil Chinar leaves and a hand-tied emerald double-faced satin ribbon.
            </p>

            {/* 6 Jars Mini Grid */}
            <div className="mb-6">
              <span className="text-xs font-bold text-[#DFB248] uppercase tracking-wider block mb-2">
                Curated 6-Jar Ensemble:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {jars.map((jar, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[#143B25]/80 border border-[#2D5A3C] flex items-center gap-1.5 text-[#E6DECF]"
                  >
                    <Check className="w-3.5 h-3.5 text-[#DFB248] shrink-0" />
                    <span className="font-medium text-[11px] truncate">{jar}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#1C472E]">
              <div>
                <span className="text-[10px] text-[#A0B0A4] uppercase tracking-wider block">Special Festive Offer</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-white">₹1,999</span>
                  <span className="text-sm line-through text-[#809486] font-mono">₹2,599</span>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={handleQuickAdd}
                  className="px-4 py-3 rounded-xl text-xs font-bold bg-[#143E26] hover:bg-[#1B5233] text-white border border-[#DFB248]/40 transition-colors"
                >
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  className="px-5 py-3 rounded-xl text-xs font-bold bg-[#C59432] hover:bg-[#D4A33E] text-[#0A2416] transition-all flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95"
                >
                  <span>Buy Royal Hamper</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
};
