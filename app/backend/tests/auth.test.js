import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { connectTestDB, disconnectTestDB, clearTestDB, createTestApp } from './setup.js';
import User from '../src/models/User.js';
import errorHandler from '../src/middleware/errorHandler.js';

// Import routes
import { Router } from 'express';
import { login, logout, refresh, getMe, changePassword } from '../src/controllers/auth.controller.js';
import { protect } from '../src/middleware/auth.js';

let app;
let testUser;
let authCookies;

// Build a minimal auth router without rate limiting (for tests)
const buildAuthRouter = () => {
  const router = Router();
  router.post('/login', login);
  router.post('/logout', logout);
  router.post('/refresh', refresh);
  router.get('/me', protect, getMe);
  router.post('/change-password', protect, changePassword);
  return router;
};

beforeAll(async () => {
  await connectTestDB();
  app = createTestApp();
  app.use('/api/auth', buildAuthRouter());
  app.use(errorHandler);
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  // Create a test user
  const passwordHash = await bcrypt.hash('TestPass123', 10);
  testUser = await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    passwordHash,
    role: 'admin',
  });
});

// ──────────────────────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('should login with valid email and password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'TestPass123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Admin');
    expect(res.body.data.email).toBe('admin@test.com');
    expect(res.body.data.role).toBe('admin');
    // Should set cookies
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'].length).toBeGreaterThanOrEqual(2);
  });

  it('should return 400 if email and password are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Email or Roll Number/i);
  });

  it('should return 400 if password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'WrongPass' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'TestPass123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should trim whitespace from email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '  admin@test.com  ', password: 'TestPass123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should not expose passwordHash in response', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'TestPass123' });

    expect(res.body.data.passwordHash).toBeUndefined();
    expect(res.body.data.password).toBeUndefined();
  });
});

// ──────────────────────────────────────────────────────────────
// LOGOUT
// ──────────────────────────────────────────────────────────────
describe('POST /api/auth/logout', () => {
  it('should clear cookies on logout', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Logged out');
  });
});

// ──────────────────────────────────────────────────────────────
// REFRESH
// ──────────────────────────────────────────────────────────────
describe('POST /api/auth/refresh', () => {
  it('should refresh tokens with valid refresh token', async () => {
    // First login to get cookies
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'TestPass123' });

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 without refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('No refresh token');
  });

  it('should return 401 with invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', ['refreshToken=invalid-token-value']);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// GET ME
// ──────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('should return current user when authenticated', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'TestPass123' });

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Admin');
    expect(res.body.data.email).toBe('admin@test.com');
    expect(res.body.data.role).toBe('admin');
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Not authenticated');
  });

  it('should return 401 with expired/invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', ['accessToken=invalid-token']);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ──────────────────────────────────────────────────────────────
describe('POST /api/auth/change-password', () => {
  let cookies;

  beforeEach(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'TestPass123' });
    cookies = loginRes.headers['set-cookie'];
  });

  it('should change password with correct current password', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', cookies)
      .send({ currentPassword: 'TestPass123', newPassword: 'NewPass456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify new password works
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'NewPass456' });
    expect(loginRes.status).toBe(200);
  });

  it('should return 401 with wrong current password', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', cookies)
      .send({ currentPassword: 'WrongPass', newPassword: 'NewPass456' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Incorrect current password/i);
  });

  it('should return 400 if new password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', cookies)
      .send({ currentPassword: 'TestPass123', newPassword: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 6/i);
  });

  it('should return 400 if passwords are missing', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', cookies)
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .send({ currentPassword: 'TestPass123', newPassword: 'NewPass456' });

    expect(res.status).toBe(401);
  });
});
