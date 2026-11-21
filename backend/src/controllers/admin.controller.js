import { catchError } from '../errors/catch-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
    // 1. Admin Auth & Dashboard
    static adminLogin = catchError(async (req, res) => {
        const { username, password } = req.body;
        const result = await AdminService.login({ username, password });
        return res.json({
            status: 1,
            success: true,
            token: result.token,
            data: result.admin,
        });
    });

    static getAdminDashboardStats = catchError(async (_req, res) => {
        const stats = await AdminService.getDashboardStats();
        return ApiResponse.success(res, stats, 'Dashboard stats retrieved successfully');
    });

    // 2. Inventory & Products
    static adminGetProducts = catchError(async (_req, res) => {
        const products = await AdminService.getProducts();
        return ApiResponse.success(res, products, 'Products retrieved successfully');
    });

    static adminCreateProduct = catchError(async (req, res) => {
        const product = await AdminService.createProduct(req.body);
        return ApiResponse.created(res, product, 'Product added to inventory');
    });

    static adminUpdateProduct = catchError(async (req, res) => {
        const { id } = req.params;
        const product = await AdminService.updateProduct({ id, updates: req.body });
        return ApiResponse.success(res, product, 'Product updated successfully');
    });

    static adminToggleProductStock = catchError(async (req, res) => {
        const { id } = req.params;
        const { inStock, variantWeight, stockQuantity } = req.body;
        const product = await AdminService.toggleProductStock({ id, inStock, variantWeight, stockQuantity });
        return ApiResponse.success(res, product, 'Product stock updated successfully');
    });

    static adminBulkAdjustPrices = catchError(async (req, res) => {
        const { category = 'all', adjustmentType = 'PERCENTAGE', value = 0, operation, direction } = req.body;
        const result = await AdminService.bulkAdjustPrices({ category, adjustmentType, value, operation, direction });
        return res.json({
            status: 1,
            success: true,
            message: `Adjusted prices (${result.resolvedOp === 'DECREASE' ? '-' : '+'}${result.numVal}${
                result.adjustmentType === 'PERCENTAGE' ? '%' : '₹'
            }) across ${result.affectedCount} products`,
            affectedCount: result.affectedCount,
            data: result.products,
        });
    });

    static adminDeleteProduct = catchError(async (req, res) => {
        const { id } = req.params;
        const result = await AdminService.deleteProduct({ id });
        return ApiResponse.success(res, result, 'Product removed from inventory');
    });

    // 3. Categories
    static adminGetCategories = catchError(async (_req, res) => {
        const categories = await AdminService.getCategories();
        return ApiResponse.success(res, categories, 'Categories retrieved successfully');
    });

    static adminCreateCategory = catchError(async (req, res) => {
        const { id, name, description } = req.body;
        const category = await AdminService.createCategory({ id, name, description });
        return ApiResponse.created(res, category, 'Category created successfully');
    });

    static adminDeleteCategory = catchError(async (req, res) => {
        const { id } = req.params;
        const result = await AdminService.deleteCategory({ id });
        return ApiResponse.success(res, result, 'Category deleted');
    });

    // 4. Coupons & Offers
    static adminGetCoupons = catchError(async (_req, res) => {
        const coupons = await AdminService.getCoupons();
        return ApiResponse.success(res, coupons, 'Coupons retrieved successfully');
    });

    static adminCreateCoupon = catchError(async (req, res) => {
        const coupon = await AdminService.createCoupon(req.body);
        return ApiResponse.created(res, coupon, 'Coupon created successfully');
    });

    static adminUpdateCoupon = catchError(async (req, res) => {
        const { id } = req.params;
        const coupon = await AdminService.updateCoupon({ id, updates: req.body });
        return ApiResponse.success(res, coupon, 'Coupon updated successfully');
    });

    static adminDeleteCoupon = catchError(async (req, res) => {
        const { id } = req.params;
        const result = await AdminService.deleteCoupon({ id });
        return ApiResponse.success(res, result, 'Coupon deleted');
    });

    static adminGetOffers = catchError(async (_req, res) => {
        const offers = await AdminService.getOffers();
        return ApiResponse.success(res, offers, 'Offers retrieved successfully');
    });

    static adminCreateOffer = catchError(async (req, res) => {
        const offer = await AdminService.createOffer(req.body);
        return ApiResponse.created(res, offer, 'Offer created successfully');
    });

    static adminDeleteOffer = catchError(async (req, res) => {
        const { id } = req.params;
        const result = await AdminService.deleteOffer({ id });
        return ApiResponse.success(res, result, 'Offer deleted');
    });

    // 5 & 6. Shipping Provider Config & Webhooks
    static adminGetShippingConfig = catchError(async (_req, res) => {
        const data = await AdminService.getShippingConfig();
        return ApiResponse.success(res, data, 'Shipping config retrieved');
    });

    static adminUpdateShippingConfig = catchError(async (req, res) => {
        const config = await AdminService.updateShippingConfig(req.body);
        return ApiResponse.success(res, config, 'Shipping provider webhook configuration saved');
    });

    static adminManualPushOrderWebhook = catchError(async (req, res) => {
        const targetOrderId = req.params.orderId || req.params.orderNumber || req.params.id;
        const result = await AdminService.manualPushOrderWebhook({ orderId: targetOrderId });
        return ApiResponse.success(res, result, `Order ${targetOrderId} pushed to shipping webhook`);
    });

    static handleIncomingShippingWebhook = catchError(async (req, res) => {
        const result = await AdminService.handleIncomingShippingWebhook({
            headers: req.headers,
            body: req.body,
        });
        return res.json({
            status: 1,
            success: true,
            ...result,
        });
    });

    // 7. Orders Management
    static adminGetOrders = catchError(async (_req, res) => {
        const orders = await AdminService.getOrders();
        return ApiResponse.success(res, orders, 'Orders retrieved successfully');
    });

    static adminUpdateOrderStatus = catchError(async (req, res) => {
        const targetOrderId = req.params.id || req.params.orderNumber || req.params.orderId;
        const order = await AdminService.updateOrderStatus({ id: targetOrderId, payload: req.body });
        return ApiResponse.success(res, order, `Order ${targetOrderId} updated successfully`);
    });

    static adminCancelOrder = catchError(async (req, res) => {
        const targetOrderId = req.params.id || req.params.orderNumber || req.params.orderId;
        const order = await AdminService.cancelOrder({ id: targetOrderId, reason: req.body.reason });
        return ApiResponse.success(res, order, `Order ${targetOrderId} has been cancelled`);
    });

    // 8. Users
    static adminGetUsers = catchError(async (_req, res) => {
        const users = await AdminService.getUsers();
        return ApiResponse.success(res, users, 'Users retrieved successfully');
    });

    static adminUpdateUserPassword = catchError(async (req, res) => {
        const { id } = req.params;
        const { newPassword } = req.body;
        const user = await AdminService.updateUserPassword({ id, newPassword });
        return ApiResponse.success(res, user, 'Password updated successfully');
    });
}

// Named exports for backward compatibility
export const adminLogin = AdminController.adminLogin;
export const getAdminDashboardStats = AdminController.getAdminDashboardStats;
export const adminGetProducts = AdminController.adminGetProducts;
export const adminCreateProduct = AdminController.adminCreateProduct;
export const adminUpdateProduct = AdminController.adminUpdateProduct;
export const adminToggleProductStock = AdminController.adminToggleProductStock;
export const adminBulkAdjustPrices = AdminController.adminBulkAdjustPrices;
export const adminDeleteProduct = AdminController.adminDeleteProduct;
export const adminGetCategories = AdminController.adminGetCategories;
export const adminCreateCategory = AdminController.adminCreateCategory;
export const adminDeleteCategory = AdminController.adminDeleteCategory;
export const adminGetCoupons = AdminController.adminGetCoupons;
export const adminCreateCoupon = AdminController.adminCreateCoupon;
export const adminUpdateCoupon = AdminController.adminUpdateCoupon;
export const adminDeleteCoupon = AdminController.adminDeleteCoupon;
export const adminGetOffers = AdminController.adminGetOffers;
export const adminCreateOffer = AdminController.adminCreateOffer;
export const adminDeleteOffer = AdminController.adminDeleteOffer;
export const adminGetShippingConfig = AdminController.adminGetShippingConfig;
export const adminUpdateShippingConfig = AdminController.adminUpdateShippingConfig;
export const adminManualPushOrderWebhook = AdminController.adminManualPushOrderWebhook;
export const handleIncomingShippingWebhook = AdminController.handleIncomingShippingWebhook;
export const adminGetOrders = AdminController.adminGetOrders;
export const adminUpdateOrderStatus = AdminController.adminUpdateOrderStatus;
export const adminCancelOrder = AdminController.adminCancelOrder;
export const adminGetUsers = AdminController.adminGetUsers;
export const adminUpdateUserPassword = AdminController.adminUpdateUserPassword;

export default AdminController;
