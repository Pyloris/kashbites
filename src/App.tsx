import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { ProductDetailPage } from './components/product/ProductDetailPage.js';
import { CartDrawer } from './components/modals/CartDrawer.js';
import { CheckoutModal } from './components/modals/CheckoutModal.js';
import { OrderTrackingModal } from './components/modals/OrderTrackingModal.js';
import { fetchProductById } from './services/api.js';
import { IProduct, IOrder } from './types/index.js';

export function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'catalog'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackedOrderNumber, setTrackedOrderNumber] = useState<string | undefined>(undefined);

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

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'home') {
      setCurrentView('home');
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
        {currentView === 'product' && selectedProduct ? (
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
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
