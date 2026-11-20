import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { ProductDetailPage } from './components/product/ProductDetailPage.js';
import { UserProfilePage } from './pages/UserProfilePage.js';
import { AdminPanelPage } from './pages/AdminPanelPage.js';
import { CartDrawer } from './components/modals/CartDrawer.js';
import { CheckoutModal } from './components/modals/CheckoutModal.js';
import { OrderTrackingModal } from './components/modals/OrderTrackingModal.js';
import { AuthModal } from './components/modals/AuthModal.js';
import { fetchProductById } from './services/api.js';
import { IProduct, IOrder } from './types/index.js';

export function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'catalog' | 'profile' | 'admin'>(() =>
    window.location.pathname.startsWith('/admin') ? 'admin' : 'home'
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackedOrderNumber, setTrackedOrderNumber] = useState<string | undefined>(undefined);
  const [storefrontRefreshKey, setStorefrontRefreshKey] = useState(0);

  // Sync browser back/forward navigation for /admin
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load product if view changes to product
  useEffect(() => {
    if (selectedProductId) {
      fetchProductById(selectedProductId).then((p) => {
        if (p) setSelectedProduct(p);
      });
    }
  }, [selectedProductId]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string, _param?: string) => {
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState({}, '', '/');
    }
    if (view === 'home') {
      setCurrentView('home');
      setSelectedProductId(null);
      setStorefrontRefreshKey((k) => k + 1);
    } else if (view === 'profile') {
      setCurrentView('profile');
      setSelectedProductId(null);
    } else if (view === 'catalog') {
      setCurrentView('home');
      const el = document.getElementById('products-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: IOrder) => {
    setTrackedOrderNumber(order.orderNumber);
  };

  if (currentView === 'admin') {
    return (
      <AdminPanelPage
        onBackToStorefront={() => {
          window.history.pushState({}, '', '/');
          setStorefrontRefreshKey((k) => k + 1);
          setCurrentView('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1B291E]">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar
        onNavigate={handleNavigate}
        currentView={currentView}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentView === 'profile' ? (
          <UserProfilePage
            onBackToShop={() => {
              setCurrentView('home');
            }}
            onTrackOrder={(orderNum) => {
              setTrackedOrderNumber(orderNum);
              setIsTrackingOpen(true);
            }}
          />
        ) : currentView === 'product' && selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => {
              setCurrentView('home');
              setSelectedProductId(null);
            }}
            onSelectProduct={handleSelectProduct}
          />
        ) : (
          <HomePage
            key={storefrontRefreshKey}
            onSelectProduct={handleSelectProduct}
            onNavigateToCatalog={(cat) => handleNavigate('catalog', cat)}
            searchQuery={searchQuery}
          />
        )}
      </main>

      {/* Heritage Kashmiri Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Modals & Slide-overs */}
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
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

