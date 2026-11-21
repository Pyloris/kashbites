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
        email: raw.customer?.email || '',
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
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.email) queryParams.append('email', params.email);
        if (params?.customerId) queryParams.append('customerId', params.customerId);
        const qs = queryParams.toString();
        return `/orders${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response) => (response?.data || []).map(normalizeOrder),
      providesTags: ['Order'],
    }),

    submitOrder: builder.mutation({
      query: (orderPayload) => {
        const addr = orderPayload.shippingAddress || {};
        return {
          url: '/orders',
          method: 'POST',
          body: {
            items: orderPayload.items,
            shippingAddress: {
              fullName: addr.fullName,
              phone: addr.phone,
              email: addr.email,
              addressLine1: addr.addressLine1,
              addressLine2: addr.addressLine2 || '',
              city: addr.city || 'Srinagar',
              state: addr.state || 'Jammu & Kashmir',
              pincode: addr.pincode || '190001',
            },
            paymentMethod: orderPayload.paymentMethod || 'COD',
            couponCode: orderPayload.couponCode,
            source: orderPayload.source || 'cart',
          },
        };
      },
      transformResponse: (response) => (response?.data ? normalizeOrder(response.data) : null),
      invalidatesTags: ['Order'],
    }),

    initiateRazorpayOrder: builder.mutation({
      query: ({ items, shippingAddress, couponCode, source }) => ({
        url: '/orders/razorpay/create-order',
        method: 'POST',
        body: { items, shippingAddress, couponCode, source },
      }),
    }),

    verifyRazorpayPayment: builder.mutation({
      query: (payload) => ({
        url: '/orders/razorpay/verify-payment',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response) => (response?.data ? response.data : null),
      invalidatesTags: ['Order'],
    }),

    cancelTemporaryOrder: builder.mutation({
      query: (payload) => ({
        url: '/orders/razorpay/cancel',
        method: 'POST',
        body: payload,
      }),
    }),

    getTemporaryOrderStatus: builder.query({
      query: (id) => `/orders/temporary/${id}`,
      transformResponse: (response) => (response?.data ? response.data : null),
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
  useInitiateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useCancelTemporaryOrderMutation,
  useGetTemporaryOrderStatusQuery,
  useValidateCouponMutation,
} = ordersApi;

export default ordersApi;
