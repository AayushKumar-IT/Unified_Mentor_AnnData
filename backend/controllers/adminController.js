import asyncHandler from 'express-async-handler';
import { Op, QueryTypes } from 'sequelize';
import { Category, Farmer, Order, OrderItem, Product, User, sequelize } from '../models/index.js';

export const pendingFarmers = asyncHandler(async (_req, res) => {
  const farmers = await Farmer.findAll({
    where: { isVerified: false },
    include: [{ model: User, as: 'userId', attributes: ['id', 'name', 'email', 'createdAt'] }],
    order: [['createdAt', 'ASC']]
  });
  res.json({ success: true, data: farmers });
});

export const listAdminFarmers = asyncHandler(async (_req, res) => {
  const farmers = await Farmer.findAll({
    include: [{ model: User, as: 'userId', attributes: ['id', 'name', 'email', 'createdAt'] }],
    order: [['isVerified', 'DESC'], ['createdAt', 'ASC']]
  });
  res.json({ success: true, data: farmers });
});

export const listAdminConsumers = asyncHandler(async (_req, res) => {
  const consumers = await User.findAll({
    where: { role: 'consumer' },
    attributes: ['id', 'name', 'email', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: consumers });
});

export const listAdminOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.findAll({
    include: [
      { model: User, as: 'consumerId', attributes: ['id', 'name', 'email'] },
      { model: Farmer, as: 'farmerId', attributes: ['id', 'farmName'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'productId', attributes: ['id', 'name', 'unit'] }] }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: orders });
});

export const reviewFarmer = asyncHandler(async (req, res) => {
  const { approved } = req.body;
  if (typeof approved !== 'boolean') {
    res.status(400);
    throw new Error('approved must be true or false');
  }
  const farmer = await Farmer.findByPk(req.params.id);
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer profile not found');
  }
  if (approved) {
    farmer.isVerified = true;
    await farmer.save();
    res.json({ success: true, data: farmer });
  } else {
    await farmer.destroy();
    res.json({ success: true, data: { id: req.params.id, _id: req.params.id, approved: false } });
  }
});

export const categories = asyncHandler(async (_req, res) => {
  const list = await Category.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
  res.json({ success: true, data: list });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, icon = '🌱' } = req.body;
  if (!name?.trim()) {
    res.status(400);
    throw new Error('Category name is required');
  }
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const category = await Category.create({ name: name.trim(), slug, icon });
  res.status(201).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  if (await Product.findOne({ where: { categoryId: category.id }, attributes: ['id'] })) {
    res.status(409);
    throw new Error('Cannot delete a category that is used by products');
  }
  await category.destroy();
  res.json({ success: true, data: { id: req.params.id, _id: req.params.id } });
});

export const analytics = asyncHandler(async (_req, res) => {
  const [farmers, consumers, orders, revenue, pendingFarmersCount, ordersByMonth, topFarmers, topProducts] = await Promise.all([
    Farmer.count({ where: { isVerified: true } }),
    User.count({ where: { role: 'consumer' } }),
    Order.count(),
    Order.sum('totalAmount', { where: { status: { [Op.ne]: 'cancelled' } } }),
    Farmer.count({ where: { isVerified: false } }),
    sequelize.query(
      `SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS "_id",
        COUNT(*)::integer AS "count",
        COALESCE(SUM("totalAmount") FILTER (WHERE status <> 'cancelled'), 0)::float AS "revenue"
       FROM orders WHERE "createdAt" >= NOW() - INTERVAL '12 months'
       GROUP BY date_trunc('month', "createdAt") ORDER BY date_trunc('month', "createdAt")`,
      { type: QueryTypes.SELECT }
    ),
    sequelize.query(
      `SELECT f.id AS "_id", f."farmName" AS "farmName",
        SUM(o."totalAmount")::float AS "revenue", COUNT(o.id)::integer AS "orders"
       FROM orders o JOIN farmers f ON f.id = o."farmerId"
       WHERE o.status <> 'cancelled'
       GROUP BY f.id, f."farmName" ORDER BY "revenue" DESC LIMIT 5`,
      { type: QueryTypes.SELECT }
    ),
    Product.findAll({ attributes: ['id', 'name', 'ratings', 'price'], order: [['ratings', 'DESC']], limit: 5 })
  ]);
  res.json({
    success: true,
    data: {
      farmers,
      consumers,
      orders,
      revenue: Number(revenue || 0),
      pendingFarmers: pendingFarmersCount,
      ordersByMonth,
      topFarmers,
      topProducts
    }
  });
});
