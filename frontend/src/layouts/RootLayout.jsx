import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { CartDrawer } from '../components/modals/CartDrawer.jsx';
import { CheckoutModal } from '../components/modals/CheckoutModal.jsx';
import { OrderTrackingModal } from '../components/modals/OrderTrackingModal.jsx';
import { AuthModal } from '../components/modals/AuthModal.jsx';

export const RootLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackedOrderNumber, setTrackedOrderNumber] = useState(undefined);

  // Scroll to top automatically when location path changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const currentView = location.pathname.startsWith('/profile')
    ? 'profile'
    : location.pathname.startsWith('/product')
      ? 'product'
      : 'home';

  const handleNavigate = (view, param) => {
    if (view === 'admin') {
      navigate('/admin');
    } else if (view === 'profile') {
      navigate('/profile');
    } else if (view === 'home') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'catalog') {
      if (location.pathname !== '/') {
        navigate(param ? `/?category=${param}` : '/');
      } else {
        if (param) {
          navigate(`/?category=${param}`);
        }
        const el = document.getElementById('products-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
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
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1B291E]">
      {/* Top Navigation */}
      <Navbar
        onNavigate={handleNavigate}
        currentView={currentView}
        onOpenTracking={() => handleOpenTracking()}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Main Routed Content */}
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

      {/* Heritage Kashmiri Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenTracking={() => handleOpenTracking()}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Tracking & Batch Verification Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderNumber={trackedOrderNumber}
      />

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
};
