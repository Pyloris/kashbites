import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { appConfig } from '../config/app-config.js';
import { getAdminToken, setAdminAuth, clearAdminAuth, getAdminSession } from '../helpers/helpers.js';

// Re-export token & session helpers so existing modules importing from admin.api.js continue working
export {
  getAdminToken,
  getAdminSession,
  setAdminAuth,
  clearAdminAuth,
  getStoreToken,
  setStoreToken,
  clearStoreToken,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
} from '../helpers/helpers.js';

let _store = null;
export const setAdminStore = (storeInstance) => {
  _store = storeInstance;
};

/**
 * RTK Query API for Admin functionalities
 */
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: appConfig.api.baseUrl,
    prepareHeaders: (headers) => {
      const token = getAdminToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'AdminStats',
    'AdminProducts',
    'AdminCategories',
    'AdminCoupons',
    'AdminOffers',
    'AdminOrders',
    'AdminUsers',
    'AdminWebhooks',
  ],
  endpoints: (builder) => ({
    // Auth
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/admin/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Dashboard Stats
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),

    // Products / Inventory
    getAdminProducts: builder.query({
      query: () => '/admin/products',
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ _id }) => ({ type: 'AdminProducts', id: _id })),
              { type: 'AdminProducts', id: 'LIST' },
            ]
          : [{ type: 'AdminProducts', id: 'LIST' }],
    }),
    createAdminProduct: builder.mutation({
      query: (productData) => ({
        url: '/admin/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: [{ type: 'AdminProducts', id: 'LIST' }, 'AdminStats'],
    }),
    updateAdminProduct: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/admin/products/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminProducts', id },
        { type: 'AdminProducts', id: 'LIST' },
      ],
    }),
    deleteAdminProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'AdminProducts', id },
        { type: 'AdminProducts', id: 'LIST' },
        'AdminStats',
      ],
    }),
    toggleAdminProductStock: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}/stock`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'AdminProducts', id },
        { type: 'AdminProducts', id: 'LIST' },
      ],
    }),
    bulkAdjustAdminPrices: builder.mutation({
      query: ({ percentage, category }) => ({
        url: '/admin/products/bulk-price',
        method: 'PUT',
        body: { percentage, category },
      }),
      invalidatesTags: [{ type: 'AdminProducts', id: 'LIST' }],
    }),

    // Categories
    getAdminCategories: builder.query({
      query: () => '/admin/categories',
      providesTags: ['AdminCategories'],
    }),
    createAdminCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/admin/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['AdminCategories'],
    }),
    deleteAdminCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminCategories'],
    }),

    // Coupons
    getAdminCoupons: builder.query({
      query: () => '/admin/coupons',
      providesTags: ['AdminCoupons'],
    }),
    createAdminCoupon: builder.mutation({
      query: (couponData) => ({
        url: '/admin/coupons',
        method: 'POST',
        body: couponData,
      }),
      invalidatesTags: ['AdminCoupons'],
    }),
    updateAdminCoupon: builder.mutation({
      query: ({ id, ...couponData }) => ({
        url: `/admin/coupons/${id}`,
        method: 'PUT',
        body: couponData,
      }),
      invalidatesTags: ['AdminCoupons'],
    }),
    deleteAdminCoupon: builder.mutation({
      query: (id) => ({
        url: `/admin/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminCoupons'],
    }),

    // Promotional Offers
    getAdminOffers: builder.query({
      query: () => '/admin/offers',
      providesTags: ['AdminOffers'],
    }),
    createAdminOffer: builder.mutation({
      query: (offerData) => ({
        url: '/admin/offers',
        method: 'POST',
        body: offerData,
      }),
      invalidatesTags: ['AdminOffers'],
    }),
    deleteAdminOffer: builder.mutation({
      query: (id) => ({
        url: `/admin/offers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminOffers'],
    }),

    // Shipping & Webhooks
    getAdminShippingConfig: builder.query({
      query: () => '/admin/shipping-config',
      providesTags: ['AdminWebhooks'],
    }),
    updateAdminShippingConfig: builder.mutation({
      query: (configData) => ({
        url: '/admin/shipping-config',
        method: 'PUT',
        body: configData,
      }),
      invalidatesTags: ['AdminWebhooks'],
    }),
    pushOrderWebhook: builder.mutation({
      query: (orderId) => ({
        url: `/admin/shipping-config/push/${orderId}`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminOrders', 'AdminWebhooks'],
    }),

    // Orders
    getAdminOrders: builder.query({
      query: () => '/admin/orders',
      providesTags: ['AdminOrders'],
    }),
    updateAdminOrderStatus: builder.mutation({
      query: ({ id, status, note }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status, note },
      }),
      invalidatesTags: ['AdminOrders', 'AdminStats'],
    }),
    cancelAdminOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/orders/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['AdminOrders', 'AdminStats'],
    }),

    // Users
    getAdminUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['AdminUsers'],
    }),
    updateAdminUserPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `/admin/users/${id}/password`,
        method: 'PUT',
        body: { newPassword },
      }),
      invalidatesTags: ['AdminUsers'],
    }),

    // Media Upload
    uploadAdminMedia: builder.mutation({
      query: ({ file, folder = 'products' }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        return {
          url: '/media/upload',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

// Export auto-generated hooks
export const {
  useAdminLoginMutation,
  useGetAdminStatsQuery,
  useGetAdminProductsQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useToggleAdminProductStockMutation,
  useBulkAdjustAdminPricesMutation,
  useGetAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useGetAdminCouponsQuery,
  useCreateAdminCouponMutation,
  useUpdateAdminCouponMutation,
  useDeleteAdminCouponMutation,
  useGetAdminOffersQuery,
  useCreateAdminOfferMutation,
  useDeleteAdminOfferMutation,
  useGetAdminShippingConfigQuery,
  useUpdateAdminShippingConfigMutation,
  usePushOrderWebhookMutation,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
  useCancelAdminOrderMutation,
  useGetAdminUsersQuery,
  useUpdateAdminUserPasswordMutation,
  useUploadAdminMediaMutation,
} = adminApi;

export default adminApi;
