import setupMiddlewares from './setup-middlewares.js';
import setupRoutes from './setup-routes.js';

export const setupApp = (app) => {
    setupMiddlewares(app);
    setupRoutes(app);
};

export default setupApp;
