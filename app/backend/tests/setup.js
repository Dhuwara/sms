import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';

let mongoServer;

// Set env vars for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:5173';

/**
 * Connect to in-memory MongoDB before all tests
 */
export const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

/**
 * Close DB connection and stop MongoMemoryServer after all tests
 */
export const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
};

/**
 * Clear all collections between tests
 */
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Create a minimal Express app for testing specific routes
 * without starting the full server (no DB connect, no change streams)
 */
export const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  return app;
};
