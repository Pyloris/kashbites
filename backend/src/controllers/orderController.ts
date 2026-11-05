import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import mongoose from 'mongoose';

// In-memory orders store
let inMemoryOrders: any[] = [
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
    subtotal: 1999,
    shippingFee: 0,
    discount: 100,
    total: 1899,
    createdAt: new Date().toISOString(),
  },
];

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || !items.length || !shippingAddress || !shippingAddress.fullName) {
      return res.status(400).json({ success: false, message: 'Incomplete order payload' });
    }

    const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    const shippingFee = subtotal >= 999 ? 0 : 99; // Free shipping over ₹999
    const discount = couponCode === 'KASHMIR10' ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal + shippingFee - discount;

    const orderNumber = `KB-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      orderNumber,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Confirmed',
      subtotal,
      shippingFee,
      discount,
      total,
      createdAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const created = await Order.create(newOrder);
      return res.status(201).json({ success: true, data: created });
    }

    inMemoryOrders.unshift(newOrder);
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

    const order = inMemoryOrders.find((o) => o.orderNumber === id);
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
      return res.json({ success: true, count: orders.length, data: orders });
    }
    res.json({ success: true, count: inMemoryOrders.length, data: inMemoryOrders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving orders' });
  }
};
