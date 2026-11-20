import { baseApi } from './base-api.js';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email, password },
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation({
      query: ({ name, email, phone, password }) => ({
        url: '/auth/register',
        method: 'POST',
        body: { name, email, phone, password },
      }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      transformResponse: (response) => response?.data || null,
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    addAddress: builder.mutation({
      query: ({ userId, address }) => ({
        url: '/auth/addresses',
        method: 'POST',
        body: { userId, address },
      }),
      invalidatesTags: ['User'],
    }),
    deleteAddress: builder.mutation({
      query: ({ userId, addressId }) => ({
        url: `/auth/addresses/${userId}/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    setDefaultAddress: builder.mutation({
      query: ({ userId, addressId }) => ({
        url: `/auth/addresses/${userId}/${addressId}/default`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useAddAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = authApi;
