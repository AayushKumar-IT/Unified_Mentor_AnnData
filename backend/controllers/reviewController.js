import asyncHandler from 'express-async-handler';
import { Farmer, Order, OrderItem, Product, Review, User } from '../models/index.js';

export const createReview = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, comment = '' } = req.body;
  if (!productId || !orderId || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    res.status(400);
    throw new Error('A product, delivered order and rating from 1 to 5 are required');
  }
  const order = await Order.findOne({
    where: { id: orderId, consumerRef: req.user.id, status: 'delivered' },
    include: [{ model: OrderItem, as: 'items', where: { productRef: productId }, required: true }]
  });
  if (!order) {
    res.status(400);
    throw new Error('Reviews can only be submitted for products in your delivered orders');
  }
  const product = await Product.findByPk(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const review = await Review.create({
    consumerRef: req.user.id,
    productRef: productId,
    farmerRef: product.farmerRef,
    orderRef: orderId,
    rating: Number(rating),
    comment: String(comment).trim()
  });
  const average = await Review.aggregate('rating', 'avg', { where: { productRef: productId } });
  await product.update({ ratings: Number(Number(average).toFixed(2)) });
  res.status(201).json({ success: true, data: review });
});

export const productReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({
    where: { productRef: req.params.productId },
    include: [{ model: User, as: 'consumerId', attributes: ['id', 'name', 'avatar'] }],
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: reviews });
});

export const farmerReviews = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ where: { id: req.params.farmerId, isVerified: true } });
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer not found');
  }
  const reviews = await Review.findAll({
    where: { farmerRef: farmer.id },
    include: [
      { model: User, as: 'consumerId', attributes: ['id', 'name', 'avatar'] },
      { model: Product, as: 'productId', attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: reviews });
});
