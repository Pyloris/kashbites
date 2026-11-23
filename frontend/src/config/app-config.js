/**
 * KashBites Frontend Application Configuration
 */

const isLocal =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IS_LOCAL === 'true') ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IS_LOCAL === true);

export const appConfig = {
  // API Configuration
  api: {
    baseUrl:
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
      (isLocal ? 'http://localhost:5000/api' : 'https://kashbites.com/api'),
    timeout: 15000,
  },

  // Brand & Origin Details
  brand: {
    name: import.meta.env.VITE_BRAND_NAME || 'KashBites',
    companyName: import.meta.env.VITE_COMPANY_NAME || 'KashBites',
    legalName: import.meta.env.VITE_BRAND_LEGAL_NAME || 'KashBites',
    tagline: import.meta.env.VITE_BRAND_TAGLINE || 'A Taste of Kashmir | Premium Dry Fruits',
    origin: import.meta.env.VITE_BRAND_ORIGIN || 'Ganderbal, Kashmir Valley',
    originCity: import.meta.env.VITE_BRAND_ORIGIN_CITY || 'Srinagar',
    atelierName: import.meta.env.VITE_ATELIER_NAME || 'Ganderbal Atelier',
    address: import.meta.env.VITE_COMPANY_ADDRESS || 'Ganderbal, Jammu & Kashmir – 191131',
    atelierAddress: import.meta.env.VITE_ATELIER_ADDRESS || 'Ganderbal, Jammu & Kashmir – 191131',
    packagingAtelier: import.meta.env.VITE_PACKAGING_ATELIER || 'Ganderbal, Jammu & Kashmir – 191131',
    contact: {
      phone: import.meta.env.VITE_CONTACT_PHONE || '+91 98765 43210',
      phonePlaceholder: '98765 43210',
      phoneDisplay: '+91 98765 43210',
      email: import.meta.env.VITE_CONTACT_EMAIL || 'hello@kashbites.com',
      supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@kashbites.com',
    },
    fssai: {
      licenseNumber: import.meta.env.VITE_FSSAI_LICENSE || '11026999000142',
      label: 'FSSAI Certified',
      fullDisplay: 'FSSAI Lic. No: 11026999000142',
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
    minioPublicUrl: import.meta.env.VITE_MINIO_PUBLIC_URL || (isLocal ? 'http://localhost:9000' : 'https://kashbites.com:9000'),
    defaultProductImage: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg',
  },

  // Payment Gateway Configuration
  razorpay: {
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_U2mH2Akaz5tMoi',
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
    isLocal,
  },
};

// Convenient Named Exports
export const API_BASE_URL = appConfig.api.baseUrl;
export const MINIO_PUBLIC_URL = appConfig.media.minioPublicUrl;
export const STORAGE_KEYS = appConfig.storage;
export const COMMERCE_CONFIG = appConfig.commerce;
export const BRAND_CONFIG = appConfig.brand;
export const IS_LOCAL = isLocal;

export default appConfig;
