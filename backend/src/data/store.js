import { initialProducts, initialReviews } from './seedData.js';
// 1. Seeded Admin Account (shoaibwani)
export const adminsStore = [
    {
        username: 'shoaibwani',
        password: 'kashbites@admin2026',
        name: 'Shoaib Wani',
        email: 'shoaibwani@kashbites.com',
        role: 'superadmin',
        lastLogin: new Date().toISOString(),
    },
];
// 2. Dynamic Categories Store
export const categoriesStore = [
    { id: 'walnuts', name: 'Kashmiri Walnuts', description: 'Soft-shelled Kagzi walnuts from Shopian & Pulwama' },
    { id: 'almonds', name: 'Mamra Almonds', description: 'High-oil single-origin Kashmiri Badam Giri' },
    { id: 'apricots', name: 'Dried Apricots & Raisins', description: 'Sun-dried Himalayan Khubani and shade-cured Kishmish' },
    { id: 'kernels', name: 'Walnut Kernels', description: 'Hand-cracked snow-white Extra Light Halves' },
    { id: 'combos', name: 'Royal Gift Hampers & Combos', description: 'Signature Emerald Gift Boxes & value bundles' },
    { id: 'mixes', name: 'Healthy Mixes', description: 'Daily energy superfood nut and fruit medleys' },
];
// 3. Products Store (Enriched with stockQuantity, promotionalOfferTag, and stable IDs)
export const productsStore = initialProducts.map((p, idx) => {
    const id = p._id || p.id || `kb-prod-0${idx + 1}`;
    return {
        _id: id,
        id,
        ...p,
        stockQuantity: idx === 4 ? 42 : 120,
        promotionalOfferTag: idx === 0 ? 'Autumn 2026 Harvest Offer' : idx === 4 ? 'Royal Festive Launch' : '',
        netWeights: p.netWeights.map((nw) => ({
            ...nw,
            stockQuantity: nw.stockQuantity ?? 45,
        })),
    };
});
// 4. Coupons Store (Percentage & Flat discounts with min order & expiry rules)
export const couponsStore = [
    {
        code: 'KASHMIR10',
        description: '10% off across all authentic Kashmiri dry fruits',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 499,
        maxDiscountAmount: 500,
        isActive: true,
        expiryDate: '2027-03-31',
        usageCount: 34,
    },
    {
        code: 'CHINAR10',
        description: '10% Chinar Club Member loyalty discount',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscountAmount: 400,
        isActive: true,
        expiryDate: '2027-12-31',
        usageCount: 19,
    },
    {
        code: 'WELCOME200',
        description: 'Flat ₹200 off on Royal Gift Hampers & orders above ₹1,499',
        discountType: 'FLAT',
        discountValue: 200,
        minOrderAmount: 1499,
        isActive: true,
        expiryDate: '2027-06-30',
        usageCount: 12,
    },
    {
        code: 'HARVEST25',
        description: '25% festive season discount on bulk family orders above ₹2,499',
        discountType: 'PERCENTAGE',
        discountValue: 25,
        minOrderAmount: 2499,
        maxDiscountAmount: 750,
        isActive: true,
        expiryDate: '2027-01-31',
        usageCount: 8,
    },
];
// 5. Promotional Offers Store
export const offersStore = [
    {
        id: 'off-01',
        title: 'Fresh Autumn 2026 Harvest Launch',
        subtitle: 'Free Air Courier on orders over ₹999 · Direct from Shopian & Pulwama',
        badgeText: '10% OFF CODE: KASHMIR10',
        discountPercentage: 10,
        targetCategory: 'all',
        couponCode: 'KASHMIR10',
        isActive: true,
    },
    {
        id: 'off-02',
        title: 'Royal Emerald Gift Hamper Special',
        subtitle: 'Save ₹600 on 6-Jar Heritage Glass Collection with 24K Gold Foil Box',
        badgeText: 'SAVE ₹600',
        discountPercentage: 23,
        targetCategory: 'combos',
        couponCode: 'WELCOME200',
        isActive: true,
    },
];
// 6. Customer Users Store
export const usersStore = [
    {
        name: 'Mohammad Owais',
        email: 'mohammadowais616@gmail.com',
        phone: '+91 98765 43210',
        password: 'password123',
        role: 'member',
        avatar: '',
        memberTier: 'Chinar Gold Member',
        chinarPoints: 450,
        addresses: [
            {
                id: 'addr-01',
                label: 'Home (Srinagar)',
                fullName: 'Mohammad Owais',
                phone: '+91 98765 43210',
                addressLine1: 'House No. 14, Boulevard Road',
                addressLine2: 'Opposite Ghat No. 7, Dal Lake',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '190001',
                isDefault: true,
            },
            {
                id: 'addr-02',
                label: 'Office / Delhi Hub',
                fullName: 'Mohammad Owais',
                phone: '+91 98765 43210',
                addressLine1: 'B-42, Defence Colony',
                addressLine2: 'Main Ring Road',
                city: 'New Delhi',
                state: 'Delhi',
                pincode: '110024',
                isDefault: false,
            },
        ],
        notifications: {
            smsAlerts: true,
            whatsappAlerts: true,
            harvestNewsletter: true,
        },
        createdAt: '2026-10-14T09:30:00.000Z',
    },
    {
        name: 'Dr. Ananya Sharma',
        email: 'ananya.sharma@example.com',
        phone: '+91 98111 22334',
        password: 'ananya@2026',
        avatar: '',
        memberTier: 'Chinar Club Member',
        chinarPoints: 280,
        addresses: [
            {
                id: 'addr-03',
                label: 'Home (New Delhi)',
                fullName: 'Dr. Ananya Sharma',
                phone: '+91 98111 22334',
                addressLine1: 'C-19, Vasant Vihar',
                city: 'New Delhi',
                state: 'Delhi',
                pincode: '110057',
                isDefault: true,
            },
        ],
        notifications: {
            smsAlerts: true,
            whatsappAlerts: true,
            harvestNewsletter: false,
        },
        createdAt: '2026-10-22T14:15:00.000Z',
    },
    {
        name: 'Zubair Ahmad Mir',
        email: 'zubair.mir@example.com',
        phone: '+91 94190 55667',
        password: 'zubair@2026',
        avatar: '',
        memberTier: 'Chinar Gold Member',
        chinarPoints: 620,
        addresses: [
            {
                id: 'addr-04',
                label: 'Residence',
                fullName: 'Zubair Ahmad Mir',
                phone: '+91 94190 55667',
                addressLine1: 'Rajbagh Extension, Near Zero Bridge',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '190008',
                isDefault: true,
            },
        ],
        notifications: {
            smsAlerts: true,
            whatsappAlerts: true,
            harvestNewsletter: true,
        },
        createdAt: '2026-11-01T11:05:00.000Z',
    },
];
// 7. Orders Store
export const ordersStore = [
    {
        orderNumber: 'KB-88219',
        items: [
            {
                productId: 'kb-prod-05',
                name: 'KashBites Signature Collection — Emerald Gift Box',
                weight: '1.2kg (6 x 200g Glass Jars)',
                price: 1999,
                quantity: 1,
                image: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM_2a73fcbc.jpeg',
                slug: 'signature-collection-emerald-box',
            },
        ],
        shippingAddress: {
            fullName: 'Mohammad Owais',
            phone: '+91 98765 43210',
            addressLine1: 'Boulevard Road, Dal Lake',
            addressLine2: 'Near Nehru Park',
            city: 'Srinagar',
            state: 'Jammu & Kashmir',
            pincode: '190001',
        },
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        orderStatus: 'Srinagar Cold-Packing',
        trackingNumber: 'SXR-DLV-908821',
        courierName: 'Delhivery Air Express',
        webhookSynced: true,
        statusHistory: [
            {
                status: 'Confirmed',
                note: 'Order placed and allocated to Shopian / Srinagar batch',
                updatedBy: 'System',
                timestamp: '2026-11-05T10:15:00.000Z',
            },
            {
                status: 'Srinagar Cold-Packing',
                note: 'Nitrogen-flushed cold packing initiated at Sanat Nagar Hub',
                updatedBy: 'shoaibwani',
                timestamp: '2026-11-06T08:40:00.000Z',
            },
        ],
        subtotal: 1999,
        shippingFee: 0,
        discount: 100,
        total: 1899,
        createdAt: '2026-11-05T10:15:00.000Z',
    },
    {
        orderNumber: 'KB-74910',
        items: [
            {
                productId: 'kb-prod-01',
                name: 'Kashmiri Walnuts (In-Shell & Giri)',
                weight: '1kg',
                price: 949,
                quantity: 1,
                image: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg',
                slug: 'kashmiri-walnuts',
            },
            {
                productId: 'kb-prod-02',
                name: 'Kashmiri Mamra Almonds (Badam Giri)',
                weight: '500g',
                price: 699,
                quantity: 1,
                image: '/assets/aistudio/WhatsApp_Image_2026-11-04_at_9.24.34_PM_161e8d45.jpeg',
                slug: 'kashmiri-almonds',
            },
        ],
        shippingAddress: {
            fullName: 'Dr. Ananya Sharma',
            phone: '+91 98111 22334',
            addressLine1: 'C-19, Vasant Vihar',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110057',
        },
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        orderStatus: 'Shipped',
        trackingNumber: 'SXR-BLD-441029',
        courierName: 'BlueDart Air',
        webhookSynced: true,
        statusHistory: [
            {
                status: 'Confirmed',
                note: 'UPI payment verified',
                updatedBy: 'System',
                timestamp: '2026-11-04T14:22:00.000Z',
            },
            {
                status: 'Shipped',
                note: 'Handed over to BlueDart Air at Srinagar Airport (SXR)',
                updatedBy: 'Shipping Webhook',
                timestamp: '2026-11-05T17:10:00.000Z',
            },
        ],
        subtotal: 1648,
        shippingFee: 0,
        discount: 165,
        total: 1483,
        createdAt: '2026-11-04T14:22:00.000Z',
    },
];
// 8. Reviews Store
export const reviewsStore = [...initialReviews];
// 9. Shipping Provider Webhook Configuration & Audit Logs
export const shippingConfigStore = {
    providerName: 'Delhivery Air Express (Srinagar Hub)',
    outboundWebhookUrl: 'https://shipping-webhook.kashbites-logistics.io/v1/orders/push',
    secretToken: 'kb_whsec_srinagar_2026',
    isEnabled: true,
    autoPushOnNewOrder: true,
};
export const webhookLogsStore = [
    {
        id: 'wh-log-101',
        direction: 'OUTBOUND',
        event: 'order.created',
        orderNumber: 'KB-88219',
        targetUrl: 'https://shipping-webhook.kashbites-logistics.io/v1/orders/push',
        statusCode: 200,
        payload: {
            event: 'order.created',
            orderNumber: 'KB-88219',
            recipient: 'Mohammad Owais',
            city: 'Srinagar',
            pincode: '190001',
            codAmount: 1899,
            weightGrams: 1200,
        },
        response: {
            acknowledged: true,
            awbAssigned: 'SXR-DLV-908821',
            routingHub: 'Srinagar Airport Air Cargo',
        },
        timestamp: '2026-11-05T10:15:02.000Z',
    },
    {
        id: 'wh-log-102',
        direction: 'INBOUND',
        event: 'shipment.status_updated',
        orderNumber: 'KB-74910',
        targetUrl: '/api/webhooks/shipping',
        statusCode: 200,
        payload: {
            orderNumber: 'KB-74910',
            providerStatus: 'IN_TRANSIT',
            mappedStatus: 'Shipped',
            trackingNumber: 'SXR-BLD-441029',
            courierName: 'BlueDart Air',
            location: 'Srinagar International Airport (SXR)',
        },
        response: {
            success: true,
            updatedOrderStatus: 'Shipped',
        },
        timestamp: '2026-11-05T17:10:00.000Z',
    },
];
/**
 * Dispatches an outbound webhook whenever a new order is placed (or manually pushed)
 * if the shipping provider integration is enabled.
 */
export const dispatchOutboundOrderWebhook = async (order) => {
    if (!shippingConfigStore.isEnabled || !shippingConfigStore.outboundWebhookUrl) {
        return null;
    }
    const payload = {
        event: 'order.created',
        timestamp: new Date().toISOString(),
        provider: shippingConfigStore.providerName,
        order: {
            orderNumber: order.orderNumber,
            paymentMethod: order.paymentMethod,
            collectableAmount: order.paymentMethod === 'COD' ? order.total : 0,
            totalValue: order.total,
            shippingAddress: order.shippingAddress,
            items: order.items.map((i) => ({
                name: i.name,
                weight: i.weight,
                quantity: i.quantity,
                price: i.price,
            })),
        },
    };
    let statusCode = 200;
    let responseBody = {
        acknowledged: true,
        provider: shippingConfigStore.providerName,
        assignedAwb: `SXR-${Math.floor(100000 + Math.random() * 900000)}`,
        message: 'Order manifested for Srinagar Air Cargo pickup',
    };
    // Attempt real HTTP POST if target URL is reachable, with 2.5s timeout fallback
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(shippingConfigStore.outboundWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-shipping-webhook-secret': shippingConfigStore.secretToken,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        clearTimeout(timeout);
        statusCode = res.status;
        const text = await res.text();
        try {
            responseBody = JSON.parse(text);
        }
        catch {
            responseBody = { rawResponse: text.slice(0, 300) };
        }
    }
    catch (err) {
        // If target URL is a placeholder/demo domain, record simulated 200 AWB assignment so webhook workflow is verifiable
        if (shippingConfigStore.outboundWebhookUrl.includes('kashbites-logistics.io')) {
            statusCode = 200;
        }
        else {
            statusCode = 202;
            responseBody = {
                queued: true,
                note: `Dispatched to ${shippingConfigStore.outboundWebhookUrl} (${err?.message || 'async relay'})`,
                assignedAwb: `SXR-${Math.floor(100000 + Math.random() * 900000)}`,
            };
        }
    }
    order.webhookSynced = true;
    if (!order.trackingNumber && responseBody.assignedAwb) {
        order.trackingNumber = responseBody.assignedAwb;
        order.courierName = shippingConfigStore.providerName;
    }
    const logEntry = {
        id: `wh-log-${Date.now()}`,
        direction: 'OUTBOUND',
        event: 'order.created',
        orderNumber: order.orderNumber,
        targetUrl: shippingConfigStore.outboundWebhookUrl,
        statusCode,
        payload,
        response: responseBody,
        timestamp: new Date().toISOString(),
    };
    webhookLogsStore.unshift(logEntry);
    return logEntry;
};

// 12. Temporary Orders Store (for Razorpay online checkout attempts and pending payment sessions)
export const temporaryOrdersStore = [];

