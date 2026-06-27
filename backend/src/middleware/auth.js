import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from '../errors.js';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: '8h' }
  );
}

export function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new AppError(401, 'Authentication required.'));
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token.'));
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return next(new AppError(403, 'You do not have permission for this action.'));
    }
    next();
  };
}
