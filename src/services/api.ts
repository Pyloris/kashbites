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

