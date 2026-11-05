import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected) {
    return true;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kashbites';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000, // Quick timeout to failover gracefully if standalone Mongo daemon is not running
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
