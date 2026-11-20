import { baseApi } from './base-api.js';

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadMedia: builder.mutation({
      query: ({ file, folder = 'reviews' }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        return {
          url: '/media/upload',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response) => response?.data?.url || null,
    }),
  }),
  overrideExisting: false,
});

export const {
  useUploadMediaMutation,
} = mediaApi;
