import {
    adminsStore,
    productsStore,
    categoriesStore,
    couponsStore,
    offersStore,
    ordersStore,
    usersStore,
    shippingConfigStore,
    webhookLogsStore,
    dispatchOutboundOrderWebhook,
} from '../data/store.js';
import { ApiError } from '../errors/api-error.js';

const formatProductForAdmin = (p) => ({
    ...p,
    subtitle: p.subtitle || p.tagline || 'Single-Origin Kashmir Harvest',
    tagline: p.tagline || p.subtitle || 'Single-Origin Kashmir Harvest',
    primaryImage:
        p.primaryImage ||
        (Array.isArray(p.images) && p.images[0]) ||
        '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg',
    origin: p.origin || p.certificate?.originDistrict || 'Shopian & Pulwama, Kashmir',
    batchCode: p.batchCode || p.certificate?.certificateNumber || 'KB-2026-BATCH',
    reviewsCount: p.reviewsCount ?? p.reviewCount ?? 42,
});

const formatOrderForAdmin = (o) => ({
    ...o,
    _id: o._id || o.orderNumber || o.orderId,
    orderId: o.orderNumber || o.orderId,
    orderNumber: o.orderNumber || o.orderId,
    totalAmount: Number(o.total ?? o.totalAmount ?? 0),
    total: Number(o.total ?? o.totalAmount ?? 0),
    customer: o.customer || {
        fullName: o.shippingAddress?.fullName || 'Customer',
        email: o.shippingAddress?.email || 'customer@kashbites.com',
        phone: o.shippingAddress?.phone || '+91 98765 43210',
        address: [o.shippingAddress?.addressLine1, o.shippingAddress?.addressLine2].filter(Boolean).join(', '),
        city: o.shippingAddress?.city || 'Srinagar',
        state: o.shippingAddress?.state || 'Jammu & Kashmir',
        pincode: o.shippingAddress?.pincode || '190001',
    },
});

const formatWebhookLogForAdmin = (l) => ({
    ...l,
    _id: l._id || l.id,
    orderId: l.orderNumber || l.orderId,
    success: l.statusCode >= 200 && l.statusCode < 300,
});

export class AdminService {
    // 1. Admin Authentication & Dashboard
    static async login({ username, password }) {
        if (!username || !password) {
            throw ApiError.badRequest('Username and password are required');
        }
        const cleanUsername = String(username).trim().toLowerCase();
        const admin = adminsStore.find((a) => a.username.toLowerCase() === cleanUsername && a.password === password);
        if (!admin) {
            throw ApiError.unauthorized('Invalid admin credentials. Default user: shoaibwani');
        }

        admin.lastLogin = new Date().toISOString();
        const { password: _, ...adminData } = admin;

        return {
            token: `admin_jwt_${admin._id}`,
            admin: {
                ...adminData,
                fullName: admin.name || admin.fullName || 'Shoaib Wani',
            },
        };
    }

    static async getDashboardStats() {
        const totalProducts = productsStore.length;
        const outOfStockProducts = productsStore.filter((p) => !p.inStock || p.stockQuantity === 0).length;
        const totalOrders = ordersStore.length;
        const activeOrders = ordersStore.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;
        const cancelledOrders = ordersStore.filter((o) => o.orderStatus === 'Cancelled').length;
        const totalRevenue = ordersStore
            .filter((o) => o.orderStatus !== 'Cancelled')
            .reduce((acc, o) => acc + (Number(o.total ?? o.totalAmount) || 0), 0);
        const totalUsers = usersStore.length;
        const activeCoupons = couponsStore.filter((c) => c.isActive).length;

        return {
            totalProducts,
            outOfStockProducts,
            totalOrders,
            activeOrders,
            cancelledOrders,
            totalRevenue,
            totalUsers,
            activeCoupons,
            webhookEnabled: shippingConfigStore.isEnabled,
            recentWebhooksCount: webhookLogsStore.length,
        };
    }

    // 2. Inventory & Products
    static async getProducts() {
        return productsStore.map(formatProductForAdmin);
    }

    static async createProduct(payload) {
        const {
            name,
            category,
            tagline,
            subtitle,
            description,
            price,
            originalPrice,
            images,
            primaryImage,
            netWeights,
            badges,
            featured,
            isCombo,
            inStock,
            stockQuantity,
            promotionalOfferTag,
            originDistrict,
            origin,
            batchCode,
        } = payload;

        if (!name || !category) {
            throw ApiError.badRequest('Product name and category are required');
        }

        const slug =
            name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '') +
            '-' +
            Math.floor(100 + Math.random() * 900);

        const parsedWeights =
            Array.isArray(netWeights) && netWeights.length > 0
                ? netWeights.map((w) => ({
                      weight: String(w.weight || '500g'),
                      price: Number(w.price || price || 499),
                      originalPrice: Number(w.originalPrice || Math.round(Number(w.price || price || 499) * 1.2)),
                      inStock: w.inStock !== false,
                      stockQuantity: Number(w.stockQuantity ?? 50),
                  }))
                : [
                      { weight: '250g', price: Math.round(Number(price || 499) * 0.55), originalPrice: Math.round(Number(price || 499) * 0.7), inStock: true, stockQuantity: 40 },
                      { weight: '500g', price: Number(price || 499), originalPrice: Math.round(Number(price || 499) * 1.25), inStock: true, stockQuantity: 60 },
                      { weight: '1kg', price: Math.round(Number(price || 499) * 1.85), originalPrice: Math.round(Number(price || 499) * 2.2), inStock: true, stockQuantity: 30 },
                  ];

        const basePrice = parsedWeights[0]?.price || Number(price) || 499;
        const resolvedImages =
            Array.isArray(images) && images.length > 0
                ? images
                : primaryImage
                ? [primaryImage]
                : ['/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg'];

        const newProduct = {
            _id: `kb-prod-${Date.now()}`,
            name,
            slug,
            category,
            tagline: tagline || subtitle || 'Authentic Kashmir Valley single-origin harvest',
            subtitle: subtitle || tagline || 'Authentic Kashmir Valley single-origin harvest',
            description:
                description ||
                'Handpicked from high-altitude Kashmiri orchards and cold-packed in Srinagar with zero chemical bleaching.',
            price: Number(price || basePrice),
            originalPrice: Number(originalPrice || Math.round(Number(price || basePrice) * 1.25)),
            rating: 4.9,
            reviewCount: 1,
            reviewsCount: 1,
            images: resolvedImages,
            primaryImage: resolvedImages[0],
            origin: origin || originDistrict || 'Shopian & Pulwama, Kashmir',
            batchCode: batchCode || `KB-2026-${Math.floor(100 + Math.random() * 900)}`,
            netWeights: parsedWeights,
            nutrition: payload.nutrition || {
                calories: '580 kcal per 100g',
                protein: '16.0g',
                healthyFats: '52.0g',
                carbs: '18.0g',
                fiber: '8.0g',
            },
            certificate: payload.certificate || {
                certificateNumber: batchCode || `JK-HORT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                issuedBy: 'Kashmir Horticulture & Food Safety Analytical Laboratory, Srinagar',
                labTestDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
                purityScore: '99.9% Single Origin',
                moistureLevel: '3.5%',
                aflatoxinStatus: 'Undetected (<0.5 ppb)',
                originDistrict: origin || originDistrict || 'Shopian & Pulwama, Jammu & Kashmir',
                harvestSeason: 'Autumn 2026 Harvest',
            },
            packagingVideo: payload.packagingVideo || {
                title: 'Hygienic Cold-Packing at Srinagar Hub',
                duration: '0:45',
                thumbnail: resolvedImages[0],
                facilityLocation: 'Industrial Estate, Sanat Nagar, Srinagar',
                cleanlinessStandard: 'Class 10,000 ISO Clean Packing Facility',
                steps: [
                    'Optical & manual sorting of harvest crop',
                    'Nitrogen flush to preserve natural oils',
                    'Hermetic moisture-barrier pouch sealing',
                    'Batch authentication laser print',
                ],
            },
            badges: Array.isArray(badges) && badges.length > 0 ? badges : ['100% Kashmir Origin', 'Direct from Growers'],
            featured: Boolean(featured),
            isCombo: Boolean(isCombo || category.toLowerCase().includes('combo')),
            inStock: inStock !== false,
            stockQuantity: Number(stockQuantity ?? 120),
            promotionalOfferTag: promotionalOfferTag || '',
        };

        productsStore.unshift(newProduct);
        return formatProductForAdmin(newProduct);
    }

    static async updateProduct({ id, updates }) {
        const idx = productsStore.findIndex((p) => p._id === id || p.slug === id);
        if (idx === -1) {
            throw ApiError.notFound('Product not found');
        }

        const updated = {
            ...productsStore[idx],
            ...updates,
            tagline: updates.tagline || updates.subtitle || productsStore[idx].tagline,
            subtitle: updates.subtitle || updates.tagline || productsStore[idx].subtitle,
            price: updates.price !== undefined ? Number(updates.price) : productsStore[idx].price,
            originalPrice:
                updates.originalPrice !== undefined
                    ? Number(updates.originalPrice)
                    : productsStore[idx].originalPrice,
            stockQuantity:
                updates.stockQuantity !== undefined
                    ? Number(updates.stockQuantity)
                    : productsStore[idx].stockQuantity,
        };
        productsStore[idx] = updated;
        return formatProductForAdmin(updated);
    }

    static async toggleProductStock({ id, inStock, variantWeight, stockQuantity }) {
        const product = productsStore.find((p) => p._id === id || p.slug === id);
        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        if (variantWeight) {
            const variant = product.netWeights.find((w) => w.weight === variantWeight);
            if (variant) {
                variant.inStock = inStock !== undefined ? Boolean(inStock) : !variant.inStock;
                if (stockQuantity !== undefined) variant.stockQuantity = Number(stockQuantity);
            }
            product.inStock = product.netWeights.some((w) => w.inStock);
        } else {
            product.inStock = inStock !== undefined ? Boolean(inStock) : !product.inStock;
            if (stockQuantity !== undefined) {
                product.stockQuantity = Number(stockQuantity);
            } else if (!product.inStock) {
                product.stockQuantity = 0;
            } else if (product.stockQuantity === 0) {
                product.stockQuantity = 100;
            }
            product.netWeights.forEach((w) => {
                w.inStock = product.inStock;
            });
        }

        return formatProductForAdmin(product);
    }

    static async bulkAdjustPrices({ category = 'all', adjustmentType = 'PERCENTAGE', value = 0, operation, direction }) {
        const resolvedOp = operation || direction || 'INCREASE';
        const numVal = Number(value);
        if (!numVal || numVal <= 0) {
            throw ApiError.badRequest('Provide a valid positive adjustment value');
        }

        let affectedCount = 0;
        const normCat = String(category).toLowerCase();

        productsStore.forEach((product) => {
            const prodCat = String(product.category).toLowerCase();
            if (normCat === 'all' || prodCat === normCat || normCat.includes(prodCat) || prodCat.includes(normCat)) {
                affectedCount += 1;
                const multiplier = resolvedOp === 'DECREASE' ? -1 : 1;
                const adjustAmount = (currentPrice) => {
                    if (adjustmentType === 'PERCENTAGE') {
                        return Math.max(10, Math.round(currentPrice * (1 + (multiplier * numVal) / 100)));
                    }
                    return Math.max(10, Math.round(currentPrice + multiplier * numVal));
                };

                product.price = adjustAmount(product.price);
                product.originalPrice = Math.max(product.price, adjustAmount(product.originalPrice));

                if (Array.isArray(product.netWeights)) {
                    product.netWeights.forEach((w) => {
                        w.price = adjustAmount(w.price);
                        if (w.originalPrice) {
                            w.originalPrice = Math.max(w.price, adjustAmount(w.originalPrice));
                        }
                    });
                }
            }
        });

        return {
            affectedCount,
            products: productsStore.map(formatProductForAdmin),
            resolvedOp,
            numVal,
            adjustmentType,
        };
    }

    static async deleteProduct({ id }) {
        const idx = productsStore.findIndex((p) => p._id === id || p.slug === id);
        if (idx === -1) {
            throw ApiError.notFound('Product not found');
        }
        productsStore.splice(idx, 1);
        return { deleted: true, id };
    }

    // 3. Categories Management
    static async getCategories() {
        return categoriesStore.map((c) => ({
            ...c,
            _id: c.id,
            slug: c.id,
            featured: true,
            productCount: productsStore.filter(
                (p) =>
                    p.category.toLowerCase() === c.id.toLowerCase() ||
                    p.category.toLowerCase() === c.name.toLowerCase()
            ).length,
        }));
    }

    static async createCategory({ id, name, description }) {
        if (!name) {
            throw ApiError.badRequest('Category name is required');
        }
        const slugId = (id || name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        if (categoriesStore.some((c) => c.id === slugId)) {
            throw ApiError.conflict('Category ID already exists');
        }

        const newCat = {
            id: slugId,
            name: name.trim(),
            description: description || `Authentic Kashmiri ${name.trim()}`,
        };
        categoriesStore.push(newCat);
        return { ...newCat, _id: newCat.id, slug: newCat.id, productCount: 0 };
    }

    static async deleteCategory({ id }) {
        const idx = categoriesStore.findIndex((c) => c.id === id);
        if (idx === -1) {
            throw ApiError.notFound('Category not found');
        }
        categoriesStore.splice(idx, 1);
        return { deleted: true, id };
    }

    // 4. Coupons & Promotional Offers
    static async getCoupons() {
        return couponsStore;
    }

    static async createCoupon(payload) {
        const {
            code,
            description,
            discountType = 'PERCENTAGE',
            discountValue,
            minOrderAmount = 0,
            maxDiscountAmount,
            expiryDate = '2027-12-31',
        } = payload;

        if (!code || !discountValue) {
            throw ApiError.badRequest('Coupon code and discount value are required');
        }

        const cleanCode = String(code).trim().toUpperCase();
        if (couponsStore.some((c) => c.code === cleanCode)) {
            throw ApiError.conflict('Coupon code already exists');
        }

        const newCoupon = {
            _id: `cpn-${Date.now()}`,
            code: cleanCode,
            description:
                description ||
                `${discountType === 'PERCENTAGE' ? discountValue + '%' : '₹' + discountValue} discount coupon`,
            discountType: discountType === 'FLAT' ? 'FLAT' : 'PERCENTAGE',
            discountValue: Number(discountValue),
            minOrderAmount: Number(minOrderAmount || 0),
            maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
            isActive: true,
            expiryDate,
            usageCount: 0,
        };

        couponsStore.unshift(newCoupon);
        return newCoupon;
    }

    static async updateCoupon({ id, updates }) {
        const coupon = couponsStore.find((c) => c._id === id || c.code === id);
        if (!coupon) {
            throw ApiError.notFound('Coupon not found');
        }
        Object.assign(coupon, updates);
        return coupon;
    }

    static async deleteCoupon({ id }) {
        const idx = couponsStore.findIndex((c) => c._id === id || c.code === id);
        if (idx === -1) {
            throw ApiError.notFound('Coupon not found');
        }
        couponsStore.splice(idx, 1);
        return { deleted: true, id };
    }

    static async getOffers() {
        return offersStore.map((o) => ({
            ...o,
            _id: o.id,
            applicableCategory: o.targetCategory || 'All',
        }));
    }

    static async createOffer(payload) {
        const {
            title,
            subtitle,
            badgeText,
            discountPercentage,
            targetCategory,
            applicableCategory,
            couponCode,
            applyToProducts,
            productId,
        } = payload;

        if (!title) {
            throw ApiError.badRequest('Offer title is required');
        }

        const resolvedCat = targetCategory || applicableCategory || 'All';
        const newOffer = {
            id: `off-${Date.now()}`,
            title,
            subtitle: subtitle || 'Limited period harvest celebration offer',
            badgeText: badgeText || `${discountPercentage || 15}% OFF`,
            discountPercentage: Number(discountPercentage || 15),
            targetCategory: resolvedCat,
            couponCode: couponCode ? String(couponCode).toUpperCase() : undefined,
            isActive: true,
        };

        offersStore.unshift(newOffer);

        if (productId) {
            const prod = productsStore.find((p) => p._id === productId);
            if (prod) {
                prod.promotionalOfferTag = newOffer.badgeText;
            }
        } else if (applyToProducts) {
            productsStore.forEach((p) => {
                if (resolvedCat.toLowerCase() === 'all' || p.category.toLowerCase() === resolvedCat.toLowerCase()) {
                    p.promotionalOfferTag = newOffer.badgeText;
                }
            });
        }

        return { ...newOffer, _id: newOffer.id, applicableCategory: resolvedCat };
    }

    static async deleteOffer({ id }) {
        const idx = offersStore.findIndex((o) => o.id === id);
        if (idx === -1) {
            throw ApiError.notFound('Offer not found');
        }
        offersStore.splice(idx, 1);
        return { deleted: true, id };
    }

    // 5 & 6. Shipping Provider Config & 2-Way Webhooks
    static async getShippingConfig() {
        return {
            config: shippingConfigStore,
            logs: webhookLogsStore.map(formatWebhookLogForAdmin),
        };
    }

    static async updateShippingConfig(updates) {
        const { providerName, outboundWebhookUrl, secretToken, isEnabled, autoPushOnNewOrder } = updates;
        if (providerName !== undefined) shippingConfigStore.providerName = providerName;
        if (outboundWebhookUrl !== undefined) shippingConfigStore.outboundWebhookUrl = outboundWebhookUrl;
        if (secretToken !== undefined) shippingConfigStore.secretToken = secretToken;
        if (isEnabled !== undefined) shippingConfigStore.isEnabled = Boolean(isEnabled);
        if (autoPushOnNewOrder !== undefined) shippingConfigStore.autoPushOnNewOrder = Boolean(autoPushOnNewOrder);

        return shippingConfigStore;
    }

    static async manualPushOrderWebhook({ orderId }) {
        const order = ordersStore.find(
            (o) => o.orderNumber === orderId || o.orderId === orderId || o._id === orderId
        );
        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        const logEntry = await dispatchOutboundOrderWebhook(order);
        return {
            order: formatOrderForAdmin(order),
            webhookLog: logEntry ? formatWebhookLogForAdmin(logEntry) : null,
        };
    }

    static async handleIncomingShippingWebhook({ headers, body }) {
        const incomingSecret =
            headers['x-shipping-webhook-secret'] ||
            headers['authorization']?.replace('Bearer ', '') ||
            body.secretToken;

        if (shippingConfigStore.secretToken && incomingSecret !== shippingConfigStore.secretToken) {
            const unauthorizedLog = {
                id: `wh-log-${Date.now()}`,
                direction: 'INBOUND',
                event: 'shipment.unauthorized',
                orderNumber: body?.orderNumber || body?.orderId || 'UNKNOWN',
                targetUrl: '/api/webhooks/shipping',
                statusCode: 401,
                payload: body,
                response: { success: false, message: 'Invalid x-shipping-webhook-secret token' },
                timestamp: new Date().toISOString(),
            };
            webhookLogsStore.unshift(unauthorizedLog);
            throw ApiError.unauthorized('Unauthorized shipping webhook: Invalid x-shipping-webhook-secret header');
        }

        const targetOrderId = body.orderNumber || body.orderId;
        const { status, providerStatus, trackingNumber, courierName, note, location } = body;
        if (!targetOrderId) {
            throw ApiError.badRequest('orderId or orderNumber is required in webhook payload');
        }

        const order = ordersStore.find(
            (o) => o.orderNumber === targetOrderId || o.orderId === targetOrderId || o._id === targetOrderId
        );
        if (!order) {
            throw ApiError.notFound(`Order ${targetOrderId} not found`);
        }

        const rawStatus = String(status || providerStatus || '').toUpperCase();
        let mappedStatus = order.orderStatus;
        if (rawStatus.includes('PACK') || rawStatus === 'PICKED_UP' || rawStatus === 'MANIFESTED') {
            mappedStatus = 'Srinagar Cold-Packing';
        } else if (rawStatus.includes('SHIP') || rawStatus === 'IN_TRANSIT' || rawStatus === 'DISPATCHED') {
            mappedStatus = 'Shipped';
        } else if (rawStatus.includes('OUT') || rawStatus === 'OUT_FOR_DELIVERY') {
            mappedStatus = 'Out for Delivery';
        } else if (rawStatus.includes('DELIVER') || rawStatus === 'DELIVERED') {
            mappedStatus = 'Delivered';
            order.paymentStatus = 'Paid';
        } else if (rawStatus.includes('CANCEL') || rawStatus === 'RTO' || rawStatus === 'CANCELLED') {
            mappedStatus = 'Cancelled';
        } else if (
            ['Confirmed', 'Srinagar Cold-Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(
                status
            )
        ) {
            mappedStatus = status;
        }

        order.orderStatus = mappedStatus;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (courierName) order.courierName = courierName;
        order.webhookSynced = true;

        if (!Array.isArray(order.statusHistory)) {
            order.statusHistory = [];
        }
        order.statusHistory.push({
            status: mappedStatus,
            note:
                note ||
                `Shipping provider webhook update (${rawStatus || mappedStatus})${location ? ` at ${location}` : ''}`,
            updatedBy: courierName || shippingConfigStore.providerName || 'Shipping Provider Webhook',
            timestamp: new Date().toISOString(),
        });

        const responsePayload = {
            orderNumber: order.orderNumber || order.orderId,
            orderId: order.orderNumber || order.orderId,
            updatedOrderStatus: order.orderStatus,
            trackingNumber: order.trackingNumber,
            timestamp: new Date().toISOString(),
            order: formatOrderForAdmin(order),
        };

        webhookLogsStore.unshift({
            id: `wh-log-${Date.now()}`,
            direction: 'INBOUND',
            event: `shipment.${rawStatus.toLowerCase() || 'status_updated'}`,
            orderNumber: order.orderNumber || order.orderId,
            targetUrl: '/api/webhooks/shipping',
            statusCode: 200,
            payload: body,
            response: responsePayload,
            timestamp: new Date().toISOString(),
        });

        return responsePayload;
    }

    // 7. Orders Management
    static async getOrders() {
        return ordersStore.map(formatOrderForAdmin);
    }

    static async updateOrderStatus({ id, payload }) {
        const { status, orderStatus, paymentStatus, trackingNumber, courierName, note } = payload;
        const nextStatus = status || orderStatus;
        const order = ordersStore.find((o) => o.orderNumber === id || o.orderId === id || o._id === id);
        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        if (nextStatus) order.orderStatus = nextStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
        if (courierName !== undefined) order.courierName = courierName;

        if (!Array.isArray(order.statusHistory)) {
            order.statusHistory = [];
        }
        order.statusHistory.push({
            status: order.orderStatus,
            note: note || `Status updated manually to ${order.orderStatus} by Admin`,
            updatedBy: 'shoaibwani (Admin)',
            timestamp: new Date().toISOString(),
        });

        return formatOrderForAdmin(order);
    }

    static async cancelOrder({ id, reason }) {
        const order = ordersStore.find((o) => o.orderNumber === id || o.orderId === id || o._id === id);
        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        order.orderStatus = 'Cancelled';
        if (order.paymentStatus === 'Paid') {
            order.paymentStatus = 'Refunded';
        }

        if (!Array.isArray(order.statusHistory)) {
            order.statusHistory = [];
        }
        order.statusHistory.push({
            status: 'Cancelled',
            note: reason || 'Order cancelled by Administrator',
            updatedBy: 'shoaibwani (Admin)',
            timestamp: new Date().toISOString(),
        });

        return formatOrderForAdmin(order);
    }

    // 8. Customer Accounts & Password Management
    static async getUsers() {
        return usersStore.map((u) => {
            const userOrders = ordersStore.filter(
                (o) =>
                    o.shippingAddress?.phone === u.phone ||
                    o.customer?.phone === u.phone ||
                    o.shippingAddress?.fullName?.toLowerCase() === u.name?.toLowerCase() ||
                    o.customer?.fullName?.toLowerCase() === u.name?.toLowerCase()
            );
            const { password: _, ...safeUser } = u;
            const totalSpent = userOrders.reduce((acc, o) => acc + (Number(o.total ?? o.totalAmount) || 0), 0);
            return {
                ...safeUser,
                joinedDate: u.joinedDate || (u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Oct 2026'),
                loyaltyPoints: u.loyaltyPoints ?? u.chinarPoints ?? 250,
                orderCount: userOrders.length,
                ordersCount: userOrders.length,
                totalSpent,
            };
        });
    }

    static async updateUserPassword({ id, newPassword }) {
        if (!newPassword || String(newPassword).trim().length < 4) {
            throw ApiError.badRequest('New password must be at least 4 characters long');
        }

        const user = usersStore.find((u) => u._id === id || u.email === id);
        if (!user) {
            throw ApiError.notFound('Customer account not found');
        }

        user.password = String(newPassword).trim();
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
}

export default AdminService;
