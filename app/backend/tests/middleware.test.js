import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestApp } from './setup.js';
import { protect, authorize } from '../src/middleware/auth.js';
import errorHandler from '../src/middleware/errorHandler.js';

let app;

beforeAll(() => {
  app = createTestApp();

  // Test routes using middleware
  app.get('/protected', protect, (req, res) => {
    res.json({ success: true, user: req.user });
  });

  app.get('/admin-only', protect, authorize('admin'), (req, res) => {
    res.json({ success: true, message: 'Admin access granted' });
  });

  app.get('/staff-or-admin', protect, authorize('admin', 'staff'), (req, res) => {
    res.json({ success: true, message: 'Access granted' });
  });

  app.get('/error-test', (req, res, next) => {
    const err = new Error('Test error');
    err.status = 422;
    next(err);
  });

  app.get('/error-500', (req, res, next) => {
    next(new Error('Internal server error'));
  });

  app.use(errorHandler);
});

// ──────────────────────────────────────────────────────────────
// PROTECT MIDDLEWARE
// ──────────────────────────────────────────────────────────────
describe('protect middleware', () => {
  it('should return 401 if no access token cookie', async () => {
    const res = await request(app).get('/protected');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Not authenticated');
  });

  it('should return 401 if token is invalid', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Cookie', ['accessToken=invalid-jwt-token']);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should pass with valid token and attach user to request', async () => {
    const token = jwt.sign(
      { userId: '507f1f77bcf86cd799439011', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const res = await request(app)
      .get('/protected')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.userId).toBe('507f1f77bcf86cd799439011');
    expect(res.body.user.role).toBe('admin');
  });

  it('should return 401 if token is expired', async () => {
    const token = jwt.sign(
      { userId: '507f1f77bcf86cd799439011', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '0s' } // Immediately expires
    );

    // Small delay to ensure expiry
    await new Promise((r) => setTimeout(r, 100));

    const res = await request(app)
      .get('/protected')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired token');
  });
});

// ──────────────────────────────────────────────────────────────
// AUTHORIZE MIDDLEWARE
// ──────────────────────────────────────────────────────────────
describe('authorize middleware', () => {
  it('should allow admin to access admin-only route', async () => {
    const token = jwt.sign(
      { userId: '507f1f77bcf86cd799439011', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const res = await request(app)
      .get('/admin-only')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Admin access granted');
  });

  it('should deny staff from accessing admin-only route', async () => {
    const token = jwt.sign(
      { userId: '507f1f77bcf86cd799439011', role: 'staff' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const res = await request(app)
      .get('/admin-only')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });

  it('should deny student from accessing admin-only route', async () => {
    const token = jwt.sign(
      { userId: '507f1f77bcf86cd799439011', role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const res = await request(app)
      .get('/admin-only')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.status).toBe(403);
  });

  it('should allow multiple roles (admin OR staff)', async () => {
    const staffToken = jwt.sign(
      { userId: '507f1f77bcf86cd799439011', role: 'staff' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const res = await request(app)
      .get('/staff-or-admin')
      .set('Cookie', [`accessToken=${staffToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Access granted');
  });

  it('should deny parent from staff-or-admin route', async () => {
    const parentToken = jwt.sign(
      { userId: '507f1f77bcf86cd799439011', role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const res = await request(app)
      .get('/staff-or-admin')
      .set('Cookie', [`accessToken=${parentToken}`]);

    expect(res.status).toBe(403);
  });
});

// ──────────────────────────────────────────────────────────────
// ERROR HANDLER
// ──────────────────────────────────────────────────────────────
describe('errorHandler middleware', () => {
  it('should return custom error status and message', async () => {
    const res = await request(app).get('/error-test');

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Test error');
  });

  it('should default to 500 if no status set', async () => {
    const res = await request(app).get('/error-500');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('should always return JSON with success: false', async () => {
    const res = await request(app).get('/error-test');

    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.success).toBe(false);
  });
});
