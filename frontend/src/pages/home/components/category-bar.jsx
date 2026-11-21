import React from 'react';
import { Tabs, Select } from '../../../components/ui/index.js';

export const CategoryBar = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
}) => {
  const tabItems = [
    { id: 'all', label: 'All Dry Fruits' },
    ...categories.map((c) => ({
      id: c.slug || c.id || c.name.toLowerCase(),
      label: c.name,
    })),
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured Harvest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
      <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <Tabs
          tabs={tabItems}
          activeTab={selectedCategory}
          onChange={onSelectCategory}
          variant="pills"
        />
      </div>

      <div className="w-48 self-end md:self-auto shrink-0">
        <Select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          options={sortOptions}
        />
      </div>
    </div>
  );
};

export default CategoryBar;
