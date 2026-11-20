import { baseApi } from './base-api.js';

export const normalizeOrder = (raw) => ({
    orderNumber: raw.orderNumber || raw.orderId || raw._id,
    orderId: raw.orderId || raw.orderNumber || raw._id,
    items: (raw.items || []).map((i) => ({
        productId: i.productId,
        name: i.name,
        weight: i.weight,
        price: Number(i.price),
        quantity: Number(i.quantity),
        image: i.image || '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg',
        slug: i.slug || '',
    })),
    shippingAddress: raw.shippingAddress || {
        fullName: raw.customer?.fullName || 'Customer',
        phone: raw.customer?.phone || '',
        addressLine1: raw.customer?.address || '',
        city: raw.customer?.city || 'Srinagar',
        state: raw.customer?.state || 'Jammu & Kashmir',
        pincode: raw.customer?.pincode || '190001',
    },
    paymentMethod: raw.paymentMethod || 'COD',
    paymentStatus: raw.paymentStatus || 'Pending',
    orderStatus: raw.orderStatus || 'Confirmed',
    trackingNumber: raw.trackingNumber,
    courierName: raw.courierName,
    subtotal: Number(raw.subtotal ?? raw.totalAmount ?? 0),
    shippingFee: Number(raw.shippingFee ?? 0),
    discount: Number(raw.discount ?? 0),
    total: Number(raw.total ?? raw.totalAmount ?? 0),
    createdAt: raw.createdAt || new Date().toISOString(),
});

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: () => '/orders',
      transformResponse: (response) => (response?.data || []).map(normalizeOrder),
      providesTags: ['Order'],
    }),
    submitOrder: builder.mutation({
      query: (orderPayload) => {
        const addr = orderPayload.shippingAddress || {};
        const subtotal = (orderPayload.items || []).reduce(
          (sum, item) => sum + Number(item.price) * Number(item.quantity),
          0
        );
        const shippingFee = subtotal >= 999 ? 0 : 99;
        return {
          url: '/orders',
          method: 'POST',
          body: {
            customer: {
              fullName: addr.fullName || 'Customer',
              email: addr.email || 'customer@kashbites.in',
              phone: addr.phone || '+91 9876543210',
              address: [addr.addressLine1, addr.addressLine2].filter(Boolean).join(', '),
              city: addr.city || 'Srinagar',
              state: addr.state || 'Jammu & Kashmir',
              pincode: addr.pincode || '190001',
            },
            items: orderPayload.items,
            subtotal,
            shippingFee,
            totalAmount: subtotal + shippingFee,
            couponCode: orderPayload.couponCode,
            paymentMethod: orderPayload.paymentMethod === 'CARD' ? 'Card' : orderPayload.paymentMethod,
          },
        };
      },
      transformResponse: (response) => (response?.data ? normalizeOrder(response.data) : null),
      invalidatesTags: ['Order'],
    }),
    validateCoupon: builder.mutation({
      query: ({ code, subtotal }) => ({
        url: '/coupons/validate',
        method: 'POST',
        body: { code, subtotal },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useSubmitOrderMutation,
  useValidateCouponMutation,
} = ordersApi;
