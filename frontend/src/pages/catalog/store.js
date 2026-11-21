/**
 * Catalog Page Local State
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'featured',
};

export const catalogSlice = createSlice({
  name: 'catalogPage',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    resetCatalogFilters: (state) => {
      state.selectedCategory = 'all';
      state.searchQuery = '';
      state.sortBy = 'featured';
    },
  },
});

export const {
  setSelectedCategory,
  setSearchQuery,
  setSortBy,
  resetCatalogFilters,
} = catalogSlice.actions;

export default catalogSlice.reducer;
