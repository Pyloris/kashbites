import router from '../routes/index.routes.js';
import { errorHandler } from '../middleware/error-handler.js';
import { setupSwagger } from '../swagger/index.js';

export const setupRoutes = (app) => {
    // 1. Attach OpenAPI / Swagger Documentation at /swagger and /swagger.json
    setupSwagger(app);

    // 2. Mount API Routes with /api prefix
    app.use('/api', router);

    // 3. Mount Global Error Handler LAST (must be after all routes)
    app.use(errorHandler);
};

export default setupRoutes;
