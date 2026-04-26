import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import School from '../models/School.js';
import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';

const generateTokens = (userId, role, schoolId) => {
  const accessToken = jwt.sign({ userId, role, schoolId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, role, schoolId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'strict', maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { schoolName, schoolType, address1, address2, city, state, adminName, adminEmail, adminPhone, whatsappNumber, password } = req.body;

    if (!schoolName || !address1 || !city || !state || !adminEmail || !adminPhone || !password) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: adminEmail.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Create school
    const school = await School.create({
      name: schoolName.trim(),
      schoolType: schoolType || 'other',
      address1: address1.trim(),
      address2: (address2 || '').trim(),
      city: city.trim(),
      state: state.trim(),
      phone: (adminPhone || '').trim(),
      email: adminEmail.trim(),
      whatsappNumber: (whatsappNumber || '').trim(),
    });

    // Create admin user for this school
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      name: (adminName || schoolName).trim(),
      email: adminEmail.trim(),
      phone: (adminPhone || '').trim(),
      passwordHash,
      role: 'admin',
      schoolId: school._id,
    });

    res.status(201).json({
      success: true,
      message: 'School registered successfully. Please login to continue.',
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    next(err);
  }
};

export const getSchools = async (req, res, next) => {
  try {
    const schools = await School.find({ status: 'active' }).select('name address').sort({ name: 1 });
    res.json({ success: true, data: schools });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const school = await School.findById(user.schoolId).select('name status subscription');
    if (school) {
      const subStatus = school.subscription?.status || school.status;
      if (subStatus === 'paused') {
        return res.status(403).json({ success: false, message: 'Your school subscription is currently paused. Please contact support.' });
      }
      if (subStatus === 'suspended' || school.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Your school account has been suspended. Please contact support.' });
      }
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.schoolId);
    setCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: school?.name || '',
      },
    });

  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.schoolId);
    setCookies(res, accessToken, refreshToken);
    res.json({ success: true });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const school = await School.findById(user.schoolId).select('name');

    let phone = user.phone || '';
    if (!phone && user.role === 'parent') {
      const parent = await Parent.findOne({ userId: user._id });
      if (parent) {
        const child = await Student.findOne({ parentId: parent._id }).select('parentContact');
        phone = child?.parentContact || '';
        if (phone) await User.findByIdAndUpdate(user._id, { phone });
      }
    }
    if (!phone && user.role === 'staff') {
      const staff = await Staff.findOne({ userId: user._id }).select('contact');
      phone = staff?.contact || '';
      if (phone) await User.findByIdAndUpdate(user._id, { phone });
    }

    res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, phone, role: user.role, schoolId: user.schoolId, schoolName: school?.name || '' } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email });
    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been generated.' });
    }

    // Generate token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    // Send reset link via email
    const { sendMail } = await import('../utils/mailer.js');
    await sendMail({
      fromEmail: process.env.SMTP_USER,
      fromName: process.env.SMTP_FROM_NAME || 'School Management System',
      to: [email],
      subject: 'Password Reset Request',
      text: `You requested a password reset.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you did not request this, please ignore this email.`,
    });

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email.',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    }).select('+passwordHash +resetToken +resetTokenExpiry');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/update-profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const update = {};
    if (name?.trim()) update.name = name.trim();
    if (email?.trim()) update.email = email.trim().toLowerCase();
    if (phone !== undefined) update.phone = phone.trim();

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true }).select('-passwordHash');

    // Sync phone to Student.parentContact for all children of this parent
    if (req.user.role === 'parent' && phone !== undefined) {
      const parent = await Parent.findOne({ userId: req.user.userId });
      if (parent) {
        await Student.updateMany({ parentId: parent._id }, { parentContact: phone.trim() });
      }
    }

    // Sync phone and name to Staff record so admin sees updated contact
    if (req.user.role === 'staff') {
      const staffUpdate = {};
      if (phone !== undefined) staffUpdate.contact = phone.trim();
      if (name?.trim()) staffUpdate.name = name.trim();
      if (Object.keys(staffUpdate).length > 0) {
        await Staff.findOneAndUpdate({ userId: req.user.userId }, staffUpdate);
      }
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
