import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../services/base-api.js';
import { adminApi, setAdminStore } from '../services/admin.api.js';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, adminApi.middleware),
});

// Connect store to adminApi programmatic dispatcher
setAdminStore(store);

