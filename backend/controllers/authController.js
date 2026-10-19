import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const createToken = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
const authResponse = (user) => ({ success: true, data: { token: createToken(user), user } });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'consumer' } = req.body;
  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  if (!/^(farmer|consumer)$/.test(role)) {
    res.status(400);
    throw new Error('Role must be farmer or consumer');
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.unscoped().findOne({ where: { email: normalizedEmail }, attributes: ['id'] })) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }
  const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role });
  res.status(201).json(authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.scope('withPassword').findOne({ where: { email: email?.trim().toLowerCase() } });
  if (!user || !password || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  user.password = undefined;
  res.json(authResponse(user));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error('Provide your current password and a new password of at least 8 characters');
  }
  const user = await User.scope('withPassword').findByPk(req.user.id);
  if (!(await user.comparePassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  user.password = undefined;
  res.json({ success: true, data: { token: createToken(user), user } });
});
