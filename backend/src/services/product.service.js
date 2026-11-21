import { Product } from '../database/models/products.model.js';
import { productsStore, categoriesStore, offersStore } from '../data/store.js';
import { ApiError } from '../errors/api-error.js';
import mongoose from 'mongoose';

export class ProductService {
    /**
     * List products with filtering and sorting
     */
    static async list({ category, search, sort, isCombo, featured } = {}) {
        if (mongoose.connection.readyState === 1) {
            let query = {};
            if (category && category !== 'all') {
                query.category = category;
            }
            if (isCombo === 'true' || isCombo === true) {
                query.isCombo = true;
            }
            if (featured === 'true' || featured === true) {
                query.featured = true;
            }
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { tagline: { $regex: search, $options: 'i' } },
                ];
            }
            let sortOption = { createdAt: -1 };
            if (sort === 'price-low') sortOption = { price: 1 };
            if (sort === 'price-high') sortOption = { price: -1 };
            if (sort === 'rating') sortOption = { rating: -1 };

            const products = await Product.find(query).sort(sortOption).lean();
            if (products.length > 0) {
                return products;
            }
        }

        let filtered = [...productsStore];
        if (category && category !== 'all') {
            filtered = filtered.filter((p) => p.category === category);
        }
        if (isCombo === 'true' || isCombo === true) {
            filtered = filtered.filter((p) => p.isCombo);
        }
        if (featured === 'true' || featured === true) {
            filtered = filtered.filter((p) => p.featured);
        }
        if (search && typeof search === 'string') {
            const q = search.toLowerCase();
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.tagline.toLowerCase().includes(q)
            );
        }
        if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
        if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
        if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

        return filtered;
    }

    /**
     * Retrieve single product by ID or slug
     */
    static async getById({ id }) {
        if (!id) {
            throw ApiError.badRequest('Product ID or slug is required');
        }

        if (mongoose.connection.readyState === 1) {
            const query = mongoose.Types.ObjectId.isValid(id)
                ? { $or: [{ _id: id }, { slug: id }] }
                : { slug: id };
            const product = await Product.findOne(query).lean();
            if (product) {
                return product;
            }
        }

        const item = productsStore.find((p) => p._id === id || p.slug === id);
        if (!item) {
            throw ApiError.notFound('Product not found');
        }

        return item;
    }

    /**
     * Retrieve featured combos
     */
    static async getFeaturedCombos() {
        return productsStore.filter((p) => p.isCombo);
    }

    /**
     * Retrieve categories with product counts
     */
    static async getCategories() {
        return [
            { id: 'all', name: 'All Dry Fruits', count: productsStore.length, description: 'Complete Kashmir harvest collection' },
            ...categoriesStore.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                count: c.id === 'combos'
                    ? productsStore.filter((p) => p.isCombo || p.category === 'combos').length
                    : productsStore.filter((p) => p.category === c.id).length,
            })),
        ];
    }

    /**
     * Retrieve active promotional offers
     */
    static async getActiveOffers() {
        return offersStore.filter((o) => o.isActive);
    }
}

export default ProductService;
