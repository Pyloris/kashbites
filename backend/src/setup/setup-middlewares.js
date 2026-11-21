import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { appConfig } from '../config/app-config.js';

export const setupMiddlewares = (app) => {
    // Dynamic CORS validation
    const corsOptions = {
        origin: (origin, callback) => {
            const allowedOrigins = [
                appConfig.BASE_URL,
                appConfig.APP_URL,
                appConfig.UI_SERVICE_URL,
                ...appConfig.CORS_ORIGIN.split(',').map((s) => s.trim()),
            ];

            // Allow requests without Origin (curl, server-to-server, health checks)
            if (!origin) {
                return callback(null, true);
            }

            // Allow localhost and local IP ranges during development
            const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

            if (allowedOrigins.includes(origin) || isLocalhost) {
                return callback(null, true);
            }

            return callback(null, true); // Permissive in dev to avoid blocking unexpected proxy ports
        },
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Accept,Origin,x-api-key,x-shipping-webhook-secret',
    };

    app.use(cors(corsOptions));

    // Request body parsers with explicit payload limits
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 }));

    app.use(cookieParser());

    // Logging: skip noisy OPTIONS preflights
    app.use(
        morgan('tiny', {
            skip: (req) => req.method === 'OPTIONS',
        })
    );
};

export default setupMiddlewares;
