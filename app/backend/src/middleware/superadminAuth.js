import jwt from 'jsonwebtoken';

export const protectSuperAdmin = (req, res, next) => {
  const token = req.cookies.saToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const secret = process.env.SUPERADMIN_JWT_SECRET || process.env.JWT_SECRET + '_sa';
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    req.superAdmin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
