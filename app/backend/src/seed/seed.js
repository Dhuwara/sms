import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Models ─────────────────────────────────────────────────────────────────────
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
import FeeStructure from '../models/FeeStructure.js';
import StudentFeePayment from '../models/StudentFeePayment.js';
import Book from '../models/Book.js';
import BookIssue from '../models/BookIssue.js';
import TransportRoute from '../models/TransportRoute.js';
import TransportAssignment from '../models/TransportAssignment.js';
import HostelRoom from '../models/HostelRoom.js';
import HostelAllocation from '../models/HostelAllocation.js';
import Announcement from '../models/Announcement.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Substitution from '../models/Substitution.js';
import Timetable from '../models/Timetable.js';
import PeriodConfig from '../models/PeriodConfig.js';
import Homework from '../models/Homework.js';
import HomeworkSubmission from '../models/HomeworkSubmission.js';
import OnlineClass from '../models/OnlineClass.js';
import StudyMaterial from '../models/StudyMaterial.js';
import LessonPlan from '../models/LessonPlan.js';
import Payroll from '../models/Payroll.js';
import Leave from '../models/Leave.js';
import StaffAttendance from '../models/StaffAttendance.js';
import StudentLeave from '../models/StudentLeave.js';
import SchoolEvent from '../models/SchoolEvent.js';
import Scholarship from '../models/Scholarship.js';
import Reimbursement from '../models/Reimbursement.js';
import PTM from '../models/PTM.js';
import Counter from '../models/Counter.js';
import ClassConfig from '../models/ClassConfig.js';
import ClassMapping from '../models/ClassMapping.js';
import Document from '../models/Document.js';

const hash = (pw) => bcrypt.hash(pw, 12);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // ── Clear ALL collections ──────────────────────────────────────────────────
  console.log('Clearing all collections...');
  await Promise.all([
    User.deleteMany(), Student.deleteMany(), Staff.deleteMany(), Parent.deleteMany(),
    Class.deleteMany(), Subject.deleteMany(), ClassConfig.deleteMany(), ClassMapping.deleteMany(),
    Attendance.deleteMany(), Grade.deleteMany(),
    FeeRecord.deleteMany(), FeeType.deleteMany(), FeeStructure.deleteMany(), StudentFeePayment.deleteMany(),
    Exam.deleteMany(), ExamResult.deleteMany(),
    Book.deleteMany(), BookIssue.deleteMany(),
    TransportRoute.deleteMany(), TransportAssignment.deleteMany(),
    HostelRoom.deleteMany(), HostelAllocation.deleteMany(),
    Announcement.deleteMany(), Message.deleteMany(), Notification.deleteMany(),
    Substitution.deleteMany(), Timetable.deleteMany(), PeriodConfig.deleteMany(),
    Homework.deleteMany(), HomeworkSubmission.deleteMany(),
    OnlineClass.deleteMany(), StudyMaterial.deleteMany(), LessonPlan.deleteMany(),
    Payroll.deleteMany(), Leave.deleteMany(), StaffAttendance.deleteMany(), StudentLeave.deleteMany(),
    SchoolEvent.deleteMany(), Scholarship.deleteMany(), Reimbursement.deleteMany(), PTM.deleteMany(),
    Counter.deleteMany(), Document.deleteMany(),
  ]);
  console.log('All collections cleared');

  // ── Hash passwords ─────────────────────────────────────────────────────────
  const [adminHash, staffHash, studentHash, parentHash] = await Promise.all([
    hash('Admin@123'), hash('Staff@123'), hash('Dhuwa@123'), hash('Parent@123'),
  ]);

  // ── 1. Admin ───────────────────────────────────────────────────────────────
  const adminUser = await User.create({
    name: 'Dhuwa Dhuruvan',
    email: 'dhuwadhuruvan@gmail.com',
    passwordHash: adminHash,
    role: 'admin',
  });
  console.log('Admin created');

  // ── 2. Staff ───────────────────────────────────────────────────────────────
  const staffUser = await User.create({
    name: 'John Smith',
    email: 'john.smith@school.com',
    passwordHash: staffHash,
    role: 'staff',
  });

  const staffDoc = await Staff.create({
    userId: staffUser._id,
    subjectsTaught: ['Mathematics', 'Science'],
    contact: '+91 9876543210',
    qualification: 'Post Graduate',
    qualificationDegree: 'M.Sc',
    qualificationSpecialization: 'Mathematics',
    experience: '8 Years',
    employeeId: 'EMP001',
    status: 'active',
  });
  console.log('Staff created');

  // ── 3. Create a Class (so student can be assigned) ─────────────────────────
  const class10A = await Class.create({
    name: 'Grade 10',
    section: 'A',
    gradeLevel: 10,
    staffId: staffDoc._id,
  });

  // Assign class to staff
  await Staff.findByIdAndUpdate(staffDoc._id, { classesAssigned: [class10A._id] });

  // Create subjects for the class
  await Subject.insertMany([
    { name: 'Mathematics', classId: class10A._id, staffId: staffDoc._id },
    { name: 'Science', classId: class10A._id, staffId: staffDoc._id },
    { name: 'English', classId: class10A._id, staffId: staffDoc._id },
  ]);
  console.log('Class & Subjects created');

  // ── 4. Student ─────────────────────────────────────────────────────────────
  const studentUser = await User.create({
    name: 'Dhuwarakesh Student',
    email: 'student@school.com',
    passwordHash: studentHash,
    role: 'student',
  });

  const studentDoc = await Student.create({
    userId: studentUser._id,
    classId: class10A._id,
    rollNumber: 'STU2026002',
    dateOfBirth: new Date(2010, 5, 15),
    gender: 'male',
    address: '123, Sample Street, Chennai',
    parentContact: '+91 9876543220',
    status: 'active',
  });
  console.log('Student created');

  // ── 5. Parent ──────────────────────────────────────────────────────────────
  const parentUser = await User.create({
    name: 'Dhuwarakesh Murali',
    email: 'dhuwarakesh.murali@gmail.com',
    passwordHash: parentHash,
    role: 'parent',
  });

  const parentDoc = await Parent.create({
    userId: parentUser._id,
    children: [studentDoc._id],
  });

  // Link student to parent
  await Student.findByIdAndUpdate(studentDoc._id, { parentId: parentDoc._id });
  console.log('Parent created & linked to student');

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────────────');
  console.log('Login Credentials:');
  console.log('  Admin:   dhuwadhuruvan@gmail.com          / Admin@123');
  console.log('  Staff:   john.smith@school.com             / Staff@123');
  console.log('  Student: STU2026002                        / Dhuwa@123');
  console.log('  Parent:  dhuwarakesh.murali@gmail.com      / Parent@123');
  console.log('─────────────────────────────────────────────────');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
