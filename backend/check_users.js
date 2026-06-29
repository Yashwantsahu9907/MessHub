import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
  import Mess from './models/Mess.js';

dotenv.config({ path: './.env' });

const resetPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const bittu = await User.findOne({ email: 'bittu@gmail.com' });
    if (bittu) {
      bittu.password = '123456';
      await bittu.save();
      console.log('Reset bittu password');
    }
    
    const yashu = await User.findOne({ email: 'yashu@gmail.com' });
    if (yashu) {
      yashu.password = '123456';
      await yashu.save();
      console.log('Reset yashu password');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetPasswords();
