import { Product } from '../database/models/products.model.js';
import { Category } from '../database/models/categories.model.js';
import { Coupon } from '../database/models/coupons.model.js';
import { ApiError } from '../errors/api-error.js';
import mongoose from 'mongoose';

export class ProductService {
    /**
     * List products with filtering and sorting
     */
    static async list({ category, search, sort, isCombo, featured } = {}) {
        const query = {};
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

        return await Product.find(query).sort(sortOption).lean();
    }

    /**
     * Retrieve single product by ID or slug
     */
    static async getById({ id }) {
        if (!id) {
            throw ApiError.badRequest('Product ID or slug is required');
        }

        const legacySlugMap = {
            'kb-prod-01': 'kashmiri-walnuts',
            'kb-prod-02': 'kashmiri-almonds',
            'kb-prod-03': 'dried-apricots',
            'kb-prod-04': 'walnut-kernels',
            'kb-prod-05': 'signature-collection-emerald-box',
            'kb-prod-06': 'mixed-dry-fruits',
            'kb-prod-07': 'valley-trio-harvest-combo',
            'kb-prod-08': 'kashmiri-raisins',
        };
        const targetId = legacySlugMap[id] || id;

        const query = mongoose.Types.ObjectId.isValid(targetId)
            ? { $or: [{ _id: targetId }, { slug: targetId }] }
            : { slug: targetId };

        let product = null;
        if (mongoose.connection.readyState === 1) {
            product = await Product.findOne(query).lean();
        }

        if (!product) {
            product = productsStore.find(
                (p) =>
                    p.slug === targetId ||
                    String(p._id) === String(targetId) ||
                    String(p.id) === String(targetId) ||
                    p.slug === id ||
                    String(p.id) === String(id)
            );
        }

        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        return product;
    }

    /**
     * Retrieve featured combos
     */
    static async getFeaturedCombos() {
        return await Product.find({ isCombo: true }).lean();
    }

    /**
     * Retrieve categories with dynamic product counts from MongoDB
     */
    static async getCategories() {
        const [categories, totalProductCount, categoryAggregations, combosCount] = await Promise.all([
            Category.find().lean(),
            Product.countDocuments(),
            Product.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
            ]),
            Product.countDocuments({ $or: [{ isCombo: true }, { category: 'combos' }] }),
        ]);

        const countMap = {};
        for (const item of categoryAggregations) {
            countMap[item._id] = item.count;
        }
        countMap['combos'] = combosCount;

        return [
            {
                id: 'all',
                name: 'All Dry Fruits',
                count: totalProductCount,
                description: 'Complete Kashmir harvest collection',
            },
            ...categories.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description || '',
                count: countMap[c.id] || 0,
            })),
        ];
    }

    /**
     * Retrieve active promotional offers from MongoDB
     */
    static async getActiveOffers() {
        const coupons = await Coupon.find({ isActive: true }).lean();
        return coupons.map((c) => ({
            id: c._id.toString(),
            title: c.code,
            subtitle: c.description,
            badgeText: `${c.discountValue}${c.discountType === 'PERCENTAGE' ? '%' : '₹'} OFF`,
            discountPercentage: c.discountType === 'PERCENTAGE' ? c.discountValue : undefined,
            targetCategory: 'all',
            couponCode: c.code,
            isActive: c.isActive,
        }));
    }
}

export default ProductService;
