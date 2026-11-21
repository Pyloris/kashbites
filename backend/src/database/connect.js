import mongoose from 'mongoose';
import { appConfig } from '../config/app-config.js';

let isConnected = false;

/**
 * Connects to MongoDB database with non-blocking failover
 * @returns {Promise<boolean>}
 */
export const connectDb = async () => {
    if (isConnected) {
        return true;
    }
    const uri = appConfig.MONGODB_URI;
    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 2000,
        });
        isConnected = true;
        console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.warn('[MongoDB] MongoDB connection not established. Utilizing in-memory active data store.');
        isConnected = false;
        return false;
    }
};

export const getDBStatus = () => ({
    connected: isConnected,
    provider: isConnected ? 'MongoDB Server' : 'In-Memory Cache & Seed Store',
});

// Alias for backward compatibility
export const connectDB = connectDb;

export default connectDb;
