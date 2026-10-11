import mongoose from 'mongoose';
import { memoryStore } from './store.js';

let isMongoConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // Always initialize store with accounts from env
  await memoryStore.init(
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_PASSWORD,
    process.env.CUSTOMER_EMAIL,
    process.env.CUSTOMER_PASSWORD
  );

  if (!uri) {
    console.log('[Database] MONGODB_URI not provided. Running in high-performance memory store mode.');
    return { isMongoConnected: false };
  }

  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    return { isMongoConnected: true };
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed (${err.message}). Seamlessly running in memory store mode.`);
    isMongoConnected = false;
    return { isMongoConnected: false };
  }
}

export function getIsMongoConnected() {
  return isMongoConnected;
}

export default connectDB;
