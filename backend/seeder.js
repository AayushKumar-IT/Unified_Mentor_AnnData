import 'dotenv/config';
import bcrypt from 'bcryptjs';
import connectDB, { sequelize } from './config/db.js';
import { Category, User } from './models/index.js';

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || 'admin@anndata.com';
const adminPassword = 'Admin@1234';

const seed = async () => {
  await connectDB();
  await sequelize.sync();
  const defaults = [
    { name: 'Vegetables', slug: 'vegetables', icon: '🥕' },
    { name: 'Fruits', slug: 'fruits', icon: '🍎' },
    { name: 'Dairy', slug: 'dairy', icon: '🥛' },
    { name: 'Grains', slug: 'grains', icon: '🌾' }
  ];
  for (const category of defaults) {
    await Category.findOrCreate({ where: { slug: category.slug }, defaults: category });
  }

  const admin = await User.unscoped().findOne({ where: { email: adminEmail } });
  if (admin) {
    admin.role = 'admin';
    admin.password = adminPassword;
    await admin.save();
  } else {
    await User.create({
      name: 'AnnDaata Admin',
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      role: 'admin'
    });
  }
  console.log(`Seed complete. Admin login: ${adminEmail} / ${adminPassword}`);
};

seed()
  .then(() => sequelize.close())
  .catch(async (error) => {
    console.error(`Seeding failed: ${error.message}`);
    await sequelize.close();
    process.exitCode = 1;
  });
