import React, { useState } from 'react';
import { Logo } from '../common/Logo.js';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { Search, ShoppingBag, UserCheck, Sparkles, X, User } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string, param?: string) => void;
  currentView: string;
  onOpenTracking: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentView,
  onOpenTracking,
  onSearchChange,
  searchQuery,
}) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, setIsAuthModalOpen } = useAuth();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <>
      {/* Editorial Announcement Bar */}
      <div className="bg-[#0B2516] text-[#E7DECD] px-4 py-2 text-xs border-b border-[#1A422B] text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#DFB248] shrink-0" />
        <span>Fresh Autumn 2026 Harvest from Shopian & Pulwama · Free Air Courier on orders over ₹999</span>
        <span className="hidden md:inline text-[#A08E72]">· Use code <strong className="text-[#DFB248] font-bold">KASHMIR10</strong> for 10% off</span>
      </div>

      {/* Primary Sticky Top Bar - Top Bar Contract: 3 Zones */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DEC8] transition-shadow duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6 md:gap-8">
          
          {/* ZONE 1: Brand Wordmark */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer shrink-0 transition-opacity hover:opacity-90"
          >
            <Logo size="md" variant="dark" />
          </div>

          {/* ZONE 2: 4-5 Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#293B2E]">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-[#0E331E] transition-colors whitespace-nowrap shrink-0 pb-1 ${
                currentView === 'home' ? 'text-[#0E331E] font-semibold border-b-2 border-[#143E26]' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('catalog', 'walnuts')}
              className="hover:text-[#0E331E] transition-colors whitespace-nowrap shrink-0"
            >
              Kashmiri Walnuts
            </button>
            <button
              onClick={() => onNavigate('catalog', 'almonds')}
              className="hover:text-[#0E331E] transition-colors whitespace-nowrap shrink-0"
            >
              Mamra Almonds
            </button>
            <button
              onClick={() => onNavigate('catalog', 'apricots')}
              className="hover:text-[#0E331E] transition-colors whitespace-nowrap shrink-0"
            >
              Sun-Dried Apricots
            </button>
            <button
              onClick={() => onNavigate('catalog', 'combos')}
              className="hover:text-[#0E331E] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-[#976B13] font-semibold"
            >
              <span>Emerald Gift Box</span>
              <span className="text-[10px] bg-[#F3E7C4] text-[#865908] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">Royal</span>
            </button>
          </nav>

          {/* ZONE 3: Search, Track/Profile & Cart Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Input Box */}
            <div className="relative">
              {isSearchExpanded ? (
                <div className="flex items-center bg-white border border-[#C59432] rounded-full px-3 py-1.5 shadow-sm w-48 sm:w-64 transition-all">
                  <Search className="w-4 h-4 text-[#8C7A60] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search walnuts, almonds..."
                    className="w-full text-xs bg-transparent border-none outline-none text-[#143E26] placeholder:text-[#9C8F7A]"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsSearchExpanded(false);
                      onSearchChange('');
                    }}
                    className="text-[#9C8F7A] hover:text-[#143E26] ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  aria-label="Search KashBites"
                  className="p-2 text-[#2D4534] hover:text-[#0E331E] hover:bg-[#EFE6D5] rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              )}
            </div>

            {/* Track Orders */}
            <button
              onClick={onOpenTracking}
              className="p-2 text-[#2D4534] hover:text-[#0E331E] hover:bg-[#EFE6D5] rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Track Order / Batch Verification"
            >
              <UserCheck className="w-4 h-4 text-[#143E26]" />
              <span className="hidden md:inline">Track</span>
            </button>

            {/* Profile or Login Button */}
            {!isAuthenticated ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#143E26]/40 hover:border-[#143E26] bg-white hover:bg-[#EAF2EC] text-[#143E26] font-bold text-xs transition-all shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('profile')}
                title="My KashBites Profile"
                className={`flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full transition-all border ${
                  currentView === 'profile'
                    ? 'bg-[#143E26] text-[#FAF7F2] border-[#DFB248] shadow-xs'
                    : 'bg-[#EAF2EC] hover:bg-[#D9E7DC] border-[#143E26]/30 text-[#143E26]'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#143E26] text-[#DFB248] font-bold text-[10px] flex items-center justify-center font-serif-brand">
                  {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-bold hidden sm:inline max-w-[80px] truncate">
                  {user?.name ? user.name.split(' ')[0] : 'Profile'}
                </span>
              </button>
            )}

            {/* Shopping Bag CTA */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#143E26] hover:bg-[#0D2D1B] text-[#FAF7F2] px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm shadow-sm transition-all hover:shadow active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-[#DFB248]" />
              <span className="font-semibold tracking-wide">Cart</span>
              {totalItemsCount > 0 && (
                <span className="ml-0.5 bg-[#DFB248] text-[#0E331E] font-bold text-xs px-1.5 py-0.5 rounded-full leading-none min-w-5 text-center">
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
