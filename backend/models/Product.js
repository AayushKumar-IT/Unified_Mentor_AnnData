import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export default sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  farmerRef: { type: DataTypes.UUID, field: 'farmerId', allowNull: false, references: { model: 'farmers', key: 'id' } },
  categoryId: { type: DataTypes.UUID, allowNull: false, references: { model: 'categories', key: 'id' } },
  name: { type: DataTypes.STRING(120), allowNull: false, validate: { notEmpty: true } },
  description: { type: DataTypes.STRING(3000), allowNull: false },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
  unit: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'kg' },
  quantityAvailable: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
  harvestDate: { type: DataTypes.DATE, allowNull: false },
  isOrganic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  images: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  isAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  ratings: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
  _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id'); } }
}, { tableName: 'products', timestamps: true, indexes: [{ fields: ['farmerId'] }, { fields: ['isAvailable'] }] });
