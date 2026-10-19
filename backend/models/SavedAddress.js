import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export default sequelize.define('SavedAddress', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userRef: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
  label: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'Saved address' },
  address: { type: DataTypes.STRING(1000), allowNull: false, validate: { notEmpty: true } }
}, {
  tableName: 'saved_addresses',
  timestamps: true,
  indexes: [{ fields: ['userRef'] }]
});
