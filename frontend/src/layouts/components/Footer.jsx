import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../../components/ui/index.js';
import { MapPin, Heart } from 'lucide-react';
import { appConfig } from '../../config/app-config.js';

export const Footer = ({ onNavigate, onOpenTracking }) => {
  const navigate = useNavigate();
  const handleNav =
    onNavigate ||
    ((view, param) => {
      if (view === 'admin') navigate('/prelaunch/admin');
      else if (view === 'profile') navigate('/prelaunch/profile');
      else if (view === 'settings') navigate('/prelaunch/settings');
      else if (view === 'about') navigate('/prelaunch/about');
      else if (view === 'contact') navigate('/prelaunch/contact');
      else if (view === 'privacy') navigate('/prelaunch/privacy-policy');
      else if (view === 'terms') navigate('/prelaunch/terms');
      else if (view === 'home') navigate('/prelaunch');
      else if (view === 'catalog') {
        navigate(param ? `/prelaunch/catalog?category=${param}` : '/prelaunch/catalog');
      }
    });

  return (
    <footer className="bg-brand-emerald-darker text-brand-sand-medium border-t border-brand-emerald/30 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Brand & Origin Story */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="md" />

            <p className="text-xs text-brand-sand-light leading-relaxed max-w-sm mt-3">
              KashBites brings the authentic, untamed taste of Kashmir directly to your family table. Centennial orchard walnuts, organic Mamra almonds, and royal festive hampers packed with care in Srinagar.
            </p>

            <div className="flex items-start gap-2.5 text-xs text-brand-text-subtle pt-2">
              <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <span>
                Packaging Atelier: Industrial Growth Centre, Sanat Nagar, Srinagar, Jammu & Kashmir – 190005
              </span>
            </div>
          </div>

          {/* Col 2: Pure Dry Fruits Catalog */}
          <div>
            <h4 className="font-serif-brand text-sm font-bold text-brand-text-light uppercase tracking-wider mb-3">
              Pure Dry Fruits
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('catalog', 'walnuts')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Kagzi Kashmiri Walnuts
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('catalog', 'almonds')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Mamra Badam Giri
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('catalog', 'apricots')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Sun-Dried Apricots (Khubani)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('catalog', 'combos')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Royal Gift Hampers
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('catalog', 'all')}
                  className="hover:text-brand-gold transition-colors font-semibold cursor-pointer"
                >
                  Browse Full Catalog →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Signature Gifts & Trust */}
          <div>
            <h4 className="font-serif-brand text-sm font-bold text-brand-text-light uppercase tracking-wider mb-3">
              Kashmir Heritage & Help
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/prelaunch/about" className="hover:text-brand-gold transition-colors">
                  Our Provenance Story
                </Link>
              </li>
              <li>
                <Link to="/prelaunch/contact" className="hover:text-white transition-colors">
                  Contact Srinagar Hub
                </Link>
              </li>
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Track Air Courier Dispatch
                </button>
              </li>
              <li>
                <Link to="/prelaunch/privacy-policy" className="hover:text-white transition-colors">
                  Privacy & Data Policy
                </Link>
              </li>
              <li>
                <Link to="/prelaunch/terms" className="hover:text-white transition-colors">
                  Terms & 100% Guarantee
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Sourcing & Newsletter */}
          <div>
            <h4 className="font-serif-brand text-sm font-bold text-brand-text-light uppercase tracking-wider mb-3">
              Harvest Updates
            </h4>
            <p className="text-[11px] text-brand-sand-light mb-3 leading-relaxed">
              Subscribe for alerts when fresh autumn walnut & almond batches arrive in Srinagar.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full text-xs p-2 rounded-lg bg-brand-emerald-dark border border-brand-emerald/50 text-white placeholder:text-brand-text-subtle outline-none focus:border-brand-gold"
              />
              <button
                type="button"
                onClick={() => alert('Thank you for subscribing to KashBites harvest alerts!')}
                className="w-full py-2 bg-brand-gold hover:bg-brand-gold-light text-brand-emerald-darker font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Join Harvest List
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-brand-emerald/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-brand-text-subtle">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} {appConfig.brand.companyName}. All rights reserved.</span>
            <span>·</span>
            <span className="text-brand-gold">{appConfig.brand.fssai.fullDisplay}</span>
            <span>·</span>
            <Link to="/prelaunch/privacy-policy" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link to="/prelaunch/terms" className="hover:underline">Terms</Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
              <span>in the Kashmir Valley</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
