/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Customer authentication and profile management
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Customer account login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with JWT token
 *       401:
 *         description: Invalid credentials
 *
 * /auth/register:
 *   post:
 *     summary: Customer registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 *
 * /auth/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Profile updated
 *
 * /auth/addresses:
 *   post:
 *     summary: Add delivery address
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Address saved
 */

export default {};
