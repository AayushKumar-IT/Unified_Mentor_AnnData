import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export default sequelize.define('Farmer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userRef: { type: DataTypes.UUID, field: 'userId', allowNull: false, unique: true, references: { model: 'users', key: 'id' } },
  farmName: { type: DataTypes.STRING(150), allowNull: false, validate: { notEmpty: true } },
  farmLocation: { type: DataTypes.STRING(250), allowNull: false, validate: { notEmpty: true } },
  cropTypes: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  farmingMethod: { type: DataTypes.ENUM('organic', 'conventional'), allowNull: false },
  bio: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  verificationDocs: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id'); } }
}, { tableName: 'farmers', timestamps: true });
