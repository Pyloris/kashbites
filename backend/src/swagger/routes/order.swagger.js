/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Customer order placement, tracking, and coupon verification
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - name
 *         - price
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *         name:
 *           type: string
 *         weight:
 *           type: string
 *         price:
 *           type: number
 *         quantity:
 *           type: number
 *     CreateOrderInput:
 *       type: object
 *       required:
 *         - items
 *         - shippingAddress
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         shippingAddress:
 *           type: object
 *           required:
 *             - fullName
 *             - phone
 *             - addressLine1
 *             - city
 *             - pincode
 *           properties:
 *             fullName:
 *               type: string
 *             phone:
 *               type: string
 *             addressLine1:
 *               type: string
 *             city:
 *               type: string
 *             pincode:
 *               type: string
 *         paymentMethod:
 *           type: string
 *           enum: [COD, UPI, CARD]
 *         couponCode:
 *           type: string
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderInput'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error or incomplete payload
 *   get:
 *     summary: List customer orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Orders list
 *
 * /orders/{id}:
 *   get:
 *     summary: Get order details by orderNumber
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *
 * /orders/validate-coupon:
 *   post:
 *     summary: Validate promotional coupon code
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "KASHMIR10"
 *               subtotal:
 *                 type: number
 *                 example: 1200
 *     responses:
 *       200:
 *         description: Coupon valid and discount calculated
 *       400:
 *         description: Invalid or expired coupon
 *
 * /orders/razorpay/create-order:
 *   post:
 *     summary: Initiate Razorpay checkout and generate temporary order session
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               shippingAddress:
 *                 type: object
 *               couponCode:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [cart, buy_now]
 *     responses:
 *       201:
 *         description: Razorpay order created with temporary order session
 *       400:
 *         description: Incomplete payload or pricing calculation error
 *
 * /orders/razorpay/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment signature and convert temporary order into confirmed order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpayOrderId
 *               - razorpayPaymentId
 *               - razorpaySignature
 *             properties:
 *               temporaryOrderId:
 *                 type: string
 *               razorpayOrderId:
 *                 type: string
 *               razorpayPaymentId:
 *                 type: string
 *               razorpaySignature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment successfully verified and order confirmed
 *       400:
 *         description: Invalid payment signature
 *
 * /orders/razorpay/webhook:
 *   post:
 *     summary: Official Razorpay webhook endpoint for async payment events
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Webhook received and processed
 *
 * /orders/temporary/{id}:
 *   get:
 *     summary: Get status of temporary order session
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Temporary order status
 *       404:
 *         description: Temporary order not found
 */

export default {};
