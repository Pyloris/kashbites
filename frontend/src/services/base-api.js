import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { appConfig } from '../config/app-config.js';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: appConfig.api.baseUrl,
    prepareHeaders: (headers) => {
      try {
        const token = localStorage.getItem(appConfig.storage.authTokenKey);
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch {
        // Ignore localStorage errors in restricted environments
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Category', 'Order', 'User', 'Review'],
  endpoints: () => ({}),
});
