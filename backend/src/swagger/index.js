import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { appConfig } from '../config/app-config.js';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: `${appConfig.APP_NAME} API`,
            version: appConfig.APP_VERSION,
            description: 'KashBites Kashmir Dry Fruits e-commerce platform API documentation generated via OpenAPI 3.0',
        },
        servers: [
            {
                url: '/api/v1',
                description: 'V1 API endpoint prefix',
            },
            {
                url: '/api',
                description: 'Default API prefix',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your Bearer token in the format: Bearer <token>',
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                    description: 'Internal service-to-service API key',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/swagger/routes/*.swagger.js', './src/swagger/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
    // Mount Swagger UI
    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));

    // Expose raw OpenAPI JSON spec
    app.get('/swagger.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};

export default setupSwagger;
