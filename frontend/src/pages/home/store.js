/**
 * Home Page Local State & Selectors
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCategory: 'all',
  sortBy: 'featured',
};

export const homeSlice = createSlice({
  name: 'homePage',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    resetFilters: (state) => {
      state.selectedCategory = 'all';
      state.sortBy = 'featured';
    },
  },
});

export const { setSelectedCategory, setSortBy, resetFilters } = homeSlice.actions;
export default homeSlice.reducer;
