import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller.js';
import { PrelaunchController } from '../../controllers/prelaunch.controller.js';
import { auth } from '../../middleware/auth/index.js';

const router = Router();
const adminAuth = auth({ role: ['superadmin'] });

// 1. Admin Auth & Dashboard Stats
router.post('/auth/login', AdminController.adminLogin);
router.get('/stats', adminAuth, AdminController.getAdminDashboardStats);

// 2. Inventory & Products
router.get('/products', adminAuth, AdminController.adminGetProducts);
router.post('/products', adminAuth, AdminController.adminCreateProduct);
router.put('/products/bulk-price', adminAuth, AdminController.adminBulkAdjustPrices);
router.put('/products/:id', adminAuth, AdminController.adminUpdateProduct);
router.patch('/products/:id/stock', adminAuth, AdminController.adminToggleProductStock);
router.delete('/products/:id', adminAuth, AdminController.adminDeleteProduct);

// 3. Categories
router.get('/categories', adminAuth, AdminController.adminGetCategories);
router.post('/categories', adminAuth, AdminController.adminCreateCategory);
router.delete('/categories/:id', adminAuth, AdminController.adminDeleteCategory);

// 4. Coupons & Promotional Offers
router.get('/coupons', adminAuth, AdminController.adminGetCoupons);
router.post('/coupons', adminAuth, AdminController.adminCreateCoupon);
router.put('/coupons/:id', adminAuth, AdminController.adminUpdateCoupon);
router.delete('/coupons/:id', adminAuth, AdminController.adminDeleteCoupon);
router.get('/offers', adminAuth, AdminController.adminGetOffers);
router.post('/offers', adminAuth, AdminController.adminCreateOffer);
router.delete('/offers/:id', adminAuth, AdminController.adminDeleteOffer);

// 5. Shipping Provider Config & Outbound Push
router.get('/shipping-config', adminAuth, AdminController.adminGetShippingConfig);
router.put('/shipping-config', adminAuth, AdminController.adminUpdateShippingConfig);
router.post('/shipping-config/push/:orderId', adminAuth, AdminController.adminManualPushOrderWebhook);

// 6. Inbound Shipping Provider Webhook (Uses webhook secret / header authentication)
router.post('/webhooks/shipping', AdminController.handleIncomingShippingWebhook);

// 7. Orders Management
router.get('/orders', adminAuth, AdminController.adminGetOrders);
router.patch('/orders/:id/status', adminAuth, AdminController.adminUpdateOrderStatus);
router.post('/orders/:id/cancel', adminAuth, AdminController.adminCancelOrder);

// 8. Customer Accounts & Password Management
router.get('/users', adminAuth, AdminController.adminGetUsers);
router.put('/users/:id/password', adminAuth, AdminController.adminUpdateUserPassword);

// 9. Prelaunch VIP Leads Management
router.get('/leads', adminAuth, PrelaunchController.getLeads);
router.patch('/leads/:id/status', adminAuth, PrelaunchController.updateLeadStatus);
router.delete('/leads/:id', adminAuth, PrelaunchController.deleteLead);

export default router;
