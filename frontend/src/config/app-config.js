/**
 * KashBites Frontend Application Configuration
 */

export const appConfig = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000',
    timeout: 15000,
  },

  // Brand & Origin Details
  brand: {
    name: import.meta.env.VITE_BRAND_NAME || 'KashBites',
    tagline: import.meta.env.VITE_BRAND_TAGLINE || 'A Taste of Kashmir | Premium Dry Fruits',
    origin: 'Srinagar, Kashmir Valley',
    atelierAddress: 'Industrial Estate, Sanat Nagar, Srinagar, Jammu & Kashmir – 190005',
    contact: {
      phone: '+91 98765 43210',
      email: 'hello@kashbites.in',
      supportEmail: 'support@kashbites.in',
    },
  },

  // Browser Storage Keys
  storage: {
    authTokenKey: 'kashbites_auth_token',
    cartKey: 'kashbites_cart',
    adminSessionKey: 'kashbites_admin_session',
  },

  // Media & Asset Storage
  media: {
    minioPublicUrl: import.meta.env.VITE_MINIO_PUBLIC_URL || '',
    defaultProductImage: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg',
  },

  // E-Commerce & Shipping Defaults
  commerce: {
    currency: 'INR',
    currencySymbol: '₹',
    freeShippingThreshold: 999,
    standardShippingFee: 99,
    defaultPromoCode: 'KASHMIR10',
    defaultDiscountPercent: 10,
  },

  // Harvest & Quality Standards
  harvest: {
    season: 'Autumn 2026',
    certificationLab: 'Sher-e-Kashmir Quality & FSSAI Lab, Srinagar',
    qualityScore: '99.8% Pure Single-Origin',
  },

  // Environment Runtime Flags
  env: {
    mode: import.meta.env.MODE,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
  },
};

// Convenient Named Exports
export const API_BASE_URL = appConfig.api.baseUrl;
export const STORAGE_KEYS = appConfig.storage;
export const COMMERCE_CONFIG = appConfig.commerce;

export default appConfig;
