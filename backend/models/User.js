import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: true } },
  email: { type: DataTypes.STRING(254), allowNull: false, unique: true, set(value) { this.setDataValue('email', value?.trim().toLowerCase()); }, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false, validate: { len: [8, 200] } },
  role: { type: DataTypes.ENUM('farmer', 'consumer', 'admin'), allowNull: false, defaultValue: 'consumer' },
  avatar: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id'); } }
}, {
  tableName: 'users',
  timestamps: true,
  updatedAt: false,
  defaultScope: { attributes: { exclude: ['password'] } },
  scopes: { withPassword: { attributes: { include: ['password'] } } },
  hooks: {
    beforeCreate: async (user) => { if (!user.password.startsWith('$2')) user.password = await bcrypt.hash(user.password, 12); },
    beforeUpdate: async (user) => { if (user.changed('password') && !user.password.startsWith('$2')) user.password = await bcrypt.hash(user.password, 12); }
  }
});

User.prototype.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

User.prototype.toJSON = function toJSON() {
  const values = this.get({ plain: true });
  delete values.password;
  return values;
};

export default User;
