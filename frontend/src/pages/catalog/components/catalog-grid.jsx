import React from 'react';
import { ProductCard } from '../../../components/custom/index.js';
import { Button } from '../../../components/ui/index.js';
import { Filter } from 'lucide-react';

export const CatalogGrid = ({
  products = [],
  isLoading,
  onSelectProduct,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-96 rounded-2xl bg-brand-sand/50 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-brand-sand space-y-4 max-w-lg mx-auto p-8 shadow-xs">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
          <Filter className="w-7 h-7 text-brand-emerald" />
        </div>
        <h3 className="font-serif-brand text-xl font-bold text-brand-text-display">
          No Dry Fruits Match Your Filters
        </h3>
        <p className="text-xs text-brand-text-muted">
          We couldn't find any single-origin collections matching your criteria. Try resetting filters or search for another dry fruit.
        </p>
        <Button variant="primary" size="sm" onClick={onResetFilters}>
          Reset Filters & Show All
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onSelect={onSelectProduct}
        />
      ))}
    </div>
  );
};

export default CatalogGrid;
