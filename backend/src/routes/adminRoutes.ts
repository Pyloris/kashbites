import { Router } from 'express';
import {
  adminLogin,
  getAdminDashboardStats,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminToggleProductStock,
  adminBulkAdjustPrices,
  adminDeleteProduct,
  adminGetCategories,
  adminCreateCategory,
  adminDeleteCategory,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  adminGetOffers,
  adminCreateOffer,
  adminDeleteOffer,
  adminGetShippingConfig,
  adminUpdateShippingConfig,
  adminManualPushOrderWebhook,
  handleIncomingShippingWebhook,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminCancelOrder,
  adminGetUsers,
  adminUpdateUserPassword,
} from '../controllers/adminController.js';

const router = Router();

// 1. Admin Auth & Dashboard
router.post('/admin/auth/login', adminLogin);
router.get('/admin/stats', getAdminDashboardStats);

// 2. Inventory & Products
router.get('/admin/products', adminGetProducts);
router.post('/admin/products', adminCreateProduct);
router.put('/admin/products/bulk-price', adminBulkAdjustPrices);
router.put('/admin/products/:id', adminUpdateProduct);
router.patch('/admin/products/:id/stock', adminToggleProductStock);
router.delete('/admin/products/:id', adminDeleteProduct);

// 3. Categories
router.get('/admin/categories', adminGetCategories);
router.post('/admin/categories', adminCreateCategory);
router.delete('/admin/categories/:id', adminDeleteCategory);

// 4. Coupons & Promotional Offers
router.get('/admin/coupons', adminGetCoupons);
router.post('/admin/coupons', adminCreateCoupon);
router.put('/admin/coupons/:id', adminUpdateCoupon);
router.delete('/admin/coupons/:id', adminDeleteCoupon);

router.get('/admin/offers', adminGetOffers);
router.post('/admin/offers', adminCreateOffer);
router.delete('/admin/offers/:id', adminDeleteOffer);

// 5. Shipping Provider Config & Outbound Push
router.get('/admin/shipping-config', adminGetShippingConfig);
router.put('/admin/shipping-config', adminUpdateShippingConfig);
router.post('/admin/shipping-config/push/:orderId', adminManualPushOrderWebhook);

// 6. Inbound Shipping Provider Webhook (authenticated via x-shipping-webhook-secret)
router.post('/webhooks/shipping', handleIncomingShippingWebhook);

// 7. Orders Management
router.get('/admin/orders', adminGetOrders);
router.patch('/admin/orders/:id/status', adminUpdateOrderStatus);
router.post('/admin/orders/:id/cancel', adminCancelOrder);

// 8. Customer Accounts & Password Management
router.get('/admin/users', adminGetUsers);
router.put('/admin/users/:id/password', adminUpdateUserPassword);

export default router;
