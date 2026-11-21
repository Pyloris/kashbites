import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../../components/ui/index.js';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Search, ShoppingBag, UserCheck, Sparkles, X, User, Settings } from 'lucide-react';

export const Navbar = ({
  onNavigate,
  currentView,
  onOpenTracking,
  onSearchChange,
  searchQuery,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');
  const isCatalog =
    location.pathname.startsWith('/prelaunch/catalog') ||
    location.pathname.startsWith('/catalog') ||
    currentView === 'catalog';

  const activeView =
    currentView ||
    (location.pathname.startsWith('/prelaunch/profile') || location.pathname.startsWith('/profile')
      ? 'profile'
      : location.pathname.startsWith('/prelaunch/product') || location.pathname.startsWith('/product')
      ? 'product'
      : isCatalog
      ? 'catalog'
      : 'home');

  const isHomeActive =
    activeView === 'home' &&
    (!location.pathname ||
      location.pathname === '/prelaunch' ||
      location.pathname === '/prelaunch/' ||
      location.pathname === '/');
  const isCategoryActive = (category) =>
    activeView === category || (isCatalog && currentCategory === category);

  const handleNav =
    onNavigate ||
    ((view, param) => {
      if (view === 'admin') navigate('/prelaunch/admin');
      else if (view === 'profile') navigate('/prelaunch/profile');
      else if (view === 'settings') navigate('/prelaunch/settings');
      else if (view === 'home') navigate('/prelaunch');
      else if (view === 'catalog') {
        navigate(param ? `/prelaunch/catalog?category=${param}` : '/prelaunch/catalog');
      }
    });

  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, setIsAuthModalOpen } = useAuth();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <>
      {/* Editorial Announcement Bar */}
      <div className="bg-brand-emerald-deep text-brand-sand-light px-4 py-2 text-xs border-b border-brand-emerald-forest text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-brand-gold-bright shrink-0" />
        <span>Fresh Autumn 2026 Harvest from Shopian & Pulwama · Free Air Courier on orders over ₹999</span>
        <span className="hidden md:inline text-brand-sand-dark">
          · Use code <strong className="text-brand-gold-bright font-bold">KASHMIR10</strong> for 10% off
        </span>
      </div>

      {/* Primary Sticky Top Bar */}
      <header className="sticky top-0 z-40 bg-brand-canvas/95 backdrop-blur-md border-b border-brand-sand transition-shadow duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6 md:gap-8">
          {/* Brand Wordmark */}
          <div onClick={() => handleNav('home')} className="cursor-pointer shrink-0 transition-opacity hover:opacity-90">
            <Logo size="md" variant="dark" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-brand-text-body">
            <button
              onClick={() => handleNav('home')}
              className={`hover:text-brand-emerald-dark transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer border-b-2 ${
                isHomeActive
                  ? 'text-brand-emerald-dark font-semibold border-brand-emerald'
                  : 'border-transparent'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('catalog', 'walnuts')}
              className={`hover:text-brand-emerald-dark transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer border-b-2 ${
                isCategoryActive('walnuts')
                  ? 'text-brand-emerald-dark font-semibold border-brand-emerald'
                  : 'border-transparent'
              }`}
            >
              Kashmiri Walnuts
            </button>
            <button
              onClick={() => handleNav('catalog', 'almonds')}
              className={`hover:text-brand-emerald-dark transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer border-b-2 ${
                isCategoryActive('almonds')
                  ? 'text-brand-emerald-dark font-semibold border-brand-emerald'
                  : 'border-transparent'
              }`}
            >
              Mamra Almonds
            </button>
            <button
              onClick={() => handleNav('catalog', 'apricots')}
              className={`hover:text-brand-emerald-dark transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer border-b-2 ${
                isCategoryActive('apricots')
                  ? 'text-brand-emerald-dark font-semibold border-brand-emerald'
                  : 'border-transparent'
              }`}
            >
              Sun-Dried Apricots
            </button>
            <button
              onClick={() => handleNav('catalog', 'combos')}
              className={`hover:text-brand-emerald-dark transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer border-b-2 flex items-center gap-1.5 text-brand-gold-deep font-semibold ${
                isCategoryActive('combos')
                  ? 'border-brand-gold-deep'
                  : 'border-transparent'
              }`}
            >
              <span>Emerald Gift Box</span>
              <span className="text-[10px] bg-brand-gold-subtle text-brand-gold-dark px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">Royal</span>
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Input Box */}
            <div className="relative">
              {isSearchExpanded ? (
                <div className="flex items-center bg-white border border-brand-gold rounded-full px-3 py-1.5 shadow-sm w-48 sm:w-64 transition-all">
                  <Search className="w-4 h-4 text-brand-sand-dark mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search walnuts, almonds..."
                    className="w-full text-xs bg-transparent border-none outline-none text-brand-emerald placeholder:text-brand-text-subtle"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsSearchExpanded(false);
                      onSearchChange('');
                    }}
                    className="text-brand-text-subtle hover:text-brand-emerald ml-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  aria-label="Search KashBites"
                  className="p-2 text-brand-text-body hover:text-brand-emerald-dark hover:bg-brand-sand-light rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              )}
            </div>

            {/* Profile or Login Button */}
            {!isAuthenticated ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-emerald/40 hover:border-brand-emerald bg-white hover:bg-brand-emerald-tint text-brand-emerald font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNav('profile')}
                  title="My KashBites Profile"
                  className={`flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full transition-all border cursor-pointer ${
                    activeView === 'profile'
                      ? 'bg-brand-emerald text-brand-text-light border-brand-gold-bright shadow-xs'
                      : 'bg-brand-emerald-tint hover:bg-brand-emerald-light border-brand-emerald/30 text-brand-emerald'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-brand-emerald text-brand-gold-bright font-bold text-[10px] flex items-center justify-center font-serif-brand">
                    {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline max-w-[80px] truncate">
                    {user?.name ? user.name.split(' ')[0] : 'Profile'}
                  </span>
                </button>
              </div>
            )}

            {/* Shopping Bag CTA */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-brand-text-light px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm shadow-sm transition-all hover:shadow active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-brand-gold-bright" />
              <span className="font-semibold tracking-wide">Cart</span>
              {totalItemsCount > 0 && (
                <span className="ml-0.5 bg-brand-gold-bright text-brand-emerald-dark font-bold text-xs px-1.5 py-0.5 rounded-full leading-none min-w-5 text-center">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
