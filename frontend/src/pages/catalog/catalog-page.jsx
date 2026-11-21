import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetProductsQuery, useGetCategoriesQuery } from '../../services/products.api.js';
import { CatalogHeader, CatalogGrid } from './components/index.js';
import { Tabs, Select, Badge, Button } from '../../components/ui/index.js';
import { RefreshCw } from 'lucide-react';

export const CatalogPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'featured';

  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sort);
    setSearchParams(newParams);
  };

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: products = [], isLoading } = useGetProductsQuery({
    category: selectedCategory,
    search: searchQuery,
    sort: sortBy,
  });

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setSearchParams({});
  };

  const categoryTabs = [
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
    <div className="bg-brand-canvas min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <CatalogHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Tabs
              tabs={categoryTabs}
              activeTab={selectedCategory}
              onChange={handleCategorySelect}
              variant="pills"
            />
          </div>

          <div className="w-48 self-end md:self-auto shrink-0">
            <Select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              options={sortOptions}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-brand-text-muted">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-brand-emerald">{products.length}</strong> harvest collections
            </span>
            {selectedCategory !== 'all' && (
              <Badge variant="origin" size="sm">
                Category: {selectedCategory}
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="gold" size="sm">
                Search: "{searchQuery}"
              </Badge>
            )}
          </div>

          {(selectedCategory !== 'all' || searchQuery || sortBy !== 'featured') && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleResetFilters}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-brand-text-subtle hover:text-brand-emerald"
            >
              Reset All Filters
            </Button>
          )}
        </div>

        <CatalogGrid
          products={products}
          isLoading={isLoading}
          onSelectProduct={(id) => navigate(`/prelaunch/product/${id}`)}
          onResetFilters={handleResetFilters}
        />
      </div>
    </div>
  );
};

export default CatalogPage;
