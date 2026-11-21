/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative dashboard, inventory control, coupon codes, and shipping webhooks
 */

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Admin credentials login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "shoaibwani"
 *               password:
 *                 type: string
 *                 example: "kashbites@admin2026"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *
 * /admin/stats:
 *   get:
 *     summary: Get dashboard KPIs and metrics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard KPIs
 *
 * /admin/products:
 *   get:
 *     summary: Admin inventory product list
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Product list
 *   post:
 *     summary: Add product to inventory
 *     tags: [Admin]
 *     responses:
 *       201:
 *         description: Product created
 *
 * /admin/categories:
 *   get:
 *     summary: List categories
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Categories list
 *
 * /admin/coupons:
 *   get:
 *     summary: List coupons
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Coupons list
 *
 * /admin/orders:
 *   get:
 *     summary: List orders for administration
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Admin orders list
 *
 * /admin/shipping-config:
 *   get:
 *     summary: Get shipping integration configuration and webhook audit logs
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Shipping config and logs
 */

export default {};
