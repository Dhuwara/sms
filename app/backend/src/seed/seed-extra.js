import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Parent from '../models/Parent.js';
import Subject from '../models/Subject.js';

const SCHOOL_ID = new mongoose.Types.ObjectId('69c23363cff0fd5ec7b49913');
const hash = (pw) => bcrypt.hash(pw, 12);

const SUBJECTS = [
  ['Mathematics', 'Physics'],
  ['Chemistry', 'Biology'],
  ['English', 'History'],
  ['Computer Science', 'Mathematics'],
  ['Tamil', 'Social Science'],
];

const QUALIFICATIONS = ['Post Graduate', 'Graduate', 'Post Graduate', 'Graduate', 'Post Graduate'];
const DEGREES = ['M.Sc', 'B.Ed', 'M.A', 'B.Tech', 'M.Ed'];
const SPECIALIZATIONS = ['Mathematics', 'Science', 'English', 'Computer Science', 'Tamil'];

async function seedExtra() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const studentPw = await hash('Student@123');
  const staffPw = await hash('Staff@123');

  // ── 5 Teachers ──────────────────────────────────────────────────────────────
  console.log('Creating 5 teachers...');
  for (let i = 1; i <= 5; i++) {
    const email = `teacher${String(i).padStart(2, '0')}@school.com`;
    const existing = await User.findOne({ email });
    if (existing) { console.log(`  skip teacher ${i} (email exists)`); continue; }

    const userDoc = await User.create({
      name: `Teacher ${i}`,
      email,
      passwordHash: staffPw,
      role: 'staff',
      schoolId: SCHOOL_ID,
    });

    await Staff.create({
      userId: userDoc._id,
      schoolId: SCHOOL_ID,
      subjectsTaught: SUBJECTS[i - 1],
      contact: `+91 98000000${String(i).padStart(2, '0')}`,
      qualification: QUALIFICATIONS[i - 1],
      qualificationDegree: DEGREES[i - 1],
      qualificationSpecialization: SPECIALIZATIONS[i - 1],
      experience: `${i + 2} Years`,
      employeeId: `EMP${String(100 + i).padStart(3, '0')}`,
      status: 'active',
    });
    console.log(`  Created teacher ${i}: ${email}`);
  }

  // ── 30 Students — Standard 10 ────────────────────────────────────────────────
  console.log('Creating 30 students for Standard 10...');
  const firstNames = [
    'Aarav','Vivaan','Aditya','Vihaan','Arjun',
    'Sai','Reyansh','Ayaan','Dhruv','Aryan',
    'Ananya','Diya','Priya','Shruti','Kavya',
    'Meera','Pooja','Sneha','Nisha','Riya',
    'Karthik','Suresh','Ramesh','Vijay','Ganesh',
    'Murugan','Senthil','Praveen','Balaji','Dinesh',
  ];

  for (let i = 1; i <= 30; i++) {
    const email = `std10student${String(i).padStart(2, '0')}@school.com`;
    const existing = await User.findOne({ email });
    if (existing) { console.log(`  skip std10 student ${i}`); continue; }

    const name = `${firstNames[i - 1]} Kumar`;
    const userDoc = await User.create({
      name,
      email,
      passwordHash: studentPw,
      role: 'student',
      schoolId: SCHOOL_ID,
    });

    await Student.create({
      userId: userDoc._id,
      schoolId: SCHOOL_ID,
      standard: '10',
      rollNumber: `STD10-${String(i).padStart(3, '0')}`,
      dateOfBirth: new Date(2009, (i % 12), (i % 28) + 1),
      gender: i % 3 === 0 ? 'female' : 'male',
      address: `${i}, School Street, Chennai`,
      parentContact: `+91 9${String(800000000 + i)}`,
      studentType: i % 4 === 0 ? 'hosteller' : 'dayScholar',
      bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'Unknown'][i % 8],
      status: 'active',
    });
    console.log(`  Created std10 student ${i}: ${email}`);
  }

  // ── 10 Students — Standard 11 ────────────────────────────────────────────────
  console.log('Creating 10 students for Standard 11...');
  const std11Names = [
    'Rohit','Amit','Rahul','Sunil','Manoj',
    'Lakshmi','Parvathi','Bhavani','Saranya','Deepa',
  ];

  for (let i = 1; i <= 10; i++) {
    const email = `std11student${String(i).padStart(2, '0')}@school.com`;
    const existing = await User.findOne({ email });
    if (existing) { console.log(`  skip std11 student ${i}`); continue; }

    const name = `${std11Names[i - 1]} Raj`;
    const userDoc = await User.create({
      name,
      email,
      passwordHash: studentPw,
      role: 'student',
      schoolId: SCHOOL_ID,
    });

    await Student.create({
      userId: userDoc._id,
      schoolId: SCHOOL_ID,
      standard: '11',
      rollNumber: `STD11-${String(i).padStart(3, '0')}`,
      dateOfBirth: new Date(2008, (i % 12), (i % 28) + 1),
      gender: i > 5 ? 'female' : 'male',
      address: `${i}, Main Road, Chennai`,
      parentContact: `+91 9${String(700000000 + i)}`,
      studentType: 'dayScholar',
      bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'Unknown'][i % 8],
      status: 'active',
    });
    console.log(`  Created std11 student ${i}: ${email}`);
  }

  // ── 20 Students — Standard 12 ────────────────────────────────────────────────
  console.log('Creating 20 students for Standard 12...');
  const std12Names = [
    'Arun','Naveen','Vinoth','Sathish','Karthi',
    'Bala','Harish','Prasad','Surya','Mani',
    'Kavitha','Revathi','Sumitha','Preethi','Anitha',
    'Nithya','Divya','Sangeetha','Usha','Radha',
  ];

  for (let i = 1; i <= 20; i++) {
    const email = `std12student${String(i).padStart(2, '0')}@school.com`;
    const existing = await User.findOne({ email });
    if (existing) { console.log(`  skip std12 student ${i}`); continue; }

    const name = `${std12Names[i - 1]} Selvam`;
    const userDoc = await User.create({
      name,
      email,
      passwordHash: studentPw,
      role: 'student',
      schoolId: SCHOOL_ID,
    });

    await Student.create({
      userId: userDoc._id,
      schoolId: SCHOOL_ID,
      standard: '12',
      rollNumber: `STD12-${String(i).padStart(3, '0')}`,
      dateOfBirth: new Date(2007, (i % 12), (i % 28) + 1),
      gender: i > 10 ? 'female' : 'male',
      address: `${i}, Cross Street, Chennai`,
      parentContact: `+91 9${String(600000000 + i)}`,
      studentType: i % 5 === 0 ? 'hosteller' : 'dayScholar',
      bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'Unknown'][i % 8],
      status: 'active',
    });
    console.log(`  Created std12 student ${i}: ${email}`);
  }

  // ── Parents for first 3 Standard 12 students ───────────────────────────────
  console.log('Creating parents for first 3 Std 12 students...');
  const parentPw = await hash('Parent@123');
  const parentNames = ['Selvam A', 'Selvam B', 'Selvam C'];

  for (let i = 1; i <= 3; i++) {
    const parentEmail = `std12parent${String(i).padStart(2, '0')}@school.com`;
    const existingParent = await User.findOne({ email: parentEmail });
    if (existingParent) { console.log(`  skip parent ${i} (email exists)`); continue; }

    // Find the matching student
    const studentEmail = `std12student${String(i).padStart(2, '0')}@school.com`;
    const studentUser = await User.findOne({ email: studentEmail });
    if (!studentUser) { console.log(`  skip parent ${i} (student not found)`); continue; }
    const studentDoc = await Student.findOne({ userId: studentUser._id });
    if (!studentDoc) { console.log(`  skip parent ${i} (student doc not found)`); continue; }

    const parentUser = await User.create({
      name: parentNames[i - 1],
      email: parentEmail,
      passwordHash: parentPw,
      role: 'parent',
      schoolId: SCHOOL_ID,
    });

    const parentDoc = await Parent.create({
      userId: parentUser._id,
      schoolId: SCHOOL_ID,
      children: [studentDoc._id],
    });

    // Link parent to student
    studentDoc.parentId = parentDoc._id;
    await studentDoc.save();

    console.log(`  Created parent ${i}: ${parentEmail} → child: ${studentEmail}`);
  }

  // ── Subjects ─────────────────────────────────────────────────────────────────
  console.log('Creating subjects...');
  const subjectsToSeed = [
    // Standard 10
    { name: 'Tamil',        code: 'TAM-10',  description: 'Tamil Language',        standard: '10' },
    { name: 'English',      code: 'ENG-10',  description: 'English Language',      standard: '10' },
    { name: 'Mathematics',  code: 'MATH-10', description: 'Mathematics',           standard: '10' },
    { name: 'Science',      code: 'SCI-10',  description: 'General Science',       standard: '10' },
    { name: 'Social Science', code: 'SOC-10', description: 'Social Science',       standard: '10' },
    // Standard 11
    { name: 'Tamil',         code: 'TAM-11',  description: 'Tamil Language',       standard: '11' },
    { name: 'English',       code: 'ENG-11',  description: 'English Language',     standard: '11' },
    { name: 'Mathematics',   code: 'MATH-11', description: 'Mathematics',          standard: '11' },
    { name: 'Physics',       code: 'PHY-11',  description: 'Physics',              standard: '11' },
    { name: 'Chemistry',     code: 'CHEM-11', description: 'Chemistry',            standard: '11' },
    { name: 'Computer Science', code: 'CS-11', description: 'Computer Science',    standard: '11' },
  ];

  for (const subj of subjectsToSeed) {
    const existing = await Subject.findOne({ code: subj.code, schoolId: SCHOOL_ID });
    if (existing) { console.log(`  skip subject ${subj.code} (exists)`); continue; }
    await Subject.create({ ...subj, schoolId: SCHOOL_ID });
    console.log(`  Created subject: ${subj.code} — ${subj.name} (Std ${subj.standard})`);
  }

  console.log('\n✅ Done!');
  console.log('─────────────────────────────────────────────────');
  console.log('  60 students created (30 × Std 10, 10 × Std 11, 20 × Std 12)');
  console.log('  5 teachers created');
  console.log('  3 parents created (for first 3 Std 12 students)');
  console.log('  11 subjects created (5 × Std 10, 6 × Std 11)');
  console.log('  Student password: Student@123');
  console.log('  Teacher password: Staff@123');
  console.log('  Parent password:  Parent@123');
  console.log('─────────────────────────────────────────────────');

  await mongoose.disconnect();
}

seedExtra().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
