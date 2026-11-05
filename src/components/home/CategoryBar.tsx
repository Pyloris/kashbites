import React from 'react';

interface CategoryBarProps {
  categories: Array<{ id: string; name: string; count: number }>;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8DEC8]">
      
      {/* Category Tabs (Interactive Segmented Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#143E26] text-white shadow-xs'
                : 'bg-white text-[#4A5D4F] border border-[#E0D7C6] hover:bg-[#FAF4E6] hover:text-[#0E331E]'
            }`}
          >
            <span>{cat.name}</span>
            {cat.count > 0 && (
              <span
                className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === cat.id
                    ? 'bg-[#DFB248] text-[#0A2416] font-bold'
                    : 'bg-[#EFE7D8] text-[#697E70]'
                }`}
              >
                {cat.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sort Selector */}
      <div className="flex items-center gap-2 shrink-0 text-xs">
        <span className="text-[#6D8072] font-medium">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-white border border-[#D5CABB] rounded-lg px-2.5 py-1.5 text-xs text-[#143E26] font-semibold outline-none cursor-pointer focus:border-[#143E26]"
        >
          <option value="featured">Featured Harvest</option>
          <option value="rating">Top Rated (5★)</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

    </div>
  );
};
