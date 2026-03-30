import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectTestDB, disconnectTestDB, clearTestDB, createTestApp } from './setup.js';
import User from '../src/models/User.js';
import Student from '../src/models/Student.js';
import errorHandler from '../src/middleware/errorHandler.js';
import { protect, authorize } from '../src/middleware/auth.js';

import { getStudents, createStudent, updateStudent, deleteStudent } from '../src/controllers/students.controller.js';

let app;
let adminToken;
let staffToken;
let adminUser;

beforeAll(async () => {
  await connectTestDB();

  app = createTestApp();

  const { Router } = await import('express');
  const router = Router();
  router.get('/', protect, getStudents);
  router.post('/', protect, authorize('admin'), createStudent);
  router.put('/:id', protect, authorize('admin'), updateStudent);
  router.delete('/:id', protect, authorize('admin'), deleteStudent);

  app.use('/api/students', router);
  app.use(errorHandler);
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create admin
  const ph = await bcrypt.hash('AdminPass123', 10);
  adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: ph, role: 'admin' });
  adminToken = jwt.sign({ userId: adminUser._id.toString(), role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '15m' });

  // Create staff token
  const staffUser = await User.create({ name: 'Staff', email: 'staff@test.com', passwordHash: ph, role: 'staff' });
  staffToken = jwt.sign({ userId: staffUser._id.toString(), role: 'staff' }, process.env.JWT_SECRET, { expiresIn: '15m' });

  // Create Counter model for auto-ID generation
  const CounterModel = (await import('../src/models/Counter.js')).default;
  await CounterModel.create({ name: 'rollNumber', value: 0 });
});

// ──────────────────────────────────────────────────────────────
// GET STUDENTS
// ──────────────────────────────────────────────────────────────
describe('GET /api/students', () => {
  it('should return empty array when no students', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Cookie', [`accessToken=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return list of students', async () => {
    // Create student manually
    const ph = await bcrypt.hash('Student@123', 10);
    const sUser = await User.create({ name: 'John Doe', email: 'john@test.com', passwordHash: ph, role: 'student' });
    await Student.create({ userId: sUser._id, rollNumber: 'S001', gender: 'male' });

    const res = await request(app)
      .get('/api/students')
      .set('Cookie', [`accessToken=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('John Doe');
    expect(res.body.data[0].roll_no).toBe('S001');
  });

  it('should search students by name', async () => {
    const ph = await bcrypt.hash('Student@123', 10);
    const u1 = await User.create({ name: 'Alice Smith', email: 'alice@test.com', passwordHash: ph, role: 'student' });
    const u2 = await User.create({ name: 'Bob Jones', email: 'bob@test.com', passwordHash: ph, role: 'student' });
    await Student.create({ userId: u1._id, rollNumber: 'S001', gender: 'female' });
    await Student.create({ userId: u2._id, rollNumber: 'S002', gender: 'male' });

    const res = await request(app)
      .get('/api/students?search=alice')
      .set('Cookie', [`accessToken=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Alice Smith');
  });

  it('should require authentication', async () => {
    const res = await request(app).get('/api/students');
    expect(res.status).toBe(401);
  });
});

// ──────────────────────────────────────────────────────────────
// CREATE STUDENT
// ──────────────────────────────────────────────────────────────
describe('POST /api/students', () => {
  it('should create a new student', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({
        name: 'New Student',
        gender: 'male',
        dob: '2015-05-10',
        address: '123 Main St',
        password: 'Student@123',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('New Student');
    expect(res.body.data.roll_no).toBeTruthy(); // Auto-generated
    expect(res.body.data.gender).toBe('male');
  });

  it('should create student with parent details', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({
        name: 'Student With Parent',
        gender: 'female',
        parent_name: 'Parent User',
        parent_email: 'parent@test.com',
        parent_password: 'Parent@123',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.parent_name).toBe('Parent User');
    expect(res.body.data.parent_email).toBe('parent@test.com');

    // Verify parent user was created
    const parentUser = await User.findOne({ email: 'parent@test.com' });
    expect(parentUser).toBeTruthy();
    expect(parentUser.role).toBe('parent');
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({ gender: 'male' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Name is required');
  });

  it('should deny staff from creating students', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Cookie', [`accessToken=${staffToken}`])
      .send({ name: 'New Student', gender: 'male' });

    expect(res.status).toBe(403);
  });
});

// ──────────────────────────────────────────────────────────────
// UPDATE STUDENT
// ──────────────────────────────────────────────────────────────
describe('PUT /api/students/:id', () => {
  let student;

  beforeEach(async () => {
    const ph = await bcrypt.hash('Student@123', 10);
    const sUser = await User.create({ name: 'Original Name', email: 'student@test.com', passwordHash: ph, role: 'student' });
    student = await Student.create({ userId: sUser._id, rollNumber: 'S001', gender: 'male', address: 'Old Address' });
  });

  it('should update student name', async () => {
    const res = await request(app)
      .put(`/api/students/${student._id}`)
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Name');
  });

  it('should update student address', async () => {
    const res = await request(app)
      .put(`/api/students/${student._id}`)
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({ address: 'New Address 456' });

    expect(res.status).toBe(200);
    expect(res.body.data.address).toBe('New Address 456');
  });

  it('should return 404 for non-existent student', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/students/${fakeId}`)
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({ name: 'Test' });

    expect(res.status).toBe(404);
  });
});

// ──────────────────────────────────────────────────────────────
// DELETE STUDENT
// ──────────────────────────────────────────────────────────────
describe('DELETE /api/students/:id', () => {
  let student;
  let studentUser;

  beforeEach(async () => {
    const ph = await bcrypt.hash('Student@123', 10);
    studentUser = await User.create({ name: 'To Delete', email: 'delete@test.com', passwordHash: ph, role: 'student' });
    student = await Student.create({ userId: studentUser._id, rollNumber: 'S099', gender: 'male' });
  });

  it('should delete student and associated user', async () => {
    const res = await request(app)
      .delete(`/api/students/${student._id}`)
      .set('Cookie', [`accessToken=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Student deleted');

    // Verify deleted from DB
    const s = await Student.findById(student._id);
    expect(s).toBeNull();

    const u = await User.findById(studentUser._id);
    expect(u).toBeNull();
  });

  it('should return 404 for non-existent student', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/students/${fakeId}`)
      .set('Cookie', [`accessToken=${adminToken}`]);

    expect(res.status).toBe(404);
  });

  it('should deny staff from deleting students', async () => {
    const res = await request(app)
      .delete(`/api/students/${student._id}`)
      .set('Cookie', [`accessToken=${staffToken}`]);

    expect(res.status).toBe(403);
  });
});
