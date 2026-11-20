import { baseApi } from './base-api.js';

export const normalizeProduct = (raw) => {
    const images = Array.isArray(raw.images) && raw.images.length > 0
        ? raw.images
        : raw.primaryImage
            ? [raw.primaryImage]
            : ['/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg'];
    return {
        _id: raw._id || `prod-${Date.now()}`,
        name: raw.name || 'Kashmiri Dry Fruit',
        slug: raw.slug ||
            (raw.name ? raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'kashmiri-dry-fruit'),
        category: raw.category || 'Walnuts',
        tagline: raw.tagline || raw.subtitle || '100% Single-Origin Kashmir Valley Harvest',
        subtitle: raw.subtitle || raw.tagline || '100% Single-Origin Kashmir Valley Harvest',
        description: raw.description ||
            'Hand-selected from Kashmiri valley orchards and nitrogen-sealed for lasting freshness.',
        price: Number(raw.price ?? 499),
        originalPrice: Number(raw.originalPrice ?? Math.round(Number(raw.price ?? 499) * 1.2)),
        discountBadge: raw.discountBadge,
        promotionalOfferTag: raw.promotionalOfferTag || raw.discountBadge,
        rating: Number(raw.rating ?? 4.9),
        reviewCount: Number(raw.reviewCount ?? raw.reviewsCount ?? 42),
        reviewsCount: Number(raw.reviewsCount ?? raw.reviewCount ?? 42),
        images,
        primaryImage: raw.primaryImage || images[0],
        netWeights: Array.isArray(raw.netWeights) && raw.netWeights.length > 0
            ? raw.netWeights.map((nw) => ({
                weight: nw.weight,
                price: Number(nw.price),
                inStock: nw.inStock !== false,
            }))
            : [{ weight: '500g', price: Number(raw.price ?? 499), inStock: raw.inStock !== false }],
        nutrition: raw.nutrition || {
            calories: '654 kcal',
            protein: '15.2g',
            healthyFats: '65.2g',
            carbs: '13.7g',
            fiber: '6.7g',
        },
        certificate: raw.certificate || {
            certificateNumber: raw.certificateCode || `JK-ORG-${raw.batchCode || '2026'}`,
            issuedBy: 'Sher-e-Kashmir Quality & FSSAI Lab, Srinagar',
            labTestDate: 'November 2026',
            purityScore: '99.8% Pure Single-Origin',
            moistureLevel: '< 3.8% (Optimal Crispness)',
            aflatoxinStatus: 'Non-Detectable (Passed)',
            originDistrict: raw.origin || 'Shopian & Pampore, Kashmir',
            harvestSeason: raw.harvestSeason || 'Autumn 2026',
        },
        packagingVideo: raw.packagingVideo || {
            title: 'Srinagar Cold-Storage Nitrogen Sealing & Grading',
            duration: '0:45',
            thumbnail: images[0],
            facilityLocation: 'Khonmoh Industrial Estate, Srinagar, J&K',
            cleanlinessStandard: 'ISO 22000 & FSSAI Gold Hygiene Certified',
            steps: [
                'Optical & hand-grading by Kashmiri orchard artisans',
                'UV-C sterilization and moisture lock verification',
                'Food-grade nitrogen flushing in 3-layer barrier stand-up pouches',
            ],
        },
        badges: raw.badges || [
            '100% Kashmir Origin',
            raw.promotionalOfferTag || raw.discountBadge || 'Direct from Growers',
        ],
        featured: raw.featured !== false,
        isCombo: Boolean(raw.isCombo),
        inStock: raw.inStock !== false,
        stockQuantity: Number(raw.stockQuantity ?? (raw.inStock === false ? 0 : 50)),
    };
};

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
