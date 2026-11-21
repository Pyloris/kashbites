import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { useCart } from '../context/CartContext.jsx';
import {
  CartDrawer,
  CheckoutModal,
  OrderTrackingModal,
  AuthModal,
} from '../components/custom/index.js';

export const RootLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackedOrderNumber, setTrackedOrderNumber] = useState(undefined);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const currentView = location.pathname.startsWith('/prelaunch/profile')
    ? 'profile'
    : location.pathname.startsWith('/prelaunch/settings')
    ? 'settings'
    : location.pathname.startsWith('/prelaunch/catalog')
    ? 'catalog'
    : location.pathname.startsWith('/prelaunch/product')
    ? 'product'
    : location.pathname === '/prelaunch' || location.pathname === '/prelaunch/'
    ? 'home'
    : 'other';

  const handleNavigate = (view, param) => {
    if (view === 'admin') {
      navigate('/prelaunch/admin');
    } else if (view === 'profile') {
      navigate('/prelaunch/profile');
    } else if (view === 'settings') {
      navigate('/prelaunch/settings');
    } else if (view === 'about') {
      navigate('/prelaunch/about');
    } else if (view === 'contact') {
      navigate('/prelaunch/contact');
    } else if (view === 'privacy') {
      navigate('/prelaunch/privacy-policy');
    } else if (view === 'terms') {
      navigate('/prelaunch/terms');
    } else if (view === 'home') {
      navigate('/prelaunch');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'catalog') {
      navigate(param ? `/prelaunch/catalog?category=${param}` : '/prelaunch/catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOrderSuccess = (order) => {
    setTrackedOrderNumber(order?.orderNumber);
    setIsTrackingOpen(true);
  };

  const handleOpenTracking = (orderNum) => {
    if (orderNum) setTrackedOrderNumber(orderNum);
    setIsTrackingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-canvas text-brand-text-body">
      <Navbar
        onNavigate={handleNavigate}
        currentView={currentView}
        onOpenTracking={() => handleOpenTracking()}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      <main className="flex-1">
        <Outlet
          context={{
            searchQuery,
            setSearchQuery,
            openTracking: handleOpenTracking,
            openCheckout: () => setIsCheckoutOpen(true),
            handleNavigate,
          }}
        />
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenTracking={() => handleOpenTracking()}
      />

      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderNumber={trackedOrderNumber}
      />

      <AuthModal />
    </div>
  );
};

export default RootLayout;
