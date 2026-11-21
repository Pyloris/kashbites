/**
 * User Settings Page Local State
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'account',
};

export const userSettingsSlice = createSlice({
  name: 'userSettingsPage',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = userSettingsSlice.actions;
export default userSettingsSlice.reducer;
