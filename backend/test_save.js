import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import JoinRequest from './models/JoinRequest.js';

dotenv.config({ path: './.env' });

const checkYashu = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const yashu = await User.findOne({ email: 'yashu@gmail.com' });
    if (yashu) {
      console.log('Found yashu');
      const reqs = await JoinRequest.find({ student: yashu._id });
      console.log('Requests:', reqs);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkYashu();
