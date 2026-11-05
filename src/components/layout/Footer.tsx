import React from 'react';
import { Logo } from '../common/Logo.js';
import { MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenTracking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTracking }) => {
  return (
    <footer className="bg-[#081F12] text-[#D3CABB] border-t border-[#1C472E] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Origin Story */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="md" />
            
            <p className="text-xs text-[#CBD8D0] leading-relaxed max-w-sm mt-3">
              KashBites brings the authentic, untamed taste of Kashmir directly to your family table. Centennial orchard walnuts, organic Mamra almonds, and royal festive hampers packed with care in Srinagar.
            </p>

            <div className="flex items-start gap-2.5 text-xs text-[#9BB1A3] pt-2">
              <MapPin className="w-4 h-4 text-[#DFB248] shrink-0 mt-0.5" />
              <span>
                Packaging Atelier: Industrial Estate, Sanat Nagar, Srinagar, Jammu & Kashmir – 190005
              </span>
            </div>
          </div>

          {/* Col 2: Pure Dry Fruits Catalog */}
          <div>
            <h4 className="font-serif-brand text-sm font-bold text-[#FAF7F2] uppercase tracking-wider mb-3">
              Pure Dry Fruits
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'walnuts')}
                  className="hover:text-white transition-colors"
                >
                  Kagzi Kashmiri Walnuts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'almonds')}
                  className="hover:text-white transition-colors"
                >
                  Mamra Badam Giri
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'apricots')}
                  className="hover:text-white transition-colors"
                >
                  Sun-Dried Apricots (Khubani)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'kernels')}
                  className="hover:text-white transition-colors"
                >
                  Extra Light Walnut Kernels
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'mixes')}
                  className="hover:text-white transition-colors"
                >
                  Royal Nut & Fruit Medley
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Signature Gifts & Trust */}
          <div>
            <h4 className="font-serif-brand text-sm font-bold text-[#FAF7F2] uppercase tracking-wider mb-3">
              Gifting & Purity
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'combos')}
                  className="hover:text-[#DFB248] transition-colors flex items-center gap-1.5"
                >
                  <span>Emerald Gift Box</span>
                  <span className="text-[9px] bg-[#DFB248] text-[#0A2416] px-1 py-0.2 rounded font-bold">New</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', 'combos')}
                  className="hover:text-white transition-colors"
                >
                  Valley Orchard Trio
                </button>
              </li>
              <li>
                <button onClick={onOpenTracking} className="hover:text-white transition-colors">
                  Batch Lab Certificate Check
                </button>
              </li>
              <li>
                <button onClick={onOpenTracking} className="hover:text-white transition-colors">
                  Track Air Courier Dispatch
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Sourcing & Newsletter */}
          <div>
            <h4 className="font-serif-brand text-sm font-bold text-[#FAF7F2] uppercase tracking-wider mb-3">
              Harvest Updates
            </h4>
            <p className="text-[11px] text-[#A6BAAD] mb-3 leading-relaxed">
              Subscribe for alerts when fresh autumn walnut & almond batches arrive in Srinagar.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full text-xs p-2 rounded-lg bg-[#0F311E] border border-[#215637] text-white placeholder:text-[#678271] outline-none focus:border-[#DFB248]"
              />
              <button
                type="button"
                onClick={() => alert('Thank you for subscribing to KashBites harvest alerts!')}
                className="w-full py-2 bg-[#C59432] hover:bg-[#D4A33E] text-[#0A2416] font-bold rounded-lg text-xs transition-colors"
              >
                Join Harvest List
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#163824] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#869E8F]">
          <div className="flex items-center gap-2">
            <span>© 2026 KashBites Agro Pvt Ltd. All rights reserved.</span>
            <span>·</span>
            <span className="text-[#DFB248]">FSSAI Lic. No: 11026999000142</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-[#DFB248] fill-[#DFB248]" />
              <span>in the Kashmir Valley</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
