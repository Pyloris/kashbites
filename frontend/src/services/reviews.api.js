import { baseApi } from './base-api.js';

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: (productId) => `/reviews/${productId}`,
      transformResponse: (response) => response?.data || [],
      providesTags: (result, error, productId) => [{ type: 'Review', id: productId }],
    }),
    submitReview: builder.mutation({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      transformResponse: (response) => response?.data || null,
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: productId },
        'Product',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReviewsQuery,
  useSubmitReviewMutation,
} = reviewsApi;
