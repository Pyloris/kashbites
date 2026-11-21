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
    'AdminLeads',
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

    // Prelaunch VIP Leads
    getAdminLeads: builder.query({
      query: (params = {}) => ({
        url: '/prelaunch/leads',
        params,
      }),
      providesTags: ['AdminLeads'],
    }),
    updateAdminLeadStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/prelaunch/leads/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['AdminLeads', 'AdminStats'],
    }),
    deleteAdminLead: builder.mutation({
      query: (id) => ({
        url: `/prelaunch/leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminLeads', 'AdminStats'],
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
  useGetAdminLeadsQuery,
  useUpdateAdminLeadStatusMutation,
  useDeleteAdminLeadMutation,
} = adminApi;

// Internal fetch helper for direct async method invocations
const adminFetch = async (endpoint, options = {}) => {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const url = `${appConfig.api.baseUrl}${endpoint}`;
  try {
    const res = await fetch(url, { ...options, headers });
    return await res.json();
  } catch (err) {
    console.error(`adminFetch error on ${endpoint}:`, err);
    return { success: false, message: err?.message || 'Network error' };
  }
};

// Convenience direct async methods attached directly to adminApi
adminApi.login = (username, password) =>
  adminFetch('/admin/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
adminApi.getStats = () => adminFetch('/admin/stats');
adminApi.getProducts = () => adminFetch('/admin/products');
adminApi.createProduct = (data) =>
  adminFetch('/admin/products', { method: 'POST', body: JSON.stringify(data) });
adminApi.updateProduct = (id, data) =>
  adminFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
adminApi.deleteProduct = (id) =>
  adminFetch(`/admin/products/${id}`, { method: 'DELETE' });
adminApi.toggleProductStock = (id) =>
  adminFetch(`/admin/products/${id}/stock`, { method: 'PATCH' });
adminApi.bulkAdjustPrices = (percentage, category) =>
  adminFetch('/admin/products/bulk-price', { method: 'PUT', body: JSON.stringify({ percentage, category }) });
adminApi.getCategories = () => adminFetch('/admin/categories');
adminApi.createCategory = (data) =>
  adminFetch('/admin/categories', { method: 'POST', body: JSON.stringify(data) });
adminApi.deleteCategory = (id) =>
  adminFetch(`/admin/categories/${id}`, { method: 'DELETE' });
adminApi.getCoupons = () => adminFetch('/admin/coupons');
adminApi.createCoupon = (data) =>
  adminFetch('/admin/coupons', { method: 'POST', body: JSON.stringify(data) });
adminApi.updateCoupon = (id, data) =>
  adminFetch(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
adminApi.deleteCoupon = (id) =>
  adminFetch(`/admin/coupons/${id}`, { method: 'DELETE' });
adminApi.getOffers = () => adminFetch('/admin/offers');
adminApi.createOffer = (data) =>
  adminFetch('/admin/offers', { method: 'POST', body: JSON.stringify(data) });
adminApi.deleteOffer = (id) =>
  adminFetch(`/admin/offers/${id}`, { method: 'DELETE' });
adminApi.getOrders = () => adminFetch('/admin/orders');
adminApi.updateOrderStatus = (id, status, note) =>
  adminFetch(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) });
adminApi.cancelOrder = (id, reason) =>
  adminFetch(`/admin/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });
adminApi.getUsers = () => adminFetch('/admin/users');
adminApi.updateUserPassword = (id, newPassword) =>
  adminFetch(`/admin/users/${id}/password`, { method: 'PUT', body: JSON.stringify({ newPassword }) });
adminApi.getShippingConfig = () => adminFetch('/admin/shipping-config');
adminApi.updateShippingConfig = (data) =>
  adminFetch('/admin/shipping-config', { method: 'PUT', body: JSON.stringify(data) });
adminApi.pushOrderWebhook = (orderId) =>
  adminFetch(`/admin/shipping-config/push/${orderId}`, { method: 'POST' });
adminApi.uploadMedia = async (file, folder = 'products') => {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  try {
    const res = await fetch(`${appConfig.api.baseUrl}/media/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err?.message || 'Media upload error' };
  }
};
adminApi.getLeads = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return adminFetch(`/prelaunch/leads${qs ? `?${qs}` : ''}`);
};
adminApi.updateLeadStatus = (id, status) =>
  adminFetch(`/prelaunch/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
adminApi.deleteLead = (id) =>
  adminFetch(`/prelaunch/leads/${id}`, { method: 'DELETE' });

export default adminApi;
