import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User } from '../models/index.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Authentication required');
  }
  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Invalid or expired token');
  }
  const user = await User.findByPk(payload.id);
  if (!user) {
    res.status(401);
    throw new Error('User account no longer exists');
  }
  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error('You do not have permission to perform this action'));
  }
  next();
};
