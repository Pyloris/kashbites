import { IProduct, IOrder, IReview } from '../types/index.js';

const API_BASE = '/api';

const normalizeProduct = (raw: any): IProduct => {
  const images =
    Array.isArray(raw.images) && raw.images.length > 0
      ? raw.images
      : raw.primaryImage
      ? [raw.primaryImage]
      : ['/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg'];

  return {
    _id: raw._id || `prod-${Date.now()}`,
    name: raw.name || 'Kashmiri Dry Fruit',
    slug:
      raw.slug ||
      (raw.name ? raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'kashmiri-dry-fruit'),
    category: raw.category || 'Walnuts',
    tagline: raw.tagline || raw.subtitle || '100% Single-Origin Kashmir Valley Harvest',
    subtitle: raw.subtitle || raw.tagline || '100% Single-Origin Kashmir Valley Harvest',
    description:
      raw.description ||
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
    netWeights:
      Array.isArray(raw.netWeights) && raw.netWeights.length > 0
        ? raw.netWeights.map((nw: any) => ({
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

const normalizeOrder = (raw: any): IOrder => ({
  orderNumber: raw.orderNumber || raw.orderId || raw._id,
  orderId: raw.orderId || raw.orderNumber || raw._id,
  items: (raw.items || []).map((i: any) => ({
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

export const fetchProducts = async (params?: {
  category?: string;
  search?: string;
  sort?: string;
  isCombo?: boolean;
  featured?: boolean;
}): Promise<IProduct[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.isCombo) query.set('isCombo', 'true');
    if (params?.featured) query.set('featured', 'true');

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return (data.data || []).map(normalizeProduct);
  } catch (error) {
    console.warn('API error fetching products, using fallback:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<IProduct | null> => {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    const data = await res.json();
    return data.data ? normalizeProduct(data.data) : null;
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    return null;
  }
};

export const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/products/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
};

export const validateCouponApi = async (code: string, subtotal: number) => {
  try {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Could not validate coupon' };
  }
};

export const fetchReviews = async (productId: string): Promise<IReview[]> => {
  try {
    const res = await fetch(`${API_BASE}/reviews/${productId}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
};

export const submitReview = async (reviewData: {
  productId: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}): Promise<IReview | null> => {
  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error('Error submitting review:', error);
    return null;
  }
};

export const uploadMediaApi = async (
  file: File,
  folder: 'products' | 'reviews' | 'general' = 'reviews'
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image to MinIO');
    const data = await res.json();
    return data.data?.url || null;
  } catch (error) {
    console.error('Error uploading media to MinIO:', error);
    return null;
  }
};

export const submitOrder = async (orderPayload: {
  items: any[];
  shippingAddress: any;
  paymentMethod: string;
  couponCode?: string;
}): Promise<IOrder | null> => {
  try {
    const addr = orderPayload.shippingAddress || {};
    const subtotal = (orderPayload.items || []).reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const shippingFee = subtotal >= 999 ? 0 : 99;
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    });
    if (!res.ok) throw new Error('Failed to place order');
    const data = await res.json();
    return data.data ? normalizeOrder(data.data) : null;
  } catch (error) {
    console.error('Error submitting order:', error);
    return null;
  }
};

export const fetchOrders = async (): Promise<IOrder[]> => {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    return (data.data || []).map(normalizeOrder);
  } catch (error) {
    return [];
  }
};

// ================= USER & AUTHENTICATION APIS =================

export const loginApi = async (email: string, password: string) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Network error during login' };
  }
};

export const registerApi = async (name: string, email: string, phone: string, password: string) => {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Network error during registration' };
  }
};

export const getMeApi = async (token: string) => {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    return null;
  }
};

export const updateProfileApi = async (userData: any) => {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Failed to update profile' };
  }
};

export const addAddressApi = async (userId: string, address: any) => {
  try {
    const res = await fetch(`${API_BASE}/auth/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, address }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Failed to add address' };
  }
};

export const deleteAddressApi = async (userId: string, addressId: string) => {
  try {
    const res = await fetch(`${API_BASE}/auth/addresses/${userId}/${addressId}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Failed to delete address' };
  }
};

export const setDefaultAddressApi = async (userId: string, addressId: string) => {
  try {
    const res = await fetch(`${API_BASE}/auth/addresses/${userId}/${addressId}/default`, {
      method: 'PUT',
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Failed to set default address' };
  }
};

