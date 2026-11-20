import React, { useState, useEffect } from 'react';
import { IProduct } from '../types/index.js';
import { fetchProducts, fetchCategories } from '../services/api.js';
import { HeroBanner } from '../components/home/HeroBanner.js';
import { TrustSection } from '../components/home/TrustSection.js';
import { CategoryBar } from '../components/home/CategoryBar.js';
import { ProductCard } from '../components/product/ProductCard.js';
import { SignatureBoxBanner } from '../components/home/SignatureBoxBanner.js';
import { KashmirOriginStory } from '../components/home/KashmirOriginStory.js';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onSelectProduct: (productId: string) => void;
  onNavigateToCatalog: (category?: string) => void;
  searchQuery: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onNavigateToCatalog,
  searchQuery,
}) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchProducts({
        category: selectedCategory,
        search: searchQuery,
        sort: sortBy,
      }),
      fetchCategories(),
    ]).then(([prodData, catData]) => {
      setProducts(prodData);
      setCategories(catData);
      setIsLoading(false);
    });
  }, [selectedCategory, sortBy, searchQuery]);

  const signatureProduct = products.find((p) => p.slug === 'signature-collection-emerald-box') || products[0];

  return (
    <div className="bg-[#FAF7F2]">
      {/* 1. Big Pleasing Hero Section */}
      <HeroBanner
        onExplore={(cat) => {
          if (cat) setSelectedCategory(cat);
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectProduct={onSelectProduct}
      />

      {/* 2. Trust Pillars Bar (Extracted from Packaging) */}
      <TrustSection />

      {/* 3. Products, Offers & Categories Section */}
      <section id="products-section" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C59432] block mb-1">
              Fresh 2026 Valley Harvest
            </span>
            <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#0E331E]">
              Explore Authentic Kashmiri Dry Fruits
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#5B6E60] max-w-md">
            Handpicked from the orchards of Shopian, Pulwama, and Ganderbal. Cold-vacuum packed in Srinagar with certified zero-bleach purity.
          </p>
        </div>

        {/* Category Tabs & Sorting */}
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-xl bg-[#EBE4D5] animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DEC8]">
            <p className="text-sm font-semibold text-[#143E26]">No dry fruits matched your search.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
              }}
              className="mt-3 px-4 py-2 bg-[#143E26] text-white rounded-lg text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}

      </section>

      {/* 4. Signature Royal Emerald Gift Hamper Spotlight */}
      <SignatureBoxBanner
        comboProduct={signatureProduct}
        onSelectProduct={onSelectProduct}
      />

      {/* 5. Provenance & Harvest Heritage Story */}
      <KashmirOriginStory />

    </div>
  );
};
