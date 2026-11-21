import React from 'react';
import { SectionHeader, Input } from '../../../components/ui/index.js';
import { Search } from 'lucide-react';

export const CatalogHeader = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-brand-sand">
      <div>
        <SectionHeader
          eyebrow="Direct-from-Kashmir Harvest Catalog"
          title="All Kashmiri Dry Fruits & Gifting Editions"
          subtitle="Pure single-origin Kagzi walnuts, Mamra almonds, sun-dried apricots, and royal emerald hampers. Handpicked in Shopian & Pulwama."
          align="left"
        />
      </div>

      <div className="w-full md:w-72 shrink-0">
        <Input
          type="text"
          placeholder="Search walnuts, saffron..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-brand-text-subtle" />}
        />
      </div>
    </div>
  );
};

export default CatalogHeader;
