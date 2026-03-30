import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, schoolId }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};

// Middleware to inject schoolId into query/body for tenant isolation
export const tenantScope = (req, res, next) => {
  if (req.user?.schoolId) {
    // For GET requests, add schoolId to query filters
    req.schoolId = req.user.schoolId;
    // For POST/PUT requests, inject schoolId into body
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      req.body.schoolId = req.user.schoolId;
    }
  }
  next();
};
