import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import ClassMapping from '../models/ClassMapping.js';
import { generateNextId } from './counter.controller.js';

const toFlat = (s) => ({
  _id: s._id,
  userId: s.userId?._id,
  name: s.userId?.name || '',
  email: s.userId?.email || '',
  roll_no: s.rollNumber,
  class: s.classId ? `${s.classId.name}-${s.classId.section}` : '',
  classId: s.classId?._id,
  dob: s.dateOfBirth ? s.dateOfBirth.toISOString().split('T')[0] : '',
  gender: s.gender,
  address: s.address,
  status: s.status,
  studentType: s.studentType,
  parent_contact: s.parentContact,
  parent_name: s.parentId?.userId?.name || '',
  parent_email: s.parentId?.userId?.email || '',
  createdAt: s.createdAt,
});

export const getStudents = async (req, res, next) => {
  try {
    const { classId, status, search } = req.query;
    let studentIds = null;

    // If classId is provided, fetch student IDs from ClassMapping
    if (classId) {
      const mapping = await ClassMapping.findOne({ classId }).select('students');
      studentIds = mapping?.students || [];
    }

    const filter = {};
    if (studentIds) filter._id = { $in: studentIds };
    if (status) filter.status = status;

    let students = await Student.find(filter)
      .populate('userId', 'name email')
      .populate('classId', 'name section gradeLevel')
      .populate({ path: 'parentId', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s =>
        s.userId?.name?.toLowerCase().includes(q) ||
        s.rollNumber?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: students.map(toFlat) });
  } catch (err) {
    next(err);
  }
};


export const createStudent = async (req, res, next) => {
  try {
    const { name, dob, gender, parent_contact, address, classId, parent_name, parent_email, password, parent_password, status, studentType } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const rollNumber = await generateNextId('rollNumber');
    const email = `${name.toLowerCase().replaceAll(/\s+/g, '.')}${Date.now()}@student.school.com`;
    const passwordHash = await bcrypt.hash(password || 'Student@123', 12);
    const user = await User.create({ name, email, passwordHash, role: 'student' });

    const student = await Student.create({
      userId: user._id,
      classId: classId || undefined,
      rollNumber,
      dateOfBirth: dob || undefined,
      gender: gender || 'male',
      address,
      parentContact: parent_contact,
      studentType: studentType || 'dayScholar',
      status: status || 'active',
    });

    // Create parent if details provided
    if (parent_name && parent_email) {
      const existingParentUser = await User.findOne({ email: parent_email });
      let parentUser = existingParentUser;
      if (!parentUser) {
        const ph = await bcrypt.hash(parent_password || 'Parent@123', 12);
        parentUser = await User.create({ name: parent_name, email: parent_email, passwordHash: ph, role: 'parent' });
      }
      let parent = await Parent.findOne({ userId: parentUser._id });
      if (!parent) {
        parent = await Parent.create({ userId: parentUser._id, children: [student._id] });
      } else {
        await Parent.findByIdAndUpdate(parent._id, { $addToSet: { children: student._id } });
      }
      await Student.findByIdAndUpdate(student._id, { parentId: parent._id });
    }

    const populated = await Student.findById(student._id)
      .populate('userId', 'name email')
      .populate('classId', 'name section')
      .populate({ path: 'parentId', populate: { path: 'userId', select: 'name email' } });

    res.status(201).json({ success: true, data: toFlat(populated) });
  } catch (err) {
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { name, dob, gender, parent_contact, address, classId, password, status, studentType } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (password) userUpdate.passwordHash = await bcrypt.hash(password, 12);
    if (Object.keys(userUpdate).length > 0) await User.findByIdAndUpdate(student.userId, userUpdate);

    await Student.findByIdAndUpdate(req.params.id, {
      ...(classId && { classId }),
      ...(dob && { dateOfBirth: dob }),
      ...(gender && { gender }),
      ...(address !== undefined && { address }),
      ...(parent_contact !== undefined && { parentContact: parent_contact }),
      ...(status && { status }),
      ...(studentType && { studentType }),
    });

    const updated = await Student.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('classId', 'name section')
      .populate({ path: 'parentId', populate: { path: 'userId', select: 'name email' } });

    res.json({ success: true, data: toFlat(updated) });
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    await User.findByIdAndDelete(student.userId);
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
};
