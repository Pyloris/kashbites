import { Config } from "./env.js";

export const appConfig = {
    // Runtime Environment
    NODE_ENV: Config.get("NODE_ENV", "development"),
    PORT: parseInt(Config.get("PORT", "5000"), 10),
    APP_NAME: Config.get("APP_NAME", "kashbites-backend"),
    APP_VERSION: Config.get("APP_VERSION", "1.0.0"),
    BASE_URL: Config.get("BASE_URL", `http://localhost:${Config.get("PORT", "5000")}`),
    APP_URL: Config.get("APP_URL", "http://localhost:3000"),

    // Database
    MONGODB_URI: Config.get("MONGODB_URI", "mongodb://localhost:27017/kashbites"),

    // MinIO S3 Object Storage
    MINIO_ENDPOINT: Config.get("MINIO_ENDPOINT", "localhost"),
    MINIO_PORT: parseInt(Config.get("MINIO_PORT", "9000"), 10),
    MINIO_USE_SSL: Config.get("MINIO_USE_SSL", "false") === "true",
    MINIO_ACCESS_KEY: Config.get("MINIO_ACCESS_KEY") || Config.get("MINIO_ROOT_USER", "kashbites_admin"),
    MINIO_SECRET_KEY: Config.get("MINIO_SECRET_KEY") || Config.get("MINIO_ROOT_PASSWORD", "kashbites_minio_secret_2026"),
    MINIO_BUCKET_NAME: Config.get("MINIO_BUCKET_NAME", "kashbites-media"),
    MINIO_PUBLIC_URL: Config.get("MINIO_PUBLIC_URL", `http://${Config.get("MINIO_ENDPOINT", "localhost")}:${Config.get("MINIO_PORT", "9000")}`),

    // Security & Auth Keys
    JWT_SECRET: Config.get("JWT_SECRET", "kashbites_kashmir_authentic_secret_key_2026"),
    SERVICE_KEY: Config.get("SERVICE_KEY", "kashbites_internal_service_key_2026"),

    // Downstream / CORS Whitelist
    CORS_ORIGIN: Config.get("CORS_ORIGIN", "http://localhost:3000,http://localhost:3001,http://localhost:9099"),
    UI_SERVICE_URL: Config.get("UI_SERVICE_URL", "http://localhost:3000"),

    // Shipping Webhooks
    SHIPPING_WEBHOOK_SECRET: Config.get("SHIPPING_WEBHOOK_SECRET", "kb_whsec_srinagar_2026"),
    SHIPPING_OUTBOUND_WEBHOOK_URL: Config.get("SHIPPING_OUTBOUND_WEBHOOK_URL", "https://shipping-webhook.kashbites-logistics.io/v1/orders/push"),

    // Razorpay Payment Gateway
    RAZORPAY_KEY_ID: Config.get("RAZORPAY_KEY_ID", "rzp_test_U2mH2Akaz5tMoi"),
    RAZORPAY_KEY_SECRET: Config.get("RAZORPAY_KEY_SECRET", "GwbR12o3uyN8GrUlGCwW31ew"),
    RAZORPAY_WEBHOOK_SECRET: Config.get("RAZORPAY_WEBHOOK_SECRET", "whsec_kashbites_razorpay_2026"),

    // SMTP Email Configuration
    SMTP_HOST: Config.get("SMTP_HOST", "smtp.gmail.com"),
    SMTP_PORT: parseInt(Config.get("SMTP_PORT", "587"), 10),
    SMTP_SECURE: Config.get("SMTP_SECURE", "false") === "true",
    SMTP_USER: Config.get("SMTP_USER", ""),
    SMTP_PASSWORD: Config.get("SMTP_PASSWORD", ""),
    SMTP_FROM_EMAIL: Config.get("SMTP_FROM_EMAIL", "orders@kashbites.in"),
    SMTP_FROM_NAME: Config.get("SMTP_FROM_NAME", "KashBites"),

    // Redis & BullMQ Message Queue
    REDIS_HOST: Config.get("REDIS_HOST", "localhost"),
    REDIS_PORT: parseInt(Config.get("REDIS_PORT", "6379"), 10),
    REDIS_PASSWORD: Config.get("REDIS_PASSWORD", undefined),
};

export default appConfig;
