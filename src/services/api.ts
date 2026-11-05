import { IProduct, IOrder, IReview } from '../types/index.js';

const API_BASE = '/api';

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
    return data.data || [];
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
    return data.data || null;
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

export const submitOrder = async (orderPayload: {
  items: any[];
  shippingAddress: any;
  paymentMethod: string;
  couponCode?: string;
}): Promise<IOrder | null> => {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (!res.ok) throw new Error('Failed to place order');
    const data = await res.json();
    return data.data || null;
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
    return data.data || [];
  } catch (error) {
    return [];
  }
};
