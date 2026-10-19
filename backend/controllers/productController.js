import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';
import { Category, Farmer, Product, User } from '../models/index.js';

const publicFarmer = {
  model: Farmer,
  as: 'farmerId',
  attributes: ['id', 'farmName', 'farmLocation', 'cropTypes', 'farmingMethod', 'bio', 'isVerified'],
  where: { isVerified: true },
  include: [{ model: User, as: 'userId', attributes: ['id', 'name'] }]
};
const productData = (body, files = []) => {
  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.category !== undefined) data.categoryId = body.category;
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.unit !== undefined) data.unit = body.unit;
  if (body.quantityAvailable !== undefined) data.quantityAvailable = Number(body.quantityAvailable);
  if (body.harvestDate !== undefined) data.harvestDate = body.harvestDate;
  if (body.isOrganic !== undefined) data.isOrganic = body.isOrganic === true || body.isOrganic === 'true';
  if (body.isAvailable !== undefined) data.isAvailable = body.isAvailable === true || body.isAvailable === 'true';
  if (files.length) data.images = files.map((file) => `/uploads/${file.filename}`);
  if (data.quantityAvailable === 0 && data.isAvailable === undefined) data.isAvailable = false;
  return data;
};

export const listProducts = asyncHandler(async (req, res) => {
  const { category, farmerId, isOrganic, location, search } = req.query;
  const where = { isAvailable: true, quantityAvailable: { [Op.gt]: 0 } };
  const farmerWhere = { isVerified: true };
  if (category) where.categoryId = category;
  if (isOrganic === 'true') where.isOrganic = true;
  if (isOrganic === 'false') where.isOrganic = false;
  if (search) where.name = { [Op.iLike]: `%${String(search).slice(0, 100)}%` };
  if (farmerId) farmerWhere.id = farmerId;
  if (location) farmerWhere.farmLocation = { [Op.iLike]: `%${String(location).slice(0, 100)}%` };
  const products = await Product.findAll({
    where,
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] }, { ...publicFarmer, where: farmerWhere }],
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: products });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    where: { id: req.params.id, isAvailable: true },
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] }, publicFarmer]
  });
  if (!product || !product.farmerId) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, data: product });
});

export const getMyProduct = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ where: { userRef: req.user.id } });
  const product = farmer ? await Product.findOne({
    where: { id: req.params.id, farmerRef: farmer.id },
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] }]
  }) : null;
  if (!product) {
    res.status(404);
    throw new Error('Product not found or you do not own it');
  }
  res.json({ success: true, data: product });
});

export const addProduct = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ where: { userRef: req.user.id } });
  if (!farmer) {
    res.status(400);
    throw new Error('Create your farmer profile before adding products');
  }
  const fields = productData(req.body, req.files || []);
  if (fields.isAvailable && fields.quantityAvailable <= 0) {
    res.status(400);
    throw new Error('Add stock before publishing this product');
  }
  if (fields.quantityAvailable <= 0) fields.isAvailable = false;
  const product = await Product.create({ ...fields, farmerRef: farmer.id });
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ where: { userRef: req.user.id } });
  const product = await Product.findOne({ where: { id: req.params.id, farmerRef: farmer?.id } });
  if (!product) {
    res.status(404);
    throw new Error('Product not found or you do not own it');
  }
  const updates = productData(req.body, req.files || []);
  const availableQuantity = updates.quantityAvailable ?? product.quantityAvailable;
  const isAvailable = updates.isAvailable ?? product.isAvailable;
  if (isAvailable && availableQuantity <= 0) {
    res.status(400);
    throw new Error('Add stock before publishing this product');
  }
  if (availableQuantity <= 0) updates.isAvailable = false;
  await product.update(updates);
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ where: { userRef: req.user.id } });
  const product = await Product.findOne({ where: { id: req.params.id, farmerRef: farmer?.id } });
  if (!product) {
    res.status(404);
    throw new Error('Product not found or you do not own it');
  }
  await product.update({ isAvailable: false });
  res.json({ success: true, data: product });
});

export const farmerProducts = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ where: { id: req.params.farmerId, isVerified: true } });
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer not found');
  }
  const products = await Product.findAll({
    where: { farmerRef: farmer.id, isAvailable: true },
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] }],
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: products });
});

export const myProducts = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ where: { userRef: req.user.id } });
  if (!farmer) {
    res.status(404);
    throw new Error('Create your farmer profile to manage products');
  }
  const products = await Product.findAll({
    where: { farmerRef: farmer.id },
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] }],
    order: [['createdAt', 'DESC']]
  });
  res.json({ success: true, data: products });
});
