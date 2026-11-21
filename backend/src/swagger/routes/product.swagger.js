/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Dry fruits, almonds, walnuts, combos, and harvest products
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "kb-prod-01"
 *         name:
 *           type: string
 *           example: "Kashmiri Kagzi Walnuts"
 *         slug:
 *           type: string
 *           example: "kashmiri-walnuts"
 *         category:
 *           type: string
 *           example: "walnuts"
 *         tagline:
 *           type: string
 *           example: "Single-origin Shopian harvest"
 *         price:
 *           type: number
 *           example: 949
 *         originalPrice:
 *           type: number
 *           example: 1199
 *         rating:
 *           type: number
 *           example: 4.9
 *         inStock:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List all products with filtering and sorting
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter (e.g. walnuts, almonds, combos)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price-low, price-high, rating]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *
 * /products/combos:
 *   get:
 *     summary: Retrieve featured combos and gift hampers
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Featured combos
 *
 * /products/categories:
 *   get:
 *     summary: Retrieve list of product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Product categories list
 *
 * /products/offers:
 *   get:
 *     summary: Retrieve active promotional harvest offers
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Active promotional offers
 *
 * /products/{id}:
 *   get:
 *     summary: Get single product by ID or slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */

export default {};
