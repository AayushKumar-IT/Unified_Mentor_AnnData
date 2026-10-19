import User from './User.js';
import Farmer from './Farmer.js';
import Category from './Category.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Review from './Review.js';
import SavedAddress from './SavedAddress.js';
import { sequelize } from '../config/db.js';

User.hasOne(Farmer, { as: 'farmerProfile', foreignKey: 'userRef', onDelete: 'CASCADE' });
Farmer.belongsTo(User, { as: 'userId', foreignKey: 'userRef' });

Farmer.hasMany(Product, { as: 'products', foreignKey: 'farmerRef', onDelete: 'CASCADE' });
Product.belongsTo(Farmer, { as: 'farmerId', foreignKey: 'farmerRef' });
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId', onDelete: 'RESTRICT' });
Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

User.hasMany(Order, { as: 'orders', foreignKey: 'consumerRef' });
Order.belongsTo(User, { as: 'consumerId', foreignKey: 'consumerRef' });
Farmer.hasMany(Order, { as: 'orders', foreignKey: 'farmerRef' });
Order.belongsTo(Farmer, { as: 'farmerId', foreignKey: 'farmerRef' });
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { as: 'productId', foreignKey: 'productRef' });
Product.hasMany(OrderItem, { as: 'orderItems', foreignKey: 'productRef' });

User.hasMany(Review, { as: 'reviews', foreignKey: 'consumerRef' });
Review.belongsTo(User, { as: 'consumerId', foreignKey: 'consumerRef' });
User.hasMany(SavedAddress, { as: 'savedAddresses', foreignKey: 'userRef', onDelete: 'CASCADE' });
SavedAddress.belongsTo(User, { as: 'user', foreignKey: 'userRef' });
Product.hasMany(Review, { as: 'reviews', foreignKey: 'productRef' });
Review.belongsTo(Product, { as: 'productId', foreignKey: 'productRef' });
Farmer.hasMany(Review, { as: 'reviews', foreignKey: 'farmerRef' });
Review.belongsTo(Farmer, { as: 'farmerId', foreignKey: 'farmerRef' });
Order.hasMany(Review, { as: 'reviews', foreignKey: 'orderRef' });
Review.belongsTo(Order, { as: 'orderId', foreignKey: 'orderRef' });

export { User, Farmer, Category, Product, Order, OrderItem, Review, SavedAddress, sequelize };
