import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const connectDB = async () => {
  try {
    let mongoUri; // Ignore process.env.MONGODB_URI because local Mongo isn't running

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('[DB] No MONGODB_URI found. Starting in-memory MongoDB...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log(`[DB] Connected to MongoDB at ${mongoUri}`);
  } catch (error) {
    console.error(`[DB ERROR] Failed to connect to MongoDB:`, error);
    process.exit(1);
  }
};
