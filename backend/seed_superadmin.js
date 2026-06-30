import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config({ path: './.env' });

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // DO NOT hardcode your password here if pushing to GitHub!
    // Using environment variables instead for security.
    const adminEmail = process.env.ADMIN_EMAIL; 
    const adminPassword = process.env.ADMIN_PASSWORD ; 
    const adminName = 'Super Admin';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      // If admin exists, update the password and role
      admin.password = adminPassword;
      admin.role = 'super_admin';
      admin.name = adminName;
      admin.isSuspended = false;
      await admin.save();
      console.log(`Successfully updated existing admin (${adminEmail}) with new password!`);
    } else {
      // Create new admin if it doesn't exist
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin',
        isSuspended: false
      });
      console.log(`Super Admin ${adminEmail} created successfully!`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedSuperAdmin();
