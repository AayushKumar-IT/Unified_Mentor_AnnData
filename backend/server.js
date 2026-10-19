import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import connectDB from './config/db.js';
import { sequelize } from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
const backendDir = path.dirname(fileURLToPath(import.meta.url));
app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') || (process.env.NODE_ENV === 'production' ? false : true) }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(backendDir, 'uploads')));
app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/farmers', farmerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required. Configure backend/.env before starting the API.');
  await connectDB();
  await sequelize.sync();
  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => console.log(`AnnDaata API listening on port ${port}`));
};

if (process.env.NODE_ENV !== 'test') start().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exitCode = 1;
});

export default app;
