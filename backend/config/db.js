import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/anndata', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? (message) => console.log(`[database] ${message}`) : false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: process.env.DATABASE_SSL === 'true'
    ? { ssl: { require: true, rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' } }
    : {}
});

export default async function connectDB() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Copy backend/.env.example to backend/.env and configure PostgreSQL.');
  }
  await sequelize.authenticate();
  console.log(`PostgreSQL connected: ${sequelize.config.host}/${sequelize.config.database}`);
}
