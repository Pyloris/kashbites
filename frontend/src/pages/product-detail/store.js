/**
 * Product Detail Page Local State Slice
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedWeight: '500g',
  quantity: 1,
  selectedImageIndex: 0,
  isCertModalOpen: false,
  isVideoModalOpen: false,
  showReviewForm: false,
};

export const productDetailSlice = createSlice({
  name: 'productDetailPage',
  initialState,
  reducers: {
    setSelectedWeight: (state, action) => {
      state.selectedWeight = action.payload;
    },
    setQuantity: (state, action) => {
      state.quantity = action.payload;
    },
    setSelectedImageIndex: (state, action) => {
      state.selectedImageIndex = action.payload;
    },
    setCertModalOpen: (state, action) => {
      state.isCertModalOpen = action.payload;
    },
    setVideoModalOpen: (state, action) => {
      state.isVideoModalOpen = action.payload;
    },
    setShowReviewForm: (state, action) => {
      state.showReviewForm = action.payload;
    },
  },
});

export const {
  setSelectedWeight,
  setQuantity,
  setSelectedImageIndex,
  setCertModalOpen,
  setVideoModalOpen,
  setShowReviewForm,
} = productDetailSlice.actions;

export default productDetailSlice.reducer;
