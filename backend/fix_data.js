import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import JoinRequest from './models/JoinRequest.js';

dotenv.config({ path: './.env' });

const fixInconsistentData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all approved join requests
    const approvedRequests = await JoinRequest.find({ status: 'approved' });
    
    let fixedCount = 0;
    
    for (const req of approvedRequests) {
      const student = await User.findById(req.student);
      if (student && !student.activeMess) {
        student.activeMess = req.mess;
        await student.save();
        fixedCount++;
        console.log(`Fixed student: ${student.email}`);
      }
    }
    
    console.log(`Fixed ${fixedCount} inconsistent students.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixInconsistentData();
