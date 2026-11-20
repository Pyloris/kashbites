import { adminsStore, productsStore, categoriesStore, couponsStore, offersStore, ordersStore, usersStore, shippingConfigStore, webhookLogsStore, dispatchOutboundOrderWebhook, } from '../data/store.js';
const formatProductForAdmin = (p) => ({
    ...p,
    subtitle: p.subtitle || p.tagline || 'Single-Origin Kashmir Harvest',
    tagline: p.tagline || p.subtitle || 'Single-Origin Kashmir Harvest',
    primaryImage: p.primaryImage || (Array.isArray(p.images) && p.images[0]) || '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg',
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
// ================= 1. ADMIN AUTHENTICATION (shoaibwani) =================
export const adminLogin = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    const cleanUsername = String(username).trim().toLowerCase();
    const admin = adminsStore.find((a) => a.username.toLowerCase() === cleanUsername && a.password === password);
    if (!admin) {
        return res.status(401).json({
            success: false,
            message: 'Invalid admin credentials. Default user: shoaibwani',
        });
    }
    admin.lastLogin = new Date().toISOString();
    const { password: _, ...adminData } = admin;
    return res.json({
        success: true,
        token: `admin_jwt_${admin._id}`,
        data: {
            ...adminData,
            fullName: admin.name || admin.fullName || 'Shoaib Wani',
        },
    });
};
export const getAdminDashboardStats = (_req, res) => {
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
    return res.json({
        success: true,
        data: {
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
        },
    });
};
// ================= 2 & 3 & 4. INVENTORY, PRODUCTS, VARIATIONS, STOCK & BULK PRICING =================
export const adminGetProducts = (_req, res) => {
    return res.json({
        success: true,
        count: productsStore.length,
        data: productsStore.map(formatProductForAdmin),
    });
};
export const adminCreateProduct = (req, res) => {
    const { name, category, tagline, subtitle, description, price, originalPrice, images, primaryImage, netWeights, badges, featured, isCombo, inStock, stockQuantity, promotionalOfferTag, originDistrict, origin, batchCode, } = req.body;
    if (!name || !category) {
        return res.status(400).json({ success: false, message: 'Product name and category are required' });
    }
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
        '-' +
        Math.floor(100 + Math.random() * 900);
    const parsedWeights = Array.isArray(netWeights) && netWeights.length > 0
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
    const resolvedImages = Array.isArray(images) && images.length > 0
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
        description: description ||
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
        nutrition: req.body.nutrition || {
            calories: '580 kcal per 100g',
            protein: '16.0g',
            healthyFats: '52.0g',
            carbs: '18.0g',
            fiber: '8.0g',
        },
        certificate: req.body.certificate || {
            certificateNumber: batchCode || `JK-HORT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            issuedBy: 'Kashmir Horticulture & Food Safety Analytical Laboratory, Srinagar',
            labTestDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            purityScore: '99.9% Single Origin',
            moistureLevel: '3.5%',
            aflatoxinStatus: 'Undetected (<0.5 ppb)',
            originDistrict: origin || originDistrict || 'Shopian & Pulwama, Jammu & Kashmir',
            harvestSeason: 'Autumn 2026 Harvest',
        },
        packagingVideo: req.body.packagingVideo || {
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
    return res.status(201).json({
        success: true,
        message: 'Product added to inventory',
        data: formatProductForAdmin(newProduct),
    });
};
export const adminUpdateProduct = (req, res) => {
    const { id } = req.params;
    const idx = productsStore.findIndex((p) => p._id === id || p.slug === id);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const updated = {
        ...productsStore[idx],
        ...req.body,
        tagline: req.body.tagline || req.body.subtitle || productsStore[idx].tagline,
        subtitle: req.body.subtitle || req.body.tagline || productsStore[idx].subtitle,
        price: req.body.price !== undefined ? Number(req.body.price) : productsStore[idx].price,
        originalPrice: req.body.originalPrice !== undefined
            ? Number(req.body.originalPrice)
            : productsStore[idx].originalPrice,
        stockQuantity: req.body.stockQuantity !== undefined
            ? Number(req.body.stockQuantity)
            : productsStore[idx].stockQuantity,
    };
    productsStore[idx] = updated;
    return res.json({
        success: true,
        message: 'Product updated successfully',
        data: formatProductForAdmin(updated),
    });
};
export const adminToggleProductStock = (req, res) => {
    const { id } = req.params;
    const { inStock, variantWeight, stockQuantity } = req.body;
    const product = productsStore.find((p) => p._id === id || p.slug === id);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (variantWeight) {
        const variant = product.netWeights.find((w) => w.weight === variantWeight);
        if (variant) {
            variant.inStock = inStock !== undefined ? Boolean(inStock) : !variant.inStock;
            if (stockQuantity !== undefined)
                variant.stockQuantity = Number(stockQuantity);
        }
        product.inStock = product.netWeights.some((w) => w.inStock);
    }
    else {
        product.inStock = inStock !== undefined ? Boolean(inStock) : !product.inStock;
        if (stockQuantity !== undefined) {
            product.stockQuantity = Number(stockQuantity);
        }
        else if (!product.inStock) {
            product.stockQuantity = 0;
        }
        else if (product.stockQuantity === 0) {
            product.stockQuantity = 100;
        }
        product.netWeights.forEach((w) => {
            w.inStock = product.inStock;
        });
    }
    return res.json({
        success: true,
        message: product.inStock ? 'Product marked In Stock' : 'Product marked Out of Stock',
        data: formatProductForAdmin(product),
    });
};
export const adminBulkAdjustPrices = (req, res) => {
    const { category = 'all', adjustmentType = 'PERCENTAGE', value = 0, operation, direction, } = req.body;
    const resolvedOp = operation || direction || 'INCREASE';
    const numVal = Number(value);
    if (!numVal || numVal <= 0) {
        return res.status(400).json({ success: false, message: 'Provide a valid positive adjustment value' });
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
    return res.json({
        success: true,
        message: `Adjusted prices (${resolvedOp === 'DECREASE' ? '-' : '+'}${numVal}${adjustmentType === 'PERCENTAGE' ? '%' : '₹'}) across ${affectedCount} products`,
        affectedCount,
        data: productsStore.map(formatProductForAdmin),
    });
};
export const adminDeleteProduct = (req, res) => {
    const { id } = req.params;
    const idx = productsStore.findIndex((p) => p._id === id || p.slug === id);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    productsStore.splice(idx, 1);
    return res.json({ success: true, message: 'Product removed from inventory' });
};
// ================= 3B. CATEGORIES MANAGEMENT =================
export const adminGetCategories = (_req, res) => {
    const enriched = categoriesStore.map((c) => ({
        ...c,
        _id: c.id,
        slug: c.id,
        featured: true,
        productCount: productsStore.filter((p) => p.category.toLowerCase() === c.id.toLowerCase() ||
            p.category.toLowerCase() === c.name.toLowerCase()).length,
    }));
    return res.json({ success: true, data: enriched });
};
export const adminCreateCategory = (req, res) => {
    const { id, name, description } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const slugId = (id || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    if (categoriesStore.some((c) => c.id === slugId)) {
        return res.status(400).json({ success: false, message: 'Category ID already exists' });
    }
    const newCat = {
        id: slugId,
        name: name.trim(),
        description: description || `Authentic Kashmiri ${name.trim()}`,
    };
    categoriesStore.push(newCat);
    return res.status(201).json({
        success: true,
        data: { ...newCat, _id: newCat.id, slug: newCat.id, productCount: 0 },
    });
};
export const adminDeleteCategory = (req, res) => {
    const { id } = req.params;
    const idx = categoriesStore.findIndex((c) => c.id === id);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Category not found' });
    }
    categoriesStore.splice(idx, 1);
    return res.json({ success: true, message: 'Category deleted' });
};
// ================= 4B. COUPON CODES & PROMOTIONAL OFFERS =================
export const adminGetCoupons = (_req, res) => {
    return res.json({ success: true, data: couponsStore });
};
export const adminCreateCoupon = (req, res) => {
    const { code, description, discountType = 'PERCENTAGE', discountValue, minOrderAmount = 0, maxDiscountAmount, expiryDate = '2027-12-31', } = req.body;
    if (!code || !discountValue) {
        return res.status(400).json({ success: false, message: 'Coupon code and discount value are required' });
    }
    const cleanCode = String(code).trim().toUpperCase();
    if (couponsStore.some((c) => c.code === cleanCode)) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }
    const newCoupon = {
        _id: `cpn-${Date.now()}`,
        code: cleanCode,
        description: description || `${discountType === 'PERCENTAGE' ? discountValue + '%' : '₹' + discountValue} discount coupon`,
        discountType: (discountType === 'FLAT' ? 'FLAT' : 'PERCENTAGE'),
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount || 0),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        isActive: true,
        expiryDate,
        usageCount: 0,
    };
    couponsStore.unshift(newCoupon);
    return res.status(201).json({ success: true, data: newCoupon });
};
export const adminUpdateCoupon = (req, res) => {
    const { id } = req.params;
    const coupon = couponsStore.find((c) => c._id === id || c.code === id);
    if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    Object.assign(coupon, req.body);
    return res.json({ success: true, data: coupon });
};
export const adminDeleteCoupon = (req, res) => {
    const { id } = req.params;
    const idx = couponsStore.findIndex((c) => c._id === id || c.code === id);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    couponsStore.splice(idx, 1);
    return res.json({ success: true, message: 'Coupon deleted' });
};
export const adminGetOffers = (_req, res) => {
    const formatted = offersStore.map((o) => ({
        ...o,
        _id: o.id,
        applicableCategory: o.targetCategory || 'All',
    }));
    return res.json({ success: true, data: formatted });
};
export const adminCreateOffer = (req, res) => {
    const { title, subtitle, badgeText, discountPercentage, targetCategory, applicableCategory, couponCode, applyToProducts, productId, } = req.body;
    if (!title) {
        return res.status(400).json({ success: false, message: 'Offer title is required' });
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
    }
    else if (applyToProducts) {
        productsStore.forEach((p) => {
            if (resolvedCat.toLowerCase() === 'all' || p.category.toLowerCase() === resolvedCat.toLowerCase()) {
                p.promotionalOfferTag = newOffer.badgeText;
            }
        });
    }
    return res.status(201).json({
        success: true,
        data: { ...newOffer, _id: newOffer.id, applicableCategory: resolvedCat },
    });
};
export const adminDeleteOffer = (req, res) => {
    const { id } = req.params;
    const idx = offersStore.findIndex((o) => o.id === id);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    offersStore.splice(idx, 1);
    return res.json({ success: true, message: 'Offer deleted' });
};
// ================= 5 & 6. SHIPPING PROVIDER CONFIG & 2-WAY WEBHOOKS =================
export const adminGetShippingConfig = (_req, res) => {
    return res.json({
        success: true,
        data: {
            config: shippingConfigStore,
            logs: webhookLogsStore.map(formatWebhookLogForAdmin),
        },
    });
};
export const adminUpdateShippingConfig = (req, res) => {
    const { providerName, outboundWebhookUrl, secretToken, isEnabled, autoPushOnNewOrder } = req.body;
    if (providerName !== undefined)
        shippingConfigStore.providerName = providerName;
    if (outboundWebhookUrl !== undefined)
        shippingConfigStore.outboundWebhookUrl = outboundWebhookUrl;
    if (secretToken !== undefined)
        shippingConfigStore.secretToken = secretToken;
    if (isEnabled !== undefined)
        shippingConfigStore.isEnabled = Boolean(isEnabled);
    if (autoPushOnNewOrder !== undefined)
        shippingConfigStore.autoPushOnNewOrder = Boolean(autoPushOnNewOrder);
    return res.json({
        success: true,
        message: 'Shipping provider webhook configuration saved',
        data: shippingConfigStore,
    });
};
export const adminManualPushOrderWebhook = async (req, res) => {
    const targetOrderId = req.params.orderId || req.params.orderNumber || req.params.id;
    const order = ordersStore.find((o) => o.orderNumber === targetOrderId || o.orderId === targetOrderId || o._id === targetOrderId);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const logEntry = await dispatchOutboundOrderWebhook(order);
    return res.json({
        success: true,
        message: `Order ${targetOrderId} pushed to ${shippingConfigStore.providerName} webhook`,
        data: {
            order: formatOrderForAdmin(order),
            webhookLog: logEntry ? formatWebhookLogForAdmin(logEntry) : null,
        },
    });
};
/**
 * Inbound Webhook Endpoint: POST /api/webhooks/shipping
 * Receives order tracking and status updates from the external shipping provider
 */
export const handleIncomingShippingWebhook = (req, res) => {
    const incomingSecret = req.headers['x-shipping-webhook-secret'] ||
        req.headers['authorization']?.replace('Bearer ', '') ||
        req.body.secretToken;
    if (shippingConfigStore.secretToken && incomingSecret !== shippingConfigStore.secretToken) {
        const unauthorizedLog = {
            id: `wh-log-${Date.now()}`,
            direction: 'INBOUND',
            event: 'shipment.unauthorized',
            orderNumber: req.body?.orderNumber || req.body?.orderId || 'UNKNOWN',
            targetUrl: '/api/webhooks/shipping',
            statusCode: 401,
            payload: req.body,
            response: { success: false, message: 'Invalid x-shipping-webhook-secret token' },
            timestamp: new Date().toISOString(),
        };
        webhookLogsStore.unshift(unauthorizedLog);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized shipping webhook: Invalid x-shipping-webhook-secret header',
        });
    }
    const targetOrderId = req.body.orderNumber || req.body.orderId;
    const { status, providerStatus, trackingNumber, courierName, note, location } = req.body;
    if (!targetOrderId) {
        return res.status(400).json({ success: false, message: 'orderId or orderNumber is required in webhook payload' });
    }
    const order = ordersStore.find((o) => o.orderNumber === targetOrderId || o.orderId === targetOrderId || o._id === targetOrderId);
    if (!order) {
        return res.status(404).json({ success: false, message: `Order ${targetOrderId} not found` });
    }
    // Normalize external provider status codes to KashBites order statuses
    const rawStatus = String(status || providerStatus || '').toUpperCase();
    let mappedStatus = order.orderStatus;
    if (rawStatus.includes('PACK') || rawStatus === 'PICKED_UP' || rawStatus === 'MANIFESTED') {
        mappedStatus = 'Srinagar Cold-Packing';
    }
    else if (rawStatus.includes('SHIP') || rawStatus === 'IN_TRANSIT' || rawStatus === 'DISPATCHED') {
        mappedStatus = 'Shipped';
    }
    else if (rawStatus.includes('OUT') || rawStatus === 'OUT_FOR_DELIVERY') {
        mappedStatus = 'Out for Delivery';
    }
    else if (rawStatus.includes('DELIVER') || rawStatus === 'DELIVERED') {
        mappedStatus = 'Delivered';
        order.paymentStatus = 'Paid';
    }
    else if (rawStatus.includes('CANCEL') || rawStatus === 'RTO' || rawStatus === 'CANCELLED') {
        mappedStatus = 'Cancelled';
    }
    else if (['Confirmed', 'Srinagar Cold-Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(status)) {
        mappedStatus = status;
    }
    order.orderStatus = mappedStatus;
    if (trackingNumber)
        order.trackingNumber = trackingNumber;
    if (courierName)
        order.courierName = courierName;
    order.webhookSynced = true;
    if (!Array.isArray(order.statusHistory)) {
        order.statusHistory = [];
    }
    order.statusHistory.push({
        status: mappedStatus,
        note: note ||
            `Shipping provider webhook update (${rawStatus || mappedStatus})${location ? ` at ${location}` : ''}`,
        updatedBy: courierName || shippingConfigStore.providerName || 'Shipping Provider Webhook',
        timestamp: new Date().toISOString(),
    });
    const responsePayload = {
        success: true,
        orderNumber: order.orderNumber || order.orderId,
        orderId: order.orderNumber || order.orderId,
        updatedOrderStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        timestamp: new Date().toISOString(),
        data: formatOrderForAdmin(order),
    };
    webhookLogsStore.unshift({
        id: `wh-log-${Date.now()}`,
        direction: 'INBOUND',
        event: `shipment.${rawStatus.toLowerCase() || 'status_updated'}`,
        orderNumber: order.orderNumber || order.orderId,
        targetUrl: '/api/webhooks/shipping',
        statusCode: 200,
        payload: req.body,
        response: responsePayload,
        timestamp: new Date().toISOString(),
    });
    return res.json(responsePayload);
};
// ================= 7. ORDERS MANAGEMENT & CANCELLATION =================
export const adminGetOrders = (_req, res) => {
    return res.json({
        success: true,
        count: ordersStore.length,
        data: ordersStore.map(formatOrderForAdmin),
    });
};
export const adminUpdateOrderStatus = (req, res) => {
    const targetOrderId = req.params.id || req.params.orderNumber || req.params.orderId;
    const { status, orderStatus, paymentStatus, trackingNumber, courierName, note } = req.body;
    const nextStatus = status || orderStatus;
    const order = ordersStore.find((o) => o.orderNumber === targetOrderId || o.orderId === targetOrderId || o._id === targetOrderId);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (nextStatus)
        order.orderStatus = nextStatus;
    if (paymentStatus)
        order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined)
        order.trackingNumber = trackingNumber;
    if (courierName !== undefined)
        order.courierName = courierName;
    if (!Array.isArray(order.statusHistory)) {
        order.statusHistory = [];
    }
    order.statusHistory.push({
        status: order.orderStatus,
        note: note || `Status updated manually to ${order.orderStatus} by Admin`,
        updatedBy: 'shoaibwani (Admin)',
        timestamp: new Date().toISOString(),
    });
    return res.json({
        success: true,
        message: `Order ${targetOrderId} updated to ${order.orderStatus}`,
        data: formatOrderForAdmin(order),
    });
};
export const adminCancelOrder = (req, res) => {
    const targetOrderId = req.params.id || req.params.orderNumber || req.params.orderId;
    const { reason } = req.body;
    const order = ordersStore.find((o) => o.orderNumber === targetOrderId || o.orderId === targetOrderId || o._id === targetOrderId);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
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
    return res.json({
        success: true,
        message: `Order ${targetOrderId} has been cancelled`,
        data: formatOrderForAdmin(order),
    });
};
// ================= 8. CUSTOMER ACCOUNTS & PASSWORD MANAGEMENT =================
export const adminGetUsers = (_req, res) => {
    const enrichedUsers = usersStore.map((u) => {
        const userOrders = ordersStore.filter((o) => o.shippingAddress?.phone === u.phone ||
            o.customer?.phone === u.phone ||
            o.shippingAddress?.fullName?.toLowerCase() === u.name?.toLowerCase() ||
            o.customer?.fullName?.toLowerCase() === u.name?.toLowerCase());
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
    return res.json({
        success: true,
        count: enrichedUsers.length,
        data: enrichedUsers,
    });
};
export const adminUpdateUserPassword = (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || String(newPassword).trim().length < 4) {
        return res
            .status(400)
            .json({ success: false, message: 'New password must be at least 4 characters long' });
    }
    const user = usersStore.find((u) => u._id === id || u.email === id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'Customer account not found' });
    }
    user.password = String(newPassword).trim();
    const { password: _, ...safeUser } = user;
    return res.json({
        success: true,
        message: `Password updated for ${user.name} (${user.email})`,
        data: safeUser,
    });
};
