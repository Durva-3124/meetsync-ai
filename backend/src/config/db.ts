import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

export const formatMongoStartupError = (
  uri: string,
  error: unknown
): string => {
  const message = error instanceof Error ? error.message : String(error);

  return [
    '❌ MongoDB startup failed.',
    `Checked connection URI: ${uri}`,
    'Make sure MongoDB is running and reachable before starting the backend.',
    `Details: ${message}`,
  ].join('\n');
};

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const startupMessage = formatMongoStartupError(env.MONGO_URI, error);
    console.error(startupMessage);
    process.exit(1);
  }
};
