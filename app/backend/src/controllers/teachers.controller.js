import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import { generateNextId } from './counter.controller.js';

const toFlat = (s) => ({
  _id: s._id,
  userId: s.userId?._id,
  name: s.userId?.name || '',
  email: s.userId?.email || '',
  contact: s.contact,
  subjects: s.subjectsTaught || [],
  subject: s.subjectsTaught?.[0] || '',
  qualificationDegree: s.qualificationDegree || '',
  qualificationSpecialization: s.qualificationSpecialization || '',
  qualification: s.qualificationDegree && s.qualificationSpecialization
    ? `${s.qualificationDegree} - ${s.qualificationSpecialization}`
    : s.qualification || '',
  experience: s.experience,
  assigned_classes: s.classesAssigned || [],
  employee_id: s.employeeId,
  status: s.status,
  createdAt: s.createdAt,
});

export const getTeachers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const staff = await Staff.find(filter)
      .populate('userId', 'name email')
      .populate('classesAssigned', 'name section gradeLevel')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: staff.map(toFlat) });
  } catch (err) {
    next(err);
  }
};

export const createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, contact, subjects, qualificationDegree, qualificationSpecialization, experience, assigned_classes, status } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password || 'Staff@123', 12);
    const user = await User.create({ name, email, passwordHash, role: 'staff' });

    const qualification = qualificationDegree && qualificationSpecialization
      ? `${qualificationDegree} - ${qualificationSpecialization}`
      : '';

    const employeeId = await generateNextId('employeeId');

    const staff = await Staff.create({
      userId: user._id,
      contact,
      subjectsTaught: Array.isArray(subjects) ? subjects : (subjects ? [subjects] : []),
      qualification,
      qualificationDegree: qualificationDegree || '',
      qualificationSpecialization: qualificationSpecialization || '',
      experience,
      employeeId: employeeId || '',
      classesAssigned: assigned_classes || [],
      status: status || 'active',
    });

    const populated = await Staff.findById(staff._id)
      .populate('userId', 'name email')
      .populate('classesAssigned', 'name section');

    res.status(201).json({ success: true, data: toFlat(populated) });
  } catch (err) {
    next(err);
  }
};

const buildStaffUpdate = ({ contact, subjects, qualificationDegree, qualificationSpecialization, experience, assigned_classes, status }) => {
  const update = {};
  if (contact !== undefined) update.contact = contact;
  if (subjects !== undefined) update.subjectsTaught = Array.isArray(subjects) ? subjects : [subjects];
  if (qualificationDegree !== undefined) update.qualificationDegree = qualificationDegree;
  if (qualificationSpecialization !== undefined) update.qualificationSpecialization = qualificationSpecialization;
  if (qualificationDegree && qualificationSpecialization) update.qualification = `${qualificationDegree} - ${qualificationSpecialization}`;
  if (experience !== undefined) update.experience = experience;
  if (assigned_classes) update.classesAssigned = assigned_classes;
  if (status) update.status = status;
  return update;
};

export const updateTeacher = async (req, res, next) => {
  try {
    const { name, email, password, contact, subjects, qualificationDegree, qualificationSpecialization, experience, assigned_classes, status } = req.body;
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    if (password) userUpdate.passwordHash = await bcrypt.hash(password, 12);
    if (Object.keys(userUpdate).length > 0) await User.findByIdAndUpdate(staff.userId, userUpdate);

    await Staff.findByIdAndUpdate(req.params.id, buildStaffUpdate({ contact, subjects, qualificationDegree, qualificationSpecialization, experience, assigned_classes, status }));

    const updated = await Staff.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('classesAssigned', 'name section');

    res.json({ success: true, data: toFlat(updated) });
  } catch (err) {
    next(err);
  }
};

export const deleteTeacher = async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Teacher not found' });
    await User.findByIdAndDelete(staff.userId);
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (err) {
    next(err);
  }
};
