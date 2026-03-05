import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Parent from '../models/Parent.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import FeeRecord from '../models/FeeRecord.js';
import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
import FeeType from '../models/FeeType.js';
import Book from '../models/Book.js';
import BookIssue from '../models/BookIssue.js';
import TransportRoute from '../models/TransportRoute.js';
import TransportAssignment from '../models/TransportAssignment.js';
import HostelRoom from '../models/HostelRoom.js';
import HostelAllocation from '../models/HostelAllocation.js';
import Announcement from '../models/Announcement.js';
import Message from '../models/Message.js';

const hash = (pw) => bcrypt.hash(pw, 12);
const randomDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d;
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany(), Student.deleteMany(), Staff.deleteMany(),
    Parent.deleteMany(), Class.deleteMany(), Subject.deleteMany(),
    Attendance.deleteMany(), Grade.deleteMany(), FeeRecord.deleteMany(),
    Exam.deleteMany(), ExamResult.deleteMany(), FeeType.deleteMany(),
    Book.deleteMany(), BookIssue.deleteMany(),
    TransportRoute.deleteMany(), TransportAssignment.deleteMany(),
    HostelRoom.deleteMany(), HostelAllocation.deleteMany(),
    Announcement.deleteMany(), Message.deleteMany(),
  ]);
  console.log('Cleared existing data');

  const [adminHash, staffHash, studentHash, parentHash] = await Promise.all([
    hash('Admin@123'), hash('Staff@123'), hash('Student@123'), hash('Parent@123'),
  ]);

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminUser = await User.create({
    name: 'Admin User', email: 'admin@school.com', passwordHash: adminHash, role: 'admin',
  });

  // ── Staff ──────────────────────────────────────────────────────────────────
  const staffUsers = await User.insertMany([
    { name: 'John Smith', email: 'john.smith@school.com', passwordHash: staffHash, role: 'staff' },
    { name: 'Sarah Jones', email: 'sarah.jones@school.com', passwordHash: staffHash, role: 'staff' },
    { name: 'Mike Wilson', email: 'mike.wilson@school.com', passwordHash: staffHash, role: 'staff' },
  ]);

  const [staff1Doc, staff2Doc, staff3Doc] = await Staff.insertMany([
    { userId: staffUsers[0]._id, subjectsTaught: ['Mathematics'], contact: '+91 9876543210', qualification: 'M.Sc Mathematics', experience: '8 Years', employeeId: 'EMP001' },
    { userId: staffUsers[1]._id, subjectsTaught: ['Science'], contact: '+91 9876543211', qualification: 'M.Sc Physics', experience: '6 Years', employeeId: 'EMP002' },
    { userId: staffUsers[2]._id, subjectsTaught: ['English'], contact: '+91 9876543212', qualification: 'M.A English', experience: '10 Years', employeeId: 'EMP003' },
  ]);

  // ── Classes ────────────────────────────────────────────────────────────────
  const [class10A, class10B] = await Class.insertMany([
    { name: 'Grade 10', section: 'A', gradeLevel: 10, staffId: staff1Doc._id },
    { name: 'Grade 10', section: 'B', gradeLevel: 10, staffId: staff2Doc._id },
  ]);

  await Staff.findByIdAndUpdate(staff1Doc._id, { classesAssigned: [class10A._id, class10B._id] });
  await Staff.findByIdAndUpdate(staff2Doc._id, { classesAssigned: [class10A._id, class10B._id] });
  await Staff.findByIdAndUpdate(staff3Doc._id, { classesAssigned: [class10A._id, class10B._id] });

  // ── Subjects ───────────────────────────────────────────────────────────────
  const subjects = await Subject.insertMany([
    { name: 'Mathematics', classId: class10A._id, staffId: staff1Doc._id },
    { name: 'Science',     classId: class10A._id, staffId: staff2Doc._id },
    { name: 'English',     classId: class10A._id, staffId: staff3Doc._id },
    { name: 'Mathematics', classId: class10B._id, staffId: staff1Doc._id },
    { name: 'Science',     classId: class10B._id, staffId: staff2Doc._id },
    { name: 'English',     classId: class10B._id, staffId: staff3Doc._id },
  ]);

  // ── Students (10) ──────────────────────────────────────────────────────────
  const studentNames = [
    'Rahul Kumar', 'Priya Sharma', 'Arjun Patel', 'Ananya Singh', 'Vikram Mehta',
    'Sneha Reddy', 'Karan Gupta', 'Pooja Nair', 'Rohan Das', 'Divya Iyer',
  ];
  const genders = ['male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female'];

  const studentUsers = await User.insertMany(
    studentNames.map((name, i) => ({ name, email: `student${i + 1}@school.com`, passwordHash: studentHash, role: 'student' }))
  );

  const studentDocs = await Student.insertMany(
    studentUsers.map((u, i) => ({
      userId: u._id,
      classId: i < 5 ? class10A._id : class10B._id,
      rollNumber: `${i + 1}`,
      dateOfBirth: new Date(2010, i % 12, (i % 28) + 1),
      gender: genders[i],
      address: `${i + 1}23, Sample Street, City`,
      status: 'active',
      parentContact: `+91 98765432${10 + i}`,
    }))
  );

  // ── Parents (5) ────────────────────────────────────────────────────────────
  const parentNames = ['Ramesh Kumar', 'Sunita Sharma', 'Mahesh Patel', 'Kavitha Singh', 'Suresh Mehta'];
  const parentUsers = await User.insertMany(
    parentNames.map((name, i) => ({ name, email: `parent${i + 1}@school.com`, passwordHash: parentHash, role: 'parent' }))
  );

  const parentDocs = await Parent.insertMany(
    parentUsers.map((u, i) => ({ userId: u._id, children: [studentDocs[i]._id, studentDocs[i + 5]._id] }))
  );

  await Promise.all(
    studentDocs.map((s, i) =>
      Student.findByIdAndUpdate(s._id, { parentId: parentDocs[i < 5 ? i : i - 5]._id })
    )
  );

  // ── Attendance ─────────────────────────────────────────────────────────────
  const attendanceRecords = [];
  for (let day = 1; day <= 30; day++) {
    const date = randomDate(day);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    for (const student of studentDocs) {
      const rand = Math.random();
      attendanceRecords.push({
        studentId: student._id, date,
        status: rand < 0.85 ? 'present' : rand < 0.95 ? 'absent' : 'late',
        markedBy: staff1Doc._id,
      });
    }
  }
  await Attendance.insertMany(attendanceRecords);

  // ── Grades ─────────────────────────────────────────────────────────────────
  const gradeRecords = [];
  const terms = ['Term 1', 'Term 2'];
  const examTypes = ['Mid-term', 'Final'];
  for (const student of studentDocs) {
    const classSubjects = subjects.filter(s => String(s.classId) === String(student.classId));
    for (const subject of classSubjects) {
      for (let t = 0; t < terms.length; t++) {
        gradeRecords.push({
          studentId: student._id, subjectId: subject._id,
          marks: Math.floor(Math.random() * 40) + 60, maxMarks: 100,
          examType: examTypes[t], term: terms[t],
        });
      }
    }
  }
  await Grade.insertMany(gradeRecords);

  // ── Fee Types ──────────────────────────────────────────────────────────────
  const feeTypes = await FeeType.insertMany([
    { name: 'Tuition Fee', amount: 15000, category: 'tuition', frequency: 'quarterly', description: 'Quarterly tuition fee' },
    { name: 'Transport Fee', amount: 3500, category: 'transport', frequency: 'monthly', description: 'Monthly transport fee' },
    { name: 'Library Fee', amount: 700, category: 'library', frequency: 'annual', description: 'Annual library membership' },
    { name: 'Sports Fee', amount: 2500, category: 'sports', frequency: 'annual', description: 'Annual sports activities' },
    { name: 'Hostel Fee', amount: 8000, category: 'hostel', frequency: 'monthly', description: 'Monthly hostel charges' },
  ]);

  // ── Fee Records ────────────────────────────────────────────────────────────
  const feeStatuses = ['paid', 'pending', 'overdue'];
  const feeRecords = [];
  for (const student of studentDocs) {
    feeRecords.push({ studentId: student._id, amount: 15000, description: 'Q1 Tuition Fee', status: 'paid', paidAt: randomDate(60), dueDate: randomDate(65) });
    feeRecords.push({ studentId: student._id, amount: 15000, description: 'Q2 Tuition Fee', status: feeStatuses[Math.floor(Math.random() * 3)], dueDate: randomDate(10) });
  }
  await FeeRecord.insertMany(feeRecords);

  // ── Exams ──────────────────────────────────────────────────────────────────
  const exams = await Exam.insertMany([
    { name: 'Mid-Term Mathematics', classId: class10A._id, subjectId: subjects[0]._id, date: randomDate(20), maxScore: 100, examType: 'Mid-term', term: 'Term 1', createdBy: adminUser._id },
    { name: 'Mid-Term Science', classId: class10A._id, subjectId: subjects[1]._id, date: randomDate(18), maxScore: 100, examType: 'Mid-term', term: 'Term 1', createdBy: adminUser._id },
    { name: 'Final Mathematics', classId: class10B._id, subjectId: subjects[3]._id, date: randomDate(5), maxScore: 100, examType: 'Final', term: 'Term 1', createdBy: adminUser._id },
  ]);

  const examResults = [];
  const class10AStudents = studentDocs.slice(0, 5);
  for (const student of class10AStudents) {
    examResults.push({ examId: exams[0]._id, studentId: student._id, marks: Math.floor(Math.random() * 40) + 60 });
    examResults.push({ examId: exams[1]._id, studentId: student._id, marks: Math.floor(Math.random() * 40) + 60 });
  }
  for (const student of studentDocs.slice(5)) {
    examResults.push({ examId: exams[2]._id, studentId: student._id, marks: Math.floor(Math.random() * 40) + 60 });
  }
  await ExamResult.insertMany(examResults);

  // ── Books ──────────────────────────────────────────────────────────────────
  const books = await Book.insertMany([
    { title: 'Mathematics for Class 10', author: 'R.D. Sharma', category: 'Textbook', totalCopies: 10, availableCopies: 7 },
    { title: 'Science Experiments', author: 'NCERT', category: 'Textbook', totalCopies: 8, availableCopies: 5 },
    { title: 'English Grammar', author: 'Wren & Martin', category: 'Reference', totalCopies: 15, availableCopies: 12 },
    { title: 'Indian History', author: 'Bipan Chandra', category: 'Reference', totalCopies: 6, availableCopies: 4 },
    { title: 'Computer Basics', author: 'P.K. Sinha', category: 'Technology', totalCopies: 5, availableCopies: 3 },
  ]);

  const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 14);
  await BookIssue.insertMany([
    { bookId: books[0]._id, studentId: studentDocs[0]._id, dueDate, status: 'active' },
    { bookId: books[1]._id, studentId: studentDocs[1]._id, dueDate, status: 'active' },
    { bookId: books[2]._id, studentId: studentDocs[2]._id, dueDate: randomDate(3), status: 'overdue' },
  ]);

  // ── Transport ──────────────────────────────────────────────────────────────
  const routes = await TransportRoute.insertMany([
    { routeNumber: 'R-101', driverName: 'Ramu Kumar', driverContact: '+91 9000000001', vehicleNumber: 'DL-01-AB-1234', capacity: 35, monthlyFee: 3000, stops: [{ name: 'Sector 5', pickupTime: '7:30 AM', dropTime: '3:00 PM' }, { name: 'Park Street', pickupTime: '7:40 AM', dropTime: '3:10 PM' }] },
    { routeNumber: 'R-102', driverName: 'Shyam Lal', driverContact: '+91 9000000002', vehicleNumber: 'DL-01-CD-5678', capacity: 30, monthlyFee: 3500, stops: [{ name: 'Mall Road', pickupTime: '7:45 AM', dropTime: '3:15 PM' }] },
    { routeNumber: 'R-103', driverName: 'Gopal Singh', driverContact: '+91 9000000003', vehicleNumber: 'DL-01-EF-9012', capacity: 28, monthlyFee: 4000, stops: [{ name: 'City Center', pickupTime: '8:00 AM', dropTime: '3:30 PM' }] },
  ]);

  await TransportAssignment.insertMany([
    { studentId: studentDocs[0]._id, routeId: routes[0]._id, stopName: 'Sector 5', pickupTime: '7:30 AM', dropTime: '3:00 PM' },
    { studentId: studentDocs[1]._id, routeId: routes[1]._id, stopName: 'Mall Road', pickupTime: '7:45 AM', dropTime: '3:15 PM' },
    { studentId: studentDocs[2]._id, routeId: routes[2]._id, stopName: 'City Center', pickupTime: '8:00 AM', dropTime: '3:30 PM' },
  ]);

  // ── Hostel ─────────────────────────────────────────────────────────────────
  const rooms = await HostelRoom.insertMany([
    { roomNumber: '101', floor: 'Ground', type: 'double', capacity: 2, occupancy: 2, status: 'full' },
    { roomNumber: '102', floor: 'Ground', type: 'double', capacity: 2, occupancy: 1, status: 'available' },
    { roomNumber: '201', floor: 'First', type: 'single', capacity: 1, occupancy: 0, status: 'available' },
    { roomNumber: '202', floor: 'First', type: 'dormitory', capacity: 6, occupancy: 3, status: 'available' },
  ]);

  await HostelAllocation.insertMany([
    { studentId: studentDocs[3]._id, roomId: rooms[0]._id, status: 'active' },
    { studentId: studentDocs[4]._id, roomId: rooms[0]._id, status: 'active' },
    { studentId: studentDocs[5]._id, roomId: rooms[1]._id, status: 'active' },
  ]);

  // ── Announcements ──────────────────────────────────────────────────────────
  await Announcement.insertMany([
    { title: 'Annual Sports Day', message: 'Annual sports day scheduled on 15th March. All students must participate.', priority: 'high', targetAudience: 'all', createdBy: adminUser._id },
    { title: 'Parent-Teacher Meeting', message: 'PTM scheduled for all classes on 20th March at 10:00 AM.', priority: 'urgent', targetAudience: 'parents', createdBy: adminUser._id },
    { title: 'Holiday Notice', message: 'School will remain closed on 25th December for Christmas.', priority: 'normal', targetAudience: 'all', createdBy: adminUser._id },
    { title: 'Mid-Term Exam Schedule', message: 'Mid-term examinations will begin from 10th February.', priority: 'high', targetAudience: 'students', createdBy: adminUser._id },
    { title: 'New Library Books', message: '50 new reference books have been added to the library.', priority: 'low', targetAudience: 'students', createdBy: staffUsers[0]._id },
  ]);

  // ── Messages ───────────────────────────────────────────────────────────────
  await Message.insertMany([
    { fromUserId: staffUsers[0]._id, toUserId: parentUsers[0]._id, content: 'Great improvement in mathematics this term. Keep it up!' },
    { fromUserId: parentUsers[0]._id, toUserId: staffUsers[0]._id, content: 'Thank you for the update. We will encourage him further.' },
    { fromUserId: staffUsers[1]._id, toUserId: parentUsers[1]._id, content: 'Priya presented an excellent science project today.' },
  ]);

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────────────');
  console.log('Login Credentials:');
  console.log('  Admin:    admin@school.com       / Admin@123');
  console.log('  Staff 1:  john.smith@school.com  / Staff@123');
  console.log('  Staff 2:  sarah.jones@school.com / Staff@123');
  console.log('  Staff 3:  mike.wilson@school.com / Staff@123');
  console.log('  Student:  student1@school.com    / Student@123  (1–10)');
  console.log('  Parent:   parent1@school.com     / Parent@123   (1–5)');
  console.log('─────────────────────────────────────────────────');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
