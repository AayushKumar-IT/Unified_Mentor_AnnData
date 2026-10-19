import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';
import { Farmer, Order, OrderItem, Product, User } from '../models/index.js';

const publicUser = { model: User, as: 'userId', attributes: ['id', 'name', 'avatar'] };

export const createProfile = asyncHandler(async (req, res) => {
  if (await Farmer.findOne({ where: { userRef: req.user.id } })) {
    res.status(409);
    throw new Error('Farmer profile already exists');
  }
  const profile = await Farmer.create({ ...req.body, userRef: req.user.id });
  res.status(201).json({ success: true, data: profile });
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Farmer.findOne({ where: { userRef: req.user.id }, include: [{ ...publicUser, attributes: ['id', 'name', 'email', 'avatar'] }] });
  if (!profile) {
    res.status(404);
    throw new Error('Create your farmer profile to continue');
  }
  res.json({ success: true, data: profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await Farmer.findOne({ where: { userRef: req.user.id } });
  if (!profile) {
    res.status(404);
    throw new Error('Farmer profile not found');
  }
  const allowed = ['farmName', 'farmLocation', 'cropTypes', 'farmingMethod', 'bio', 'verificationDocs'];
  for (const key of allowed) if (req.body[key] !== undefined) profile[key] = req.body[key];
  await profile.save();
  res.json({ success: true, data: profile });
});

export const listFarmers = asyncHandler(async (_req, res) => {
  const farmers = await Farmer.findAll({
    where: { isVerified: true },
    attributes: { exclude: ['verificationDocs'] },
    include: [publicUser],
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: farmers });
});

export const getFarmer = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({
    where: { id: req.params.id, isVerified: true },
    attributes: { exclude: ['verificationDocs'] },
    include: [publicUser]
  });
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer not found');
  }
  res.json({ success: true, data: farmer });
});

export const salesSummary = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ where: { userRef: req.user.id } });
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer profile not found');
  }
  const [orders, totalProducts, totalOrders, revenue, pendingOrders] = await Promise.all([
    Order.findAll({
      where: { farmerRef: farmer.id },
      include: [
        { model: User, as: 'consumerId', attributes: ['id', 'name'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'productId', attributes: ['id', 'name'] }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 8
    }),
    Product.count({ where: { farmerRef: farmer.id } }),
    Order.count({ where: { farmerRef: farmer.id } }),
    Order.sum('totalAmount', { where: { farmerRef: farmer.id, status: { [Op.ne]: 'cancelled' } } }),
    Order.count({ where: { farmerRef: farmer.id, status: 'pending' } })
  ]);
  res.json({ success: true, data: { orders, totalProducts, totalOrders, revenue: Number(revenue || 0), pendingOrders } });
});
