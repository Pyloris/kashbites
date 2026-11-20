import { baseApi } from './base-api.js';
import { normalizeProduct } from './api.js';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category && params.category !== 'all') queryParams.set('category', params.category);
        if (params.search) queryParams.set('search', params.search);
        if (params.sort) queryParams.set('sort', params.sort);
        if (params.isCombo) queryParams.set('isCombo', 'true');
        if (params.featured) queryParams.set('featured', 'true');

        const queryString = queryParams.toString();
        return `/products${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response) => {
        const list = response?.data || [];
        return list.map(normalizeProduct);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Product', id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      transformResponse: (response) => {
        return response?.data ? normalizeProduct(response.data) : null;
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getCategories: builder.query({
      query: () => '/products/categories',
      transformResponse: (response) => response?.data || [],
      providesTags: ['Category'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
} = productsApi;
