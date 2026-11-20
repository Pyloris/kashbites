import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { productsStore, categoriesStore, offersStore } from '../data/store.js';
import mongoose from 'mongoose';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, sort, isCombo, featured } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query: any = {};
      if (category && category !== 'all') {
        query.category = category;
      }
      if (isCombo === 'true') {
        query.isCombo = true;
      }
      if (featured === 'true') {
        query.featured = true;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tagline: { $regex: search, $options: 'i' } },
        ];
      }

      let sortOption: any = { createdAt: -1 };
      if (sort === 'price-low') sortOption = { price: 1 };
      if (sort === 'price-high') sortOption = { price: -1 };
      if (sort === 'rating') sortOption = { rating: -1 };

      const products = await Product.find(query).sort(sortOption);
      if (products.length > 0) {
        return res.json({ success: true, count: products.length, data: products });
      }
    }

    let filtered = [...productsStore];
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (isCombo === 'true') {
      filtered = filtered.filter((p) => p.isCombo);
    }
    if (featured === 'true') {
      filtered = filtered.filter((p) => p.featured);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q)
      );
    }

    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findOne({ $or: [{ _id: id }, { slug: id }] });
      if (product) {
        return res.json({ success: true, data: product });
      }
    }

    const item = productsStore.find((p) => p._id === id || p.slug === id);
    if (item) {
      return res.json({ success: true, data: item });
    }

    return res.status(404).json({ success: false, message: 'Product not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving product details' });
  }
};

export const getFeaturedCombos = async (_req: Request, res: Response) => {
  try {
    const combos = productsStore.filter((p) => p.isCombo);
    res.json({ success: true, count: combos.length, data: combos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve combos' });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = [
      { id: 'all', name: 'All Dry Fruits', count: productsStore.length, description: 'Complete Kashmir harvest collection' },
      ...categoriesStore.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        count:
          c.id === 'combos'
            ? productsStore.filter((p) => p.isCombo || p.category === 'combos').length
            : productsStore.filter((p) => p.category === c.id).length,
      })),
    ];
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve categories' });
  }
};

export const getActiveOffers = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: offersStore.filter((o) => o.isActive),
  });
};
