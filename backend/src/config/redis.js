import { appConfig } from './app-config.js';

export const redisConnection = {
    host: appConfig.REDIS_HOST,
    port: appConfig.REDIS_PORT,
    ...(appConfig.REDIS_PASSWORD ? { password: appConfig.REDIS_PASSWORD } : {}),
    maxRetriesPerRequest: null,
};

export default redisConnection;
