import asyncHandler from 'express-async-handler';
import { Transaction } from 'sequelize';
import { Farmer, Order, OrderItem, Product, SavedAddress, User, sequelize } from '../models/index.js';

const orderIncludes = [
  { model: Farmer, as: 'farmerId', attributes: ['id', 'farmName', 'farmLocation'] },
  { model: OrderItem, as: 'items', include: [{ model: Product, as: 'productId', attributes: ['id', 'name', 'images', 'unit'] }] }
];

export const placeOrder = asyncHandler(async (req, res) => {
  const { items, deliverySlot, deliveryAddress, savedAddressId } = req.body;
  if (!Array.isArray(items) || !items.length || !deliverySlot || new Date(deliverySlot) <= new Date()) {
    res.status(400);
    throw new Error('Add items, a future delivery slot and a delivery address');
  }
  if (!savedAddressId && (!deliveryAddress?.trim() || deliveryAddress.trim().length > 1000)) {
    res.status(400);
    throw new Error('Provide a delivery address no longer than 1000 characters');
  }
  const normalized = new Map();
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!item.productId || !Number.isInteger(quantity) || quantity < 1) {
      res.status(400);
      throw new Error('Each order item needs a product and a positive whole-number quantity');
    }
    normalized.set(String(item.productId), (normalized.get(String(item.productId)) || 0) + quantity);
  }

  const transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED });
  try {
    let finalDeliveryAddress = deliveryAddress?.trim();
    if (savedAddressId) {
      const savedAddress = await SavedAddress.findOne({
        where: { id: savedAddressId, userRef: req.user.id },
        transaction
      });
      if (!savedAddress) {
        res.status(404);
        throw new Error('Saved delivery address not found');
      }
      finalDeliveryAddress = savedAddress.address;
    } else {
      await SavedAddress.findOrCreate({
        where: { userRef: req.user.id, address: finalDeliveryAddress },
        defaults: { userRef: req.user.id, label: 'Saved address', address: finalDeliveryAddress },
        transaction
      });
    }

    const products = [];
    for (const [productId, quantity] of normalized) {
      const product = await Product.findByPk(productId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!product || !product.isAvailable || product.quantityAvailable < quantity) {
        res.status(409);
        throw new Error('A product is unavailable or has insufficient stock');
      }
      product.quantityAvailable -= quantity;
      await product.save({ transaction });
      products.push({ product, quantity });
    }
    const farmerId = products[0].product.farmerRef;
    if (products.some(({ product }) => product.farmerRef !== farmerId)) {
      res.status(400);
      throw new Error('Place separate orders for products from different farms');
    }
    if (!(await Farmer.findOne({ where: { id: farmerId, isVerified: true }, transaction }))) {
      res.status(400);
      throw new Error('This farm is not currently accepting orders');
    }
    const orderItems = products.map(({ product, quantity }) => ({ productRef: product.id, quantity, price: product.price }));
    const totalAmount = products.reduce((sum, { product, quantity }) => sum + Number(product.price) * quantity, 0);
    const order = await Order.create({
      consumerRef: req.user.id,
      farmerRef: farmerId,
      totalAmount: totalAmount.toFixed(2),
      deliverySlot,
      deliveryAddress: finalDeliveryAddress
    }, { transaction });
    await OrderItem.bulkCreate(orderItems.map((item) => ({ ...item, orderId: order.id })), { transaction });
    const createdOrder = await Order.findByPk(order.id, { include: orderIncludes, transaction });
    await transaction.commit();
    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    throw error;
  }
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { consumerRef: req.user.id },
    include: orderIncludes,
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: orders });
});

export const farmerOrders = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ where: { userRef: req.user.id } });
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer profile not found');
  }
  const orders = await Order.findAll({
    where: { farmerRef: farmer.id },
    include: [
      { model: User, as: 'consumerId', attributes: ['id', 'name', 'email'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'productId', attributes: ['id', 'name', 'unit'] }] }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'dispatched', 'delivered', 'cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }
  const farmer = await Farmer.findOne({ where: { userRef: req.user.id } });
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer profile not found');
  }
  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, farmerRef: farmer.id },
      include: [{ model: OrderItem, as: 'items' }],
      transaction,
      lock: { level: transaction.LOCK.UPDATE, of: Order }
    });
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    const transitions = { pending: ['confirmed', 'cancelled'], confirmed: ['dispatched', 'cancelled'], dispatched: ['delivered'], delivered: [], cancelled: [] };
    if (!transitions[order.status].includes(status)) {
      res.status(400);
      throw new Error(`Cannot change order from ${order.status} to ${status}`);
    }
    if (status === 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findByPk(item.productRef, { transaction, lock: transaction.LOCK.UPDATE });
        if (product) {
          product.quantityAvailable += item.quantity;
          await product.save({ transaction });
        }
      }
    }
    order.status = status;
    await order.save({ transaction });
    const updatedOrder = await Order.findByPk(order.id, { include: orderIncludes, transaction });
    await transaction.commit();
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    throw error;
  }
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, as: 'consumerId', attributes: ['id', 'name'] },
      ...orderIncludes
    ]
  });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const isOwner = order.consumerId.id === req.user.id || (req.user.role === 'farmer' && await Farmer.findOne({ where: { id: order.farmerId.id, userRef: req.user.id } }));
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You cannot view this order');
  }
  res.json({ success: true, data: order });
});
