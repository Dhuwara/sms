import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';
import School from '../models/School.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';

const SA_SECRET = () => process.env.SUPERADMIN_JWT_SECRET || process.env.JWT_SECRET + '_sa';
const isProd = process.env.NODE_ENV === 'production';

const setSACookie = (res, token) => {
  res.cookie('saToken', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const saLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const sa = await SuperAdmin.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    if (!sa || !(await sa.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!sa.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    sa.lastLogin = new Date();
    await sa.save();
    const token = jwt.sign({ id: sa._id, email: sa.email, role: 'superadmin' }, SA_SECRET(), { expiresIn: '8h' });
    setSACookie(res, token);
    res.json({ success: true, data: { id: sa._id, name: sa.name, email: sa.email, role: 'superadmin' } });
  } catch (err) {
    next(err);
  }
};

export const saLogout = (req, res) => {
  res.clearCookie('saToken');
  res.json({ success: true, message: 'Logged out' });
};

export const saMe = async (req, res, next) => {
  try {
    const sa = await SuperAdmin.findById(req.superAdmin.id);
    if (!sa) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: { id: sa._id, name: sa.name, email: sa.email, role: 'superadmin' } });
  } catch (err) {
    next(err);
  }
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const saGetStats = async (req, res, next) => {
  try {
    const [totalSchools, activeSchools, pausedSchools, suspendedSchools, totalStudents, totalStaff] = await Promise.all([
      School.countDocuments(),
      School.countDocuments({ 'subscription.status': 'active' }),
      School.countDocuments({ 'subscription.status': 'paused' }),
      School.countDocuments({ 'subscription.status': 'suspended' }),
      Student.countDocuments(),
      Staff.countDocuments(),
    ]);
    const planCounts = await School.aggregate([
      { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
    ]);
    res.json({
      success: true,
      data: { totalSchools, activeSchools, pausedSchools, suspendedSchools, totalStudents, totalStaff, planCounts },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Schools ──────────────────────────────────────────────────────────────────

export const saGetSchools = async (req, res, next) => {
  try {
    const { search, status, plan } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (status) filter['subscription.status'] = status;
    if (plan) filter['subscription.plan'] = plan;

    const schools = await School.find(filter).sort({ createdAt: -1 });

    const schoolIds = schools.map(s => s._id);
    const [studentCounts, staffCounts, adminUsers] = await Promise.all([
      Student.aggregate([
        { $match: { schoolId: { $in: schoolIds } } },
        { $group: { _id: '$schoolId', count: { $sum: 1 } } },
      ]),
      Staff.aggregate([
        { $match: { schoolId: { $in: schoolIds } } },
        { $group: { _id: '$schoolId', count: { $sum: 1 } } },
      ]),
      User.find({ schoolId: { $in: schoolIds }, role: 'admin' }).select('name email schoolId'),
    ]);

    const studentMap = Object.fromEntries(studentCounts.map(s => [String(s._id), s.count]));
    const staffMap = Object.fromEntries(staffCounts.map(s => [String(s._id), s.count]));
    const adminMap = Object.fromEntries(adminUsers.map(u => [String(u.schoolId), { name: u.name, email: u.email }]));

    const data = schools.map(s => ({
      ...s.toObject(),
      studentCount: studentMap[String(s._id)] || 0,
      staffCount: staffMap[String(s._id)] || 0,
      adminUser: adminMap[String(s._id)] || null,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const saGetSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });

    const [studentCount, staffCount, adminUser] = await Promise.all([
      Student.countDocuments({ schoolId: school._id }),
      Staff.countDocuments({ schoolId: school._id }),
      User.findOne({ schoolId: school._id, role: 'admin' }).select('name email phone'),
    ]);

    res.json({ success: true, data: { ...school.toObject(), studentCount, staffCount, adminUser } });
  } catch (err) {
    next(err);
  }
};

export const saUpdateSchool = async (req, res, next) => {
  try {
    const allowed = ['name', 'schoolType', 'address1', 'address2', 'city', 'state', 'phone', 'email', 'notes'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const school = await School.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    res.json({ success: true, data: school });
  } catch (err) {
    next(err);
  }
};

// ─── Subscription Actions ─────────────────────────────────────────────────────

export const saUpdateSubscription = async (req, res, next) => {
  try {
    const { plan, billingCycle, startDate, endDate, maxStudents, maxStaff } = req.body;
    const updates = {};
    if (plan) updates['subscription.plan'] = plan;
    if (billingCycle) updates['subscription.billingCycle'] = billingCycle;
    if (startDate) updates['subscription.startDate'] = new Date(startDate);
    if (endDate) updates['subscription.endDate'] = new Date(endDate);
    if (maxStudents) updates['subscription.maxStudents'] = Number(maxStudents);
    if (maxStaff) updates['subscription.maxStaff'] = Number(maxStaff);

    const school = await School.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    res.json({ success: true, data: school });
  } catch (err) {
    next(err);
  }
};

export const saPauseSchool = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const school = await School.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'inactive',
          'subscription.status': 'paused',
          'subscription.pausedAt': new Date(),
          'subscription.pauseReason': reason || '',
        },
      },
      { new: true }
    );
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    res.json({ success: true, data: school, message: 'School subscription paused' });
  } catch (err) {
    next(err);
  }
};

export const saResumeSchool = async (req, res, next) => {
  try {
    const school = await School.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'active',
          'subscription.status': 'active',
          'subscription.pausedAt': null,
          'subscription.pauseReason': '',
        },
      },
      { new: true }
    );
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    res.json({ success: true, data: school, message: 'School subscription resumed' });
  } catch (err) {
    next(err);
  }
};

export const saSuspendSchool = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const school = await School.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'suspended',
          'subscription.status': 'suspended',
          'subscription.suspendedAt': new Date(),
          'subscription.suspendReason': reason || '',
        },
      },
      { new: true }
    );
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    res.json({ success: true, data: school, message: 'School suspended' });
  } catch (err) {
    next(err);
  }
};

export const saDeleteSchool = async (req, res, next) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    res.json({ success: true, message: 'School deleted permanently' });
  } catch (err) {
    next(err);
  }
};
