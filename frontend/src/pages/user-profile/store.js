/**
 * User Profile Page Local State
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'profile',
};

export const userProfileSlice = createSlice({
  name: 'userProfilePage',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = userProfileSlice.actions;
export default userProfileSlice.reducer;
