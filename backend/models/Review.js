import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export default sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  consumerRef: { type: DataTypes.UUID, field: 'consumerId', allowNull: false, references: { model: 'users', key: 'id' } },
  productRef: { type: DataTypes.UUID, field: 'productId', allowNull: false, references: { model: 'products', key: 'id' } },
  farmerRef: { type: DataTypes.UUID, field: 'farmerId', allowNull: false, references: { model: 'farmers', key: 'id' } },
  orderRef: { type: DataTypes.UUID, field: 'orderId', allowNull: false, references: { model: 'orders', key: 'id' } },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.STRING(1500), allowNull: false, defaultValue: '' },
  _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id'); } }
}, {
  tableName: 'reviews',
  timestamps: true,
  updatedAt: false,
  indexes: [{ unique: true, fields: ['consumerId', 'productId', 'orderId'] }, { fields: ['farmerId'] }]
});
