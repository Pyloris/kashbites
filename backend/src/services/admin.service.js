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
import { PrelaunchLead } from '../database/models/prelaunch-leads.model.js';
import { Product } from '../database/models/products.model.js';
import { Category } from '../database/models/categories.model.js';
import { signToken } from '../middleware/auth/index.js';
import mongoose from 'mongoose';

const formatProductForAdmin = (p) => {
    const id = p._id ? String(p._id) : (p.id ? String(p.id) : (p.slug || 'kb-prod-unknown'));
    return {
        ...p,
        _id: id,
        id: id,
        subtitle: p.subtitle || p.tagline || '',
        tagline: p.tagline || p.subtitle || '',
        primaryImage:
            p.primaryImage ||
            (Array.isArray(p.images) && p.images[0]) ||
            '',
        origin: p.origin || p.certificate?.originDistrict || '',
        batchCode: p.batchCode || p.certificate?.certificateNumber || '',
        reviewsCount: p.reviewsCount ?? p.reviewCount ?? 0,
    };
};

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

        const token = signToken({
            id: admin._id || admin.username || 'admin',
            userId: admin._id || admin.username || 'admin',
            username: admin.username,
            email: admin.email,
            name: admin.name || admin.fullName || 'Shoaib Wani',
            role: admin.role || 'superadmin',
            isAdmin: true,
        });

        return {
            token,
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
        const totalPrelaunchLeads = await PrelaunchLead.countDocuments().catch(() => 0);

        return {
            totalProducts,
            outOfStockProducts,
            totalOrders,
            activeOrders,
            cancelledOrders,
            totalRevenue,
            totalUsers,
            activeCoupons,
            totalPrelaunchLeads,
            webhookEnabled: shippingConfigStore.isEnabled,
            recentWebhooksCount: webhookLogsStore.length,
        };
    }

    // 2. Inventory & Products
    static async getProducts() {
        if (mongoose.connection.readyState === 1) {
            const dbProducts = await Product.find().sort({ createdAt: -1 }).lean().catch(() => null);
            if (Array.isArray(dbProducts)) {
                return dbProducts.map(formatProductForAdmin);
            }
        }
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

        let parsedWeights = [];
        if (Array.isArray(netWeights) && netWeights.length > 0) {
            parsedWeights = netWeights
                .filter((w) => w && (w.weight || w.price))
                .map((w) => ({
                    weight: String(w.weight || '500g').trim(),
                    price: Number(w.price || price || 0),
                    originalPrice: Number(w.originalPrice || Math.round(Number(w.price || price || 0) * 1.25)),
                    inStock: w.inStock !== false,
                    stockQuantity: Number(w.stockQuantity ?? stockQuantity ?? 50),
                }));
        }

        const basePrice = parsedWeights[0]?.price || Number(price) || 0;
        const sanitizedImages = Array.isArray(images)
            ? images.map((img) => String(img || '').trim()).filter(Boolean)
            : primaryImage
            ? [String(primaryImage).trim()]
            : [];

        if (primaryImage && typeof primaryImage === 'string' && primaryImage.trim() && !sanitizedImages.includes(primaryImage.trim())) {
            sanitizedImages.unshift(primaryImage.trim());
        }

        const resolvedImages = sanitizedImages;
        const resolvedPrimaryImage = (primaryImage && typeof primaryImage === 'string' && primaryImage.trim()) || resolvedImages[0] || '';

        const generatedId = new mongoose.Types.ObjectId();
        const newProduct = {
            _id: generatedId.toString(),
            name,
            slug,
            category,
            tagline: (tagline || subtitle || name).trim(),
            subtitle: (subtitle || tagline || name).trim(),
            description: (description || tagline || subtitle || name).trim(),
            price: Number(price || basePrice || 0),
            originalPrice: Number(originalPrice || (price || basePrice ? Math.round(Number(price || basePrice) * 1.25) : 0)),
            rating: 5.0,
            reviewCount: 0,
            reviewsCount: 0,
            images: resolvedImages,
            primaryImage: resolvedPrimaryImage,
            origin: origin || originDistrict || '',
            batchCode: batchCode || '',
            netWeights: parsedWeights,
            nutrition: payload.nutrition || null,
            certificate: payload.certificate || null,
            packagingVideo: payload.packagingVideo || null,
            badges: Array.isArray(badges) ? badges : [],
            featured: Boolean(featured),
            isCombo: Boolean(isCombo || category.toLowerCase().includes('combo')),
            inStock: inStock !== false,
            stockQuantity: Number(stockQuantity ?? 100),
            promotionalOfferTag: promotionalOfferTag || '',
        };

        productsStore.unshift(newProduct);

        if (mongoose.connection.readyState === 1) {
            await Product.create(newProduct).catch((err) => {
                console.warn('[MongoDB] Product create fallback to memory:', err.message);
            });
        }

        return formatProductForAdmin(newProduct);
    }

    static async updateProduct({ id, updates }) {
        if (!id) {
            throw ApiError.badRequest('Product ID or slug is required');
        }

        const stringId = String(id).trim();
        const isValidObjectId = mongoose.Types.ObjectId.isValid(stringId);
        const query = isValidObjectId
            ? { $or: [{ _id: stringId }, { slug: stringId }] }
            : { slug: stringId };

        let idx = productsStore.findIndex(
            (p) =>
                String(p._id) === stringId ||
                String(p.id) === stringId ||
                String(p.slug) === stringId
        );

        let existing = idx !== -1 ? productsStore[idx] : null;
        if (!existing && mongoose.connection.readyState === 1) {
            existing = await Product.findOne(query).lean().catch(() => null);
        }

        if (!existing) {
            throw ApiError.notFound('Product not found');
        }

        const parsedUpdates = { ...updates };

        if (updates.images !== undefined) {
            const sanitizedImages = Array.isArray(updates.images)
                ? updates.images.map((img) => String(img || '').trim()).filter(Boolean)
                : updates.primaryImage
                ? [String(updates.primaryImage).trim()]
                : [];
            if (sanitizedImages.length > 0) {
                parsedUpdates.images = sanitizedImages;
                parsedUpdates.primaryImage = updates.primaryImage || sanitizedImages[0];
            }
        }

        if (Array.isArray(updates.netWeights)) {
            parsedUpdates.netWeights = updates.netWeights
                .filter((w) => w && (w.weight || w.price))
                .map((w) => ({
                    weight: String(w.weight || '500g').trim(),
                    price: Number(w.price || 499),
                    originalPrice: Number(w.originalPrice || Math.round(Number(w.price || 499) * 1.25)),
                    inStock: w.inStock !== false,
                    stockQuantity: Number(w.stockQuantity ?? 50),
                }));
        }

        const updated = {
            ...existing,
            ...parsedUpdates,
            tagline: parsedUpdates.tagline || parsedUpdates.subtitle || existing.tagline,
            subtitle: parsedUpdates.subtitle || parsedUpdates.tagline || existing.subtitle,
            price: parsedUpdates.price !== undefined ? Number(parsedUpdates.price) : existing.price,
            originalPrice:
                parsedUpdates.originalPrice !== undefined
                    ? Number(parsedUpdates.originalPrice)
                    : existing.originalPrice,
            stockQuantity:
                parsedUpdates.stockQuantity !== undefined
                    ? Number(parsedUpdates.stockQuantity)
                    : existing.stockQuantity,
        };

        if (idx !== -1) {
            productsStore[idx] = updated;
        } else {
            productsStore.unshift(updated);
        }

        if (mongoose.connection.readyState === 1) {
            await Product.findOneAndUpdate(
                query,
                { $set: updated },
                { new: true }
            ).catch(() => null);
        }

        return formatProductForAdmin(updated);
    }

    static async toggleProductStock({ id, inStock, variantWeight, stockQuantity }) {
        if (!id) {
            throw ApiError.badRequest('Product ID or slug is required');
        }

        const stringId = String(id).trim();
        const isValidObjectId = mongoose.Types.ObjectId.isValid(stringId);
        const query = isValidObjectId
            ? { $or: [{ _id: stringId }, { slug: stringId }] }
            : { slug: stringId };

        let idx = productsStore.findIndex(
            (p) =>
                String(p._id) === stringId ||
                String(p.id) === stringId ||
                String(p.slug) === stringId
        );

        let product = idx !== -1 ? productsStore[idx] : null;
        if (!product && mongoose.connection.readyState === 1) {
            product = await Product.findOne(query).lean().catch(() => null);
            if (product) {
                productsStore.push(product);
                idx = productsStore.length - 1;
            }
        }

        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        if (variantWeight) {
            const variant = product.netWeights?.find((w) => w.weight === variantWeight);
            if (variant) {
                variant.inStock = inStock !== undefined ? Boolean(inStock) : !variant.inStock;
                if (stockQuantity !== undefined) variant.stockQuantity = Number(stockQuantity);
            }
            product.inStock = product.netWeights?.some((w) => w.inStock) ?? true;
        } else {
            product.inStock = inStock !== undefined ? Boolean(inStock) : !product.inStock;
            if (stockQuantity !== undefined) {
                product.stockQuantity = Number(stockQuantity);
            } else if (!product.inStock) {
                product.stockQuantity = 0;
            } else if (product.stockQuantity === 0) {
                product.stockQuantity = 100;
            }
            if (Array.isArray(product.netWeights)) {
                product.netWeights.forEach((w) => {
                    w.inStock = product.inStock;
                });
            }
        }

        if (mongoose.connection.readyState === 1) {
            await Product.findOneAndUpdate(
                query,
                { $set: { inStock: product.inStock, stockQuantity: product.stockQuantity, netWeights: product.netWeights } },
                { new: true }
            ).catch(() => null);
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
        if (!id) {
            throw ApiError.badRequest('Product ID or slug is required');
        }

        const stringId = String(id).trim();
        const isValidObjectId = mongoose.Types.ObjectId.isValid(stringId);
        const query = isValidObjectId
            ? { $or: [{ _id: stringId }, { slug: stringId }] }
            : { slug: stringId };

        let dbDeleted = null;
        if (mongoose.connection.readyState === 1) {
            dbDeleted = await Product.findOneAndDelete(query).catch((err) => {
                console.warn('[AdminService] DB delete error:', err.message);
                return null;
            });
        }

        const idx = productsStore.findIndex(
            (p) =>
                String(p._id) === stringId ||
                String(p.id) === stringId ||
                String(p.slug) === stringId
        );

        if (idx !== -1) {
            productsStore.splice(idx, 1);
        } else if (!dbDeleted) {
            throw ApiError.notFound('Product not found');
        }

        return { deleted: true, id: stringId };
    }

    // 3. Categories Management
    static async getCategories() {
        if (mongoose.connection.readyState === 1) {
            const [dbCategories, dbProducts] = await Promise.all([
                Category.find().lean().catch(() => null),
                Product.find({}, 'category').lean().catch(() => []),
            ]);
            if (Array.isArray(dbCategories) && dbCategories.length > 0) {
                return dbCategories.map((c) => {
                    const catId = c.id || c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const count = (dbProducts || []).filter(
                        (p) =>
                            p.category &&
                            (p.category.toLowerCase() === catId.toLowerCase() ||
                             p.category.toLowerCase() === c.name.toLowerCase())
                    ).length;
                    return {
                        ...c,
                        _id: c._id ? String(c._id) : catId,
                        id: catId,
                        slug: catId,
                        productCount: count,
                    };
                });
            }
        }

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
