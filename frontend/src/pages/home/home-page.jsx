import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { useGetProductsQuery, useGetCategoriesQuery } from '../../services/products.api.js';
import {
  HeroSection,
  TrustSection,
  CategoryBar,
  SignatureBoxBanner,
  KashmirOriginStory,
} from './components/index.js';
import { ProductCard } from '../../components/custom/index.js';
import { Button, SectionHeader } from '../../components/ui/index.js';

export const HomePage = ({ onSelectProduct, onNavigateToCatalog, searchQuery }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const outletContext = useOutletContext() || {};

  const effectiveSearchQuery = searchQuery ?? outletContext.searchQuery ?? '';
  const handleSelectProduct =
    onSelectProduct || outletContext.onSelectProduct || ((id) => navigate(`/product/${id}`));

  const urlCategory = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: products = [], isLoading } = useGetProductsQuery({
    category: selectedCategory,
    search: effectiveSearchQuery,
    sort: sortBy,
  });

  const signatureProduct =
    products.find((p) => p.slug === 'signature-collection-emerald-box') || products[0];

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
  };

  const handleHeroExplore = (cat) => {
    if (cat) setSelectedCategory(cat);
    const el = document.getElementById('products-section');
    el?.scrollIntoView({ behavior: 'smooth' });
    if (onNavigateToCatalog) {
      onNavigateToCatalog(cat);
    }
  };

  return (
    <div className="bg-brand-canvas">
      {/* 1. Hero Section */}
      <HeroSection onExplore={handleHeroExplore} onSelectProduct={handleSelectProduct} />

      {/* 2. Trust Pillars Bar */}
      <TrustSection />

      {/* 3. Products, Offers & Categories Section */}
      <section id="products-section" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <SectionHeader
            eyebrow="Fresh 2026 Valley Harvest"
            title="Explore Authentic Kashmiri Dry Fruits"
            align="left"
          />

          <p className="text-xs sm:text-sm text-brand-text-muted max-w-md">
            Handpicked from the orchards of Shopian, Pulwama, and Ganderbal. Cold-vacuum packed in Srinagar with certified zero-bleach purity.
          </p>
        </div>

        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-brand-sand/50 animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-brand-sand">
            <p className="text-sm font-semibold text-brand-emerald">No dry fruits matched your search.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="mt-3"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onSelect={handleSelectProduct} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Signature Royal Emerald Gift Hamper Spotlight */}
      <SignatureBoxBanner comboProduct={signatureProduct} onSelectProduct={handleSelectProduct} />

      {/* 5. Provenance & Harvest Heritage Story */}
      <KashmirOriginStory />
    </div>
  );
};

export default HomePage;
