import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Mess from './models/Mess.js';
import Complaint from './models/Complaint.js';

dotenv.config({ path: './.env' });

const seedComplaints = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const bittu = await User.findOne({ email: 'bittu@gmail.com' });
    if (!bittu) {
      console.error('Bittu not found');
      process.exit(1);
    }
    const mess = await Mess.findOne({ owner: bittu._id });
    if (!mess) {
      console.error('Mess not found');
      process.exit(1);
    }
    const student = await User.findOne({ email: 'sp@gmail.com' });
    const student2 = await User.findOne({ email: 'np@gmail.com' });

    if (!student || !student2) {
      console.error('Students not found');
      process.exit(1);
    }

    // Clear old complaints
    await Complaint.deleteMany({});

    await Complaint.create([
      {
        student: student._id,
        mess: mess._id,
        title: 'Unhygienic kitchen conditions',
        description: 'The kitchen staff does not wear gloves, and fly screens are missing from the windows.',
        status: 'pending'
      },
      {
        student: student2._id,
        mess: mess._id,
        title: 'Dinner served cold',
        description: 'Over the last week, dinner has consistently been cold by 8:30 PM.',
        status: 'pending'
      }
    ]);

    console.log('Complaints seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedComplaints();
