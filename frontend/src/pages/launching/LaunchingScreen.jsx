import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Phone,
  ArrowRight,
  ShieldCheck,
  Award,
  Lock,
  Share2,
  Heart,
  Clock,
  Package,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '../../components/ui/index.js';
import { appConfig } from '../../config/app-config.js';

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91', minDigits: 10, maxDigits: 10 },
  { code: '+971', label: '🇦🇪 +971', minDigits: 9, maxDigits: 9 },
  { code: '+1', label: '🇺🇸 +1', minDigits: 10, maxDigits: 10 },
  { code: '+44', label: '🇬🇧 +44', minDigits: 10, maxDigits: 11 },
  { code: '+966', label: '🇸🇦 +966', minDigits: 9, maxDigits: 9 },
];

const HARVEST_PREVIEWS = [
  {
    name: 'Kagzi Walnuts',
    origin: 'Shopian Orchards',
    highlight: '68% Omega-3 Oil',
  },
  {
    name: 'Mamra Badam',
    origin: 'Pulwama Groves',
    highlight: 'Single-Origin Reserve',
  },
  {
    name: 'Sun-Dried Khubani',
    origin: 'Ladakh Valley',
    highlight: 'Zero Sulphur Bleach',
  },
  {
    name: 'Emerald Hamper',
    origin: appConfig.brand.atelierName || 'Srinagar Atelier',
    highlight: '6 Hermetic Jars',
  },
];

export const LaunchingScreen = () => {
  const navigate = useNavigate();

  // Country and Form States
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('All Harvest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Launch Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 18,
    minutes: 42,
    seconds: 15,
  });

  // Check if previously submitted in this browser
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kashbites_prelaunch_lead');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.submitted || parsed?.couponCode || parsed?.phone) {
          setIsSubmitted(true);
          if (parsed?.phone) setPhoneNumber(parsed.phone);
        }
      }
    } catch {
      // ignore localStorage reading errors
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  // Countdown clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanDigits || cleanDigits.length < 8) {
      setErrorMessage('Please enter a valid WhatsApp mobile number.');
      return;
    }

    if (countryCode === '+91' && cleanDigits.length !== 10) {
      setErrorMessage('Please enter a 10-digit Indian mobile number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiEndpoint = `${appConfig.api.baseUrl}/prelaunch/lead`;
      await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanDigits,
          countryCode,
          name: visitorName.trim(),
          source: 'launching_screen',
          interest: selectedInterest,
        }),
      });

      setIsSubmitted(true);

      // Save to localStorage
      try {
        localStorage.setItem(
          'kashbites_prelaunch_lead',
          JSON.stringify({
            phone: `${countryCode} ${cleanDigits}`,
            name: visitorName,
            submitted: true,
            timestamp: new Date().toISOString(),
          })
        );
      } catch {
        // localStorage not available
      }
    } catch (err) {
      console.warn('Backend lead submission fallback:', err);
      setIsSubmitted(true);
      try {
        localStorage.setItem(
          'kashbites_prelaunch_lead',
          JSON.stringify({
            phone: `${countryCode} ${cleanDigits}`,
            name: visitorName,
            submitted: true,
            timestamp: new Date().toISOString(),
          })
        );
      } catch {
        // ignore
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareText = encodeURIComponent(
    `Exclusive Prelaunch Access: Authentic Himalayan walnuts, Mamra almonds & festive dry fruits from ${appConfig.brand.name}! Register for early launch access: ${window.location.origin}`
  );

  return (
    <div className="min-h-screen min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-brand-emerald-darker text-brand-sand-light font-sans selection:bg-brand-gold selection:text-brand-emerald-deep relative flex flex-col justify-between">
      {/* Background Ambience & Kashmiri Atmospheric Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle Himalayan mountain silhouette / hero texture at very low opacity */}
        <div
          className="absolute inset-0 opacity-[0.06] bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/hero/hero1.png')` }}
        ></div>
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-emerald/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-brand-gold/15 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-brand-emerald/30 rounded-full blur-[120px]"></div>
        {/* Subtle radial pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #DFB248 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        ></div>
      </div>

      {/* 1. Header (Compact Single-Line) */}
      <header className="relative z-10 shrink-0 border-b border-brand-emerald/40 bg-brand-emerald-deep/90 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo variant="light" size="sm" />
          {/* <span className="hidden md:inline-block h-4 w-[1px] bg-brand-emerald/60"></span> */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-brand-sand-medium">
            {/* <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold-bright"></span>
            </span> */}
            {/* <span>{appConfig.brand.atelierName} Harvest Dispatch · Final Preparations</span> */}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-brand-emerald/60 border border-brand-gold/30 text-brand-gold-bright">
            <Award className="w-3 h-3 text-brand-gold" />
            <span className="hidden sm:inline">100% Single-Origin Kashmir</span>
            <span className="sm:hidden">Single-Origin</span>
          </span>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8 items-center">
          
          {/* Left Column: Brand Story, Headline & Countdown (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-4">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-emerald/80 border border-brand-gold/40 text-brand-gold-bright text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase shadow-sm self-start">
              <Sparkles className="w-3 h-3 text-brand-gold-bright shrink-0" />
              <span>Autumn 2026 Harvest · Grand Launch Imminent</span>
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.18] sm:leading-[1.12]">
                The Authentic Taste of Kashmir Is Getting Ready to Launch
              </h1>
              <p className="text-xs sm:text-sm text-brand-sand-light/85 leading-relaxed max-w-xl font-normal">
                Centennial orchard Kagzi walnuts, cold-shelled Mamra almonds, and royal festive hampers
                direct from our {appConfig.brand.originCity} packaging atelier. 100% pure, unbleached, and chemical-free.
              </p>
            </div>

            {/* Live Countdown Clock */}
            <div className="bg-brand-emerald-deep/70 backdrop-blur-md border border-brand-emerald/60 rounded-2xl p-2.5 sm:p-3 shadow-md max-w-lg w-full">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-brand-gold-bright font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-brand-gold" />
                  <span>Launch Countdown</span>
                </span>
                <span className="text-[10px] text-brand-sand-medium/80">Doors opening soon</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-brand-emerald-darker/90 border border-brand-gold/30 rounded-xl py-1.5 sm:py-2 text-center"
                  >
                    <div className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-brand-gold-bright leading-none">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-brand-sand-medium uppercase font-medium tracking-wider mt-0.5">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Harvest Highlights Mini Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg w-full">
              {HARVEST_PREVIEWS.map((item, i) => (
                <div
                  key={i}
                  className="bg-brand-emerald-deep/50 border border-brand-emerald/50 rounded-xl px-2.5 py-1.5 text-left"
                >
                  <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                  <div className="text-[9px] text-brand-gold truncate">{item.highlight}</div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-[11px] text-brand-sand-medium/90">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>Zero Bleach</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>Air Courier Dispatch</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>{appConfig.brand.fssai.label}</span>
              </span>
            </div>
          </div>

          {/* Right Column: WhatsApp VIP Access & Coupon Capture (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-brand-emerald/90 backdrop-blur-xl border-2 border-brand-gold/45 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              {/* Decorative Corner Glow */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-brand-gold/15 rounded-full blur-xl pointer-events-none"></div>

              {isCheckingStatus ? (
                /* Skeleton Loader while checking status */
                <div className="space-y-3.5 animate-pulse py-1">
                  {/* Header Skeleton */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-emerald-deep/80 border border-brand-emerald/60 shrink-0"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-brand-emerald-deep/90 rounded w-3/4"></div>
                      <div className="h-3 bg-brand-emerald-deep/70 rounded w-1/2"></div>
                    </div>
                  </div>

                  {/* Selector Pills Skeleton */}
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-brand-emerald-deep/70 rounded w-1/3"></div>
                    <div className="flex gap-1.5">
                      <div className="h-6 w-16 bg-brand-emerald-deep/80 rounded-full"></div>
                      <div className="h-6 w-16 bg-brand-emerald-deep/80 rounded-full"></div>
                      <div className="h-6 w-20 bg-brand-emerald-deep/80 rounded-full"></div>
                    </div>
                  </div>

                  {/* Name Input Skeleton */}
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-brand-emerald-deep/70 rounded w-1/4"></div>
                    <div className="h-8 bg-brand-emerald-deep/90 border border-brand-emerald/60 rounded-xl w-full"></div>
                  </div>

                  {/* Phone Input Skeleton */}
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-brand-emerald-deep/70 rounded w-1/3"></div>
                    <div className="flex gap-1.5">
                      <div className="h-8 w-20 bg-brand-emerald-deep/90 border border-brand-emerald/60 rounded-xl"></div>
                      <div className="h-8 flex-1 bg-brand-emerald-deep/90 border border-brand-emerald/60 rounded-xl"></div>
                    </div>
                  </div>

                  {/* Button Skeleton */}
                  <div className="h-10 bg-brand-gold/20 border border-brand-gold/30 rounded-xl w-full mt-2"></div>
                </div>
              ) : !isSubmitted ? (
                <div>
                  {/* Card Header */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                        Receive Launch Coupon on WhatsApp
                      </h3>
                      <p className="text-[11px] sm:text-xs text-brand-sand-light/80">
                        Get <strong className="text-brand-gold-bright font-bold">20% OFF</strong> & priority harvest allocation on launch morning.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                    {/* Interest Selector Pills */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-brand-sand-medium font-semibold mb-1">
                        Select Harvest Interest:
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {[
                          'All Harvest',
                          'Walnuts',
                          'Mamra Badam',
                          'Royal Hamper',
                        ].map((interest) => (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => setSelectedInterest(interest)}
                            className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                              selectedInterest === interest
                                ? 'bg-brand-gold text-brand-emerald-deep font-bold border-brand-gold shadow-xs'
                                : 'bg-brand-emerald-deep/70 text-brand-sand-light border-brand-emerald/60 hover:border-brand-gold/40'
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visitor Name (Optional) */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-brand-sand-medium font-semibold mb-1">
                        Your Full Name <span className="text-brand-sand-medium/60">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="e.g. Tariq Ahmad"
                        className="w-full px-3 py-2 rounded-xl bg-brand-emerald-deep/90 border border-brand-emerald/70 focus:border-brand-gold text-xs text-white placeholder:text-brand-sand-medium/50 outline-none transition-colors"
                      />
                    </div>

                    {/* WhatsApp Mobile Number */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-brand-sand-medium font-semibold mb-1">
                        WhatsApp Mobile Number <span className="text-brand-gold-bright">*</span>
                      </label>
                      <div className="flex gap-1.5">
                        {/* Country Code Picker */}
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="px-2.5 py-2 rounded-xl bg-brand-emerald-deep/90 border border-brand-emerald/70 focus:border-brand-gold text-xs text-white outline-none shrink-0 cursor-pointer"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code} className="bg-brand-emerald-deep text-white">
                              {c.label}
                            </option>
                          ))}
                        </select>

                        {/* Phone Input */}
                        <div className="relative flex-1 min-w-0">
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder={`e.g. ${appConfig.brand.contact.phonePlaceholder}`}
                            className="w-full px-3 py-2 rounded-xl bg-brand-emerald-deep/90 border border-brand-emerald/70 focus:border-brand-gold text-xs text-white placeholder:text-brand-sand-medium/50 outline-none transition-colors"
                          />
                        </div>
                      </div>
                      {errorMessage && (
                        <p className="text-[11px] text-red-300 mt-1 flex items-center gap-1">
                          <span>⚠️</span> {errorMessage}
                        </p>
                      )}
                    </div>

                    {/* Submit CTA */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-brand-gold hover:bg-brand-gold-bright active:scale-[0.99] text-brand-emerald-deep font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-brand-gold/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 text-center"
                    >
                      {isSubmitting ? (
                        <span>Registering for VIP Access...</span>
                      ) : (
                        <>
                          <Phone className="w-3.5 h-3.5 fill-brand-emerald-deep shrink-0" />
                          <span>Get 20% OFF Coupon on WhatsApp</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-brand-sand-medium/70">
                      🔒 Zero spam. We message you only on launch morning with your coupon & link.
                    </p>
                  </form>
                </div>
              ) : (
                /* Success State */
                <div className="text-center py-2 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      Phone Number Submitted
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1.5">
                      Submitted Successfully!
                    </h3>
                  </div>

                  {/* Launch Day Notification Confirmation Card */}
                  <div className="bg-brand-emerald-deep/90 border border-brand-gold/40 rounded-xl p-3.5 max-w-sm mx-auto shadow-inner space-y-1.5">
                    <div className="flex items-center justify-center gap-1.5 text-brand-gold-bright text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Launch Day Access</span>
                    </div>
                    <p className="text-xs text-brand-sand-light/90 leading-relaxed">
                      Your phone number has been registered. You will receive your launch code directly on WhatsApp on launch day.
                    </p>
                  </div>

                  {/* Share with Friends on WhatsApp */}
                  <div className="pt-0.5">
                    <a
                      href={`https://wa.me/?text=${shareText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share with Friends on WhatsApp</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* 3. Footer (Single-Line Compact Bar) */}
      <footer className="relative z-10 shrink-0 border-t border-brand-emerald/40 bg-brand-emerald-deep/95 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-2 text-[11px] text-brand-sand-medium flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
          <span>© {new Date().getFullYear()} {appConfig.brand.companyName || appConfig.brand.name}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{appConfig.brand.packagingAtelier || appConfig.brand.address}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
          <span>Inquiries: <a href={`mailto:${appConfig.brand.contact.email}`} className="text-brand-gold hover:underline">{appConfig.brand.contact.email}</a></span>
          {/* <span>·</span> */}
          <span className="flex items-center gap-1">
            {/* <span>Crafted with</span>
            <Heart className="w-3 h-3 text-brand-gold fill-brand-gold" />
            <span>in Kashmir</span> */}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LaunchingScreen;
