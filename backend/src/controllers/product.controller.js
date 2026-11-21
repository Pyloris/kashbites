import { catchError } from '../errors/catch-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { ProductService } from '../services/product.service.js';

export class ProductController {
    static getAllProducts = catchError(async (req, res) => {
        const { category, search, sort, isCombo, featured } = req.query;
        const products = await ProductService.list({ category, search, sort, isCombo, featured });
        return ApiResponse.success(res, products, 'Products retrieved successfully');
    });

    static getProductById = catchError(async (req, res) => {
        const { id } = req.params;
        const product = await ProductService.getById({ id });
        return ApiResponse.success(res, product, 'Product retrieved successfully');
    });

    static getFeaturedCombos = catchError(async (_req, res) => {
        const combos = await ProductService.getFeaturedCombos();
        return ApiResponse.success(res, combos, 'Combos retrieved successfully');
    });

    static getCategories = catchError(async (_req, res) => {
        const categories = await ProductService.getCategories();
        return ApiResponse.success(res, categories, 'Categories retrieved successfully');
    });

    static getActiveOffers = catchError(async (_req, res) => {
        const offers = await ProductService.getActiveOffers();
        return ApiResponse.success(res, offers, 'Active offers retrieved successfully');
    });
}

// Named exports for backward compatibility if any file imports direct function names
export const getAllProducts = ProductController.getAllProducts;
export const getProductById = ProductController.getProductById;
export const getFeaturedCombos = ProductController.getFeaturedCombos;
export const getCategories = ProductController.getCategories;
export const getActiveOffers = ProductController.getActiveOffers;

export default ProductController;
