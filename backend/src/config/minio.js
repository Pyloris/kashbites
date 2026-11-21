import * as Minio from 'minio';
import { appConfig } from './app-config.js';

export const MINIO_BUCKET = appConfig.MINIO_BUCKET_NAME;

export const minioClient = new Minio.Client({
    endPoint: appConfig.MINIO_ENDPOINT,
    port: appConfig.MINIO_PORT,
    useSSL: appConfig.MINIO_USE_SSL,
    accessKey: appConfig.MINIO_ACCESS_KEY,
    secretKey: appConfig.MINIO_SECRET_KEY,
});

let isMinioReady = false;
// In-memory fallback media store when running without Docker MinIO daemon
const inMemoryMediaStore = new Map();

export const initMinIO = async () => {
    try {
        const exists = await Promise.race([
            minioClient.bucketExists(MINIO_BUCKET),
            new Promise((_, reject) => setTimeout(() => reject(new Error('MinIO connection timeout')), 2000)),
        ]);
        if (!exists) {
            await minioClient.makeBucket(MINIO_BUCKET, 'us-east-1');
            const publicPolicy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
                    },
                ],
            };
            await minioClient.setBucketPolicy(MINIO_BUCKET, JSON.stringify(publicPolicy));
        }
        isMinioReady = true;
        console.log(`[MinIO] Connected and bucket '${MINIO_BUCKET}' is ready at ${appConfig.MINIO_PUBLIC_URL}`);
        return true;
    } catch (error) {
        isMinioReady = false;
        console.warn(`[MinIO] MinIO daemon not reachable at ${appConfig.MINIO_ENDPOINT}:${appConfig.MINIO_PORT}. Using local Express media proxy fallback.`);
        return false;
    }
};

export const getMinIOStatus = () => ({
    connected: isMinioReady,
    bucket: MINIO_BUCKET,
    endpoint: `${appConfig.MINIO_ENDPOINT}:${appConfig.MINIO_PORT}`,
    provider: isMinioReady ? 'MinIO S3 Object Storage' : 'Express Static Media Proxy (MinIO Fallback)',
});

/**
 * Uploads a file buffer to MinIO under a folder prefix (e.g. 'products', 'reviews')
 */
export const uploadToMinIO = async (folder, originalName, buffer, mimeType) => {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `${folder}/${Date.now()}-${safeName}`;
    if (isMinioReady) {
        await minioClient.putObject(MINIO_BUCKET, objectKey, buffer, buffer.length, {
            'Content-Type': mimeType,
        });
        return {
            url: `${appConfig.MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${objectKey}`,
            objectKey,
            storage: 'minio',
        };
    }
    // Fallback: store in memory and serve via /api/media/file/:folder/:filename
    inMemoryMediaStore.set(objectKey, { buffer, mimeType });
    return {
        url: `/api/media/file/${objectKey}`,
        objectKey,
        storage: 'local-fallback',
    };
};

export const getFallbackMediaObject = (objectKey) => {
    return inMemoryMediaStore.get(objectKey) || null;
};

export default {
    minioClient,
    MINIO_BUCKET,
    initMinIO,
    getMinIOStatus,
    uploadToMinIO,
    getFallbackMediaObject,
};
