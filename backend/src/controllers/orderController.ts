import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import {
  ordersStore,
  couponsStore,
  shippingConfigStore,
  dispatchOutboundOrderWebhook,
} from '../data/store.js';
import mongoose from 'mongoose';

export const calculateCouponDiscount = (code: string | undefined, subtotal: number): number => {
  if (!code) return 0;
  const trimmed = code.trim().toUpperCase();
  const coupon = couponsStore.find((c) => c.code === trimmed && c.isActive);
  if (!coupon) return 0;
  if (subtotal < coupon.minOrderAmount) return 0;

  // Check expiry
  if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
    return 0;
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return Math.min(discount, subtotal);
};

export const validateCoupon = (req: Request, res: Response) => {
  const { code, subtotal = 1000 } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  const trimmed = String(code).trim().toUpperCase();
  const coupon = couponsStore.find((c) => c.code === trimmed);

  if (!coupon || !coupon.isActive) {
    return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
    return res.status(400).json({ success: false, message: 'This coupon has expired' });
  }

  if (Number(subtotal) < coupon.minOrderAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order of ₹${coupon.minOrderAmount} required for ${coupon.code}`,
    });
  }

  const discountAmount = calculateCouponDiscount(trimmed, Number(subtotal));
  return res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      discountAmount,
      description: coupon.description,
    },
  });
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || !items.length || !shippingAddress || !shippingAddress.fullName) {
      return res.status(400).json({ success: false, message: 'Incomplete order payload' });
    }

    const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    const shippingFee = subtotal >= 999 ? 0 : 99;
    const discount = calculateCouponDiscount(couponCode, subtotal);
    const total = Math.max(0, subtotal + shippingFee - discount);

    if (couponCode && discount > 0) {
      const usedCoupon = couponsStore.find((c) => c.code === String(couponCode).trim().toUpperCase());
      if (usedCoupon) usedCoupon.usageCount += 1;
    }

    const orderNumber = `KB-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: any = {
      orderNumber,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Confirmed',
      trackingNumber: '',
      courierName: shippingConfigStore.isEnabled ? shippingConfigStore.providerName : '',
      webhookSynced: false,
      statusHistory: [
        {
          status: 'Confirmed',
          note: 'Order received and assigned to Srinagar hub',
          updatedBy: 'Customer Checkout',
          timestamp: new Date().toISOString(),
        },
      ],
      subtotal,
      shippingFee,
      discount,
      total,
      createdAt: new Date().toISOString(),
    };

    // Automatically push order to shipping provider webhook if configured
    if (shippingConfigStore.isEnabled && shippingConfigStore.autoPushOnNewOrder) {
      await dispatchOutboundOrderWebhook(newOrder);
    }

    ordersStore.unshift(newOrder);

    if (mongoose.connection.readyState === 1) {
      const created = await Order.create(newOrder);
      return res.status(201).json({ success: true, data: created });
    }

    return res.status(201).json({ success: true, data: newOrder });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to process order' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne({ orderNumber: id });
      if (order) return res.json({ success: true, data: order });
    }

    const order = ordersStore.find((o) => o.orderNumber === id);
    if (order) return res.json({ success: true, data: order });

    res.status(404).json({ success: false, message: 'Order tracking ID not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving order' });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find().sort({ createdAt: -1 });
      if (orders.length > 0) {
        return res.json({ success: true, count: orders.length, data: orders });
      }
    }
    res.json({ success: true, count: ordersStore.length, data: ordersStore });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving orders' });
  }
};
