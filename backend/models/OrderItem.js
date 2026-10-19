import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export default sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false, references: { model: 'orders', key: 'id' } },
  productRef: { type: DataTypes.UUID, field: 'productId', allowNull: false, references: { model: 'products', key: 'id' } },
  quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
  _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id'); } }
}, { tableName: 'order_items', timestamps: false });
