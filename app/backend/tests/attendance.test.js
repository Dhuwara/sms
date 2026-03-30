import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectTestDB, disconnectTestDB, clearTestDB, createTestApp } from './setup.js';
import User from '../src/models/User.js';
import Student from '../src/models/Student.js';
import Attendance from '../src/models/Attendance.js';
import Class from '../src/models/Class.js';
import ClassMapping from '../src/models/ClassMapping.js';
import errorHandler from '../src/middleware/errorHandler.js';
import { protect } from '../src/middleware/auth.js';

// Import controllers directly
import { getAttendance, markAttendance, updateAttendance, getClassStudents } from '../src/controllers/attendance.controller.js';

// Mock WhatsApp utils to avoid external calls
jest.unstable_mockModule('../src/utils/whatsapp.js', () => ({
  sendWhatsAppBulk: jest.fn().mockResolvedValue([]),
  getParentPhones: jest.fn().mockResolvedValue([]),
}));

let app;
let adminToken;
let adminUser;
let testClass;
let student1, student2;
let studentUser1, studentUser2;

beforeAll(async () => {
  await connectTestDB();

  app = createTestApp();

  // Build router inline since we can't use top-level await with Router import
  const { Router } = await import('express');
  const router = Router();
  router.get('/', getAttendance);
  router.post('/', protect, markAttendance);
  router.put('/:id', protect, updateAttendance);
  router.get('/class/:classId/students', getClassStudents);

  app.use('/api/attendance', router);
  app.use(errorHandler);
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create admin user
  const passwordHash = await bcrypt.hash('AdminPass123', 10);
  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    passwordHash,
    role: 'admin',
  });

  adminToken = jwt.sign(
    { userId: adminUser._id.toString(), role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Create class
  testClass = await Class.create({ name: 'Grade 5', section: 'A' });

  // Create student users
  const ph = await bcrypt.hash('Student@123', 10);
  studentUser1 = await User.create({ name: 'Student One', email: 's1@test.com', passwordHash: ph, role: 'student' });
  studentUser2 = await User.create({ name: 'Student Two', email: 's2@test.com', passwordHash: ph, role: 'student' });

  // Create students
  student1 = await Student.create({ userId: studentUser1._id, classId: testClass._id, rollNumber: 'S001', gender: 'male' });
  student2 = await Student.create({ userId: studentUser2._id, classId: testClass._id, rollNumber: 'S002', gender: 'female' });

  // Create class mapping
  await ClassMapping.create({ classId: testClass._id, academicYear: '2025-2026', students: [student1._id, student2._id] });
});

// ──────────────────────────────────────────────────────────────
// GET ATTENDANCE
// ──────────────────────────────────────────────────────────────
describe('GET /api/attendance', () => {
  it('should return empty array when no attendance records', async () => {
    const res = await request(app).get('/api/attendance');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return attendance records filtered by date', async () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    await Attendance.create({
      studentId: student1._id,
      classId: testClass._id,
      date: today,
      status: 'present',
      markedBy: adminUser._id,
    });

    // Create a record for yesterday (should not appear)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    await Attendance.create({
      studentId: student2._id,
      classId: testClass._id,
      date: yesterday,
      status: 'absent',
      markedBy: adminUser._id,
    });

    const dateStr = today.toISOString().split('T')[0];
    const res = await request(app).get(`/api/attendance?date=${dateStr}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('present');
  });

  it('should filter by classId', async () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    await Attendance.create({
      studentId: student1._id,
      classId: testClass._id,
      date: today,
      status: 'present',
      markedBy: adminUser._id,
    });

    const res = await request(app).get(`/api/attendance?classId=${testClass._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────────────────────
// MARK ATTENDANCE
// ──────────────────────────────────────────────────────────────
describe('POST /api/attendance', () => {
  it('should mark attendance for multiple students', async () => {
    const today = new Date().toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/attendance')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({
        classId: testClass._id.toString(),
        date: today,
        records: [
          { studentId: student1._id.toString(), status: 'present' },
          { studentId: student2._id.toString(), status: 'absent' },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);

    // Verify in DB
    const records = await Attendance.find({ classId: testClass._id });
    expect(records).toHaveLength(2);
  });

  it('should return 400 if data is missing', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid data');
  });

  it('should return 400 if records array is empty', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({
        classId: testClass._id.toString(),
        date: '2026-03-20',
        records: [],
      });

    expect(res.status).toBe(400);
  });

  it('should upsert attendance (update if already marked)', async () => {
    const today = new Date().toISOString().split('T')[0];

    // First mark as present
    await request(app)
      .post('/api/attendance')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({
        classId: testClass._id.toString(),
        date: today,
        records: [{ studentId: student1._id.toString(), status: 'present' }],
      });

    // Update to absent
    const res = await request(app)
      .post('/api/attendance')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({
        classId: testClass._id.toString(),
        date: today,
        records: [{ studentId: student1._id.toString(), status: 'absent' }],
      });

    expect(res.status).toBe(201);

    // Should still have only 1 record (upserted, not duplicated)
    const records = await Attendance.find({ studentId: student1._id });
    expect(records).toHaveLength(1);
    expect(records[0].status).toBe('absent');
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .send({
        classId: testClass._id.toString(),
        date: '2026-03-20',
        records: [{ studentId: student1._id.toString(), status: 'present' }],
      });

    expect(res.status).toBe(401);
  });
});

// ──────────────────────────────────────────────────────────────
// UPDATE ATTENDANCE
// ──────────────────────────────────────────────────────────────
describe('PUT /api/attendance/:id', () => {
  it('should update attendance status', async () => {
    const record = await Attendance.create({
      studentId: student1._id,
      classId: testClass._id,
      date: new Date(),
      status: 'present',
      markedBy: adminUser._id,
    });

    const res = await request(app)
      .put(`/api/attendance/${record._id}`)
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({ status: 'absent' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('absent');
  });

  it('should return 404 for non-existent record', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/attendance/${fakeId}`)
      .set('Cookie', [`accessToken=${adminToken}`])
      .send({ status: 'absent' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Attendance record not found');
  });
});

// ──────────────────────────────────────────────────────────────
// GET CLASS STUDENTS (with attendance)
// ──────────────────────────────────────────────────────────────
describe('GET /api/attendance/class/:classId/students', () => {
  it('should return students in a class with their attendance', async () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0);
    const dateStr = today.toISOString().split('T')[0];

    // Mark attendance for student1
    await Attendance.create({
      studentId: student1._id,
      classId: testClass._id,
      date: today,
      status: 'present',
      markedBy: adminUser._id,
    });

    const res = await request(app)
      .get(`/api/attendance/class/${testClass._id}/students?date=${dateStr}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);

    const s1 = res.body.data.find((s) => s.rollNumber === 'S001');
    const s2 = res.body.data.find((s) => s.rollNumber === 'S002');

    expect(s1.status).toBe('present');
    expect(s2.status).toBeNull(); // Not marked yet
  });

  it('should return students without attendance when no date provided', async () => {
    const res = await request(app)
      .get(`/api/attendance/class/${testClass._id}/students`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].status).toBeNull();
  });
});
