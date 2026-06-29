import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config({ path: './.env' });

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (adminExists) {
      adminExists.role = 'super_admin';
      adminExists.isSuspended = false;
      await adminExists.save();
      console.log('Updated existing admin@gmail.com to super_admin role');
      process.exit(0);
    }

    await User.create({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: '123456',
      role: 'super_admin',
      isSuspended: false
    });

    console.log('Super Admin admin@gmail.com seeded successfully with password 123456');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedSuperAdmin();
