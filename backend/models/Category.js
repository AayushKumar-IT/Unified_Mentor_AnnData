import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export default sequelize.define('Category', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true, validate: { notEmpty: true } },
  slug: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { notEmpty: true } },
  icon: { type: DataTypes.STRING(32), allowNull: false, defaultValue: '🌱' },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id'); } }
}, { tableName: 'categories', timestamps: true });
