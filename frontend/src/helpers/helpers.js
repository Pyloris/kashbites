import { appConfig } from '../config/app-config.js';

// ==========================================
// Storage Keys
// ==========================================
export const STORE_TOKEN_KEY = appConfig?.storage?.authTokenKey || 'kashbites_auth_token';
export const STORE_CART_KEY = 'kashbites_cart';
export const ADMIN_TOKEN_KEY = 'kashbites_admin_token';
export const ADMIN_SESSION_KEY = 'kashbites_admin_session';

// ==========================================
// Customer Store Auth & Token Helpers
// ==========================================
export const getStoreToken = () => {
  try {
    return localStorage.getItem(STORE_TOKEN_KEY) || '';
  } catch (err) {
    console.error('Failed to read store token from localStorage:', err);
    return '';
  }
};

export const setStoreToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(STORE_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(STORE_TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to save store token to localStorage:', err);
  }
};

export const clearStoreToken = () => {
  try {
    localStorage.removeItem(STORE_TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear store token from localStorage:', err);
  }
};

// Aliases for customer store auth
export const getAuthToken = getStoreToken;
export const setAuthToken = setStoreToken;
export const clearAuthToken = clearStoreToken;

// ==========================================
// Admin Auth & Session Helpers
// ==========================================
export const getAdminToken = () => {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch (err) {
    console.error('Failed to read admin token from localStorage:', err);
    return '';
  }
};

export const getAdminSession = () => {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to parse admin session from localStorage:', err);
    return null;
  }
};

export const setAdminAuth = (token, adminUser) => {
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
    if (adminUser) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
    }
  } catch (err) {
    console.error('Failed to save admin auth to localStorage:', err);
  }
};

export const clearAdminAuth = () => {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear admin auth from localStorage:', err);
  }
};
