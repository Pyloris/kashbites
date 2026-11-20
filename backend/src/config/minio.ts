import * as Minio from 'minio';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000', 10);
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'kashbites_admin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'kashbites_minio_secret_2026';
export const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || 'kashbites-media';
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || `http://${MINIO_ENDPOINT}:${MINIO_PORT}`;

export const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

let isMinioReady = false;

// In-memory fallback media store when running without Docker MinIO daemon
const inMemoryMediaStore = new Map<string, { buffer: Buffer; mimeType: string }>();

export const initMinIO = async (): Promise<boolean> => {
  try {
    const exists = await Promise.race([
      minioClient.bucketExists(MINIO_BUCKET),
      new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('MinIO connection timeout')), 2000)
      ),
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
    console.log(`[MinIO] Connected and bucket '${MINIO_BUCKET}' is ready at ${MINIO_PUBLIC_URL}`);
    return true;
  } catch (error) {
    isMinioReady = false;
    console.warn(`[MinIO] MinIO daemon not reachable at ${MINIO_ENDPOINT}:${MINIO_PORT}. Using local Express media proxy fallback.`);
    return false;
  }
};

export const getMinIOStatus = () => ({
  connected: isMinioReady,
  bucket: MINIO_BUCKET,
  endpoint: `${MINIO_ENDPOINT}:${MINIO_PORT}`,
  provider: isMinioReady ? 'MinIO S3 Object Storage' : 'Express Static Media Proxy (MinIO Fallback)',
});

/**
 * Uploads a file buffer to MinIO under a folder prefix (e.g. 'products', 'reviews')
 */
export const uploadToMinIO = async (
  folder: 'products' | 'reviews' | 'general',
  originalName: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ url: string; objectKey: string; storage: string }> => {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectKey = `${folder}/${Date.now()}-${safeName}`;

  if (isMinioReady) {
    await minioClient.putObject(MINIO_BUCKET, objectKey, buffer, buffer.length, {
      'Content-Type': mimeType,
    });
    return {
      url: `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${objectKey}`,
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

export const getFallbackMediaObject = (objectKey: string) => {
  return inMemoryMediaStore.get(objectKey) || null;
};
