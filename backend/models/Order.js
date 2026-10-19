import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export default sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  consumerRef: { type: DataTypes.UUID, field: 'consumerId', allowNull: false, references: { model: 'users', key: 'id' } },
  farmerRef: { type: DataTypes.UUID, field: 'farmerId', allowNull: false, references: { model: 'farmers', key: 'id' } },
  totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
  status: { type: DataTypes.ENUM('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'), allowNull: false, defaultValue: 'pending' },
  deliverySlot: { type: DataTypes.DATE, allowNull: false },
  deliveryAddress: { type: DataTypes.STRING(1000), allowNull: false },
  _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id'); } }
}, { tableName: 'orders', timestamps: true, indexes: [{ fields: ['consumerId'] }, { fields: ['farmerId'] }] });
