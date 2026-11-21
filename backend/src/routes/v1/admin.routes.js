import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller.js';

const router = Router();

// 1. Admin Auth & Dashboard Stats
router.post('/auth/login', AdminController.adminLogin);
router.get('/stats', AdminController.getAdminDashboardStats);

// 2. Inventory & Products
router.get('/products', AdminController.adminGetProducts);
router.post('/products', AdminController.adminCreateProduct);
router.put('/products/bulk-price', AdminController.adminBulkAdjustPrices);
router.put('/products/:id', AdminController.adminUpdateProduct);
router.patch('/products/:id/stock', AdminController.adminToggleProductStock);
router.delete('/products/:id', AdminController.adminDeleteProduct);

// 3. Categories
router.get('/categories', AdminController.adminGetCategories);
router.post('/categories', AdminController.adminCreateCategory);
router.delete('/categories/:id', AdminController.adminDeleteCategory);

// 4. Coupons & Promotional Offers
router.get('/coupons', AdminController.adminGetCoupons);
router.post('/coupons', AdminController.adminCreateCoupon);
router.put('/coupons/:id', AdminController.adminUpdateCoupon);
router.delete('/coupons/:id', AdminController.adminDeleteCoupon);
router.get('/offers', AdminController.adminGetOffers);
router.post('/offers', AdminController.adminCreateOffer);
router.delete('/offers/:id', AdminController.adminDeleteOffer);

// 5. Shipping Provider Config & Outbound Push
router.get('/shipping-config', AdminController.adminGetShippingConfig);
router.put('/shipping-config', AdminController.adminUpdateShippingConfig);
router.post('/shipping-config/push/:orderId', AdminController.adminManualPushOrderWebhook);

// 6. Inbound Shipping Provider Webhook
router.post('/webhooks/shipping', AdminController.handleIncomingShippingWebhook);

// 7. Orders Management
router.get('/orders', AdminController.adminGetOrders);
router.patch('/orders/:id/status', AdminController.adminUpdateOrderStatus);
router.post('/orders/:id/cancel', AdminController.adminCancelOrder);

// 8. Customer Accounts & Password Management
router.get('/users', AdminController.adminGetUsers);
router.put('/users/:id/password', AdminController.adminUpdateUserPassword);

export default router;
