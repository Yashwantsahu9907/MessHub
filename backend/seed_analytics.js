import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Mess from './models/Mess.js';
import Attendance from './models/Attendance.js';
import Payment from './models/Payment.js';
import Plan from './models/Plan.js';
import JoinRequest from './models/JoinRequest.js';

dotenv.config({ path: './.env' });

const seedAnalytics = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Get Bittu's Mess
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
    console.log(`Found Mess: ${mess.name} (${mess._id})`);

    // 2. Get students in this Mess
    const students = await User.find({ 
      $or: [
        { activeMess: mess._id },
        { email: { $in: ['sp@gmail.com', 'np@gmail.com', 'pp@gmail.com', 'Yashu@gmail.com'] } }
      ]
    });
    console.log(`Found ${students.length} students to seed attendance for.`);

    // 3. Clear existing attendance and payments for clean seeding
    await Attendance.deleteMany({ mess: mess._id });
    await Payment.deleteMany({ mess: mess._id });
    await JoinRequest.deleteMany({ mess: mess._id });

    // 4. Create Plans if not exist
    let plans = await Plan.find({ mess: mess._id });
    if (plans.length === 0) {
      plans = await Plan.create([
        { mess: mess._id, name: 'Basic Plan', durationDays: 15, mealsIncluded: 30, price: 1500 },
        { mess: mess._id, name: 'Premium Plan', durationDays: 30, mealsIncluded: 60, price: 3000 }
      ]);
      console.log('Created seed subscription plans');
    }

    // 5. Generate data over the last 30 days
    const attendanceToInsert = [];
    const paymentsToInsert = [];
    const requestsToInsert = [];

    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Seed Join Requests (Member Growth)
      // We distribute student join request approvals over the 30 days
      students.forEach((student, index) => {
        if (i === (29 - index * 5)) {
          requestsToInsert.push({
            student: student._id,
            mess: mess._id,
            status: 'approved',
            createdAt: new Date(date),
            updatedAt: new Date(date)
          });
        }
      });

      // Seed Attendances: Randomly 1-4 students eat meals each day
      students.forEach(student => {
        // 60% chance student eats on a given day
        if (Math.random() < 0.6) {
          const meals = ['Breakfast', 'Lunch', 'Dinner'];
          // Randomly choose 1 or 2 meals
          const numMeals = Math.floor(Math.random() * 2) + 1;
          const chosenMeals = meals.sort(() => 0.5 - Math.random()).slice(0, numMeals);

          chosenMeals.forEach(meal => {
            attendanceToInsert.push({
              student: student._id,
              mess: mess._id,
              date: dateStr,
              mealType: meal,
              createdAt: new Date(date),
              updatedAt: new Date(date)
            });
          });
        }
      });

      // Seed Payments: 1 payment every few days
      if (i % 4 === 0) {
        const student = students[Math.floor(Math.random() * students.length)];
        const plan = plans[Math.floor(Math.random() * plans.length)];
        const status = Math.random() < 0.85 ? 'paid' : 'pending';
        
        paymentsToInsert.push({
          student: student._id,
          mess: mess._id,
          plan: plan._id,
          amount: plan.price,
          status,
          paymentMethod: Math.random() < 0.7 ? 'online' : 'cash',
          transactionId: status === 'paid' ? `TXN${Math.floor(Math.random() * 10000000)}` : null,
          startDate: new Date(date),
          expiryDate: new Date(date.getTime() + plan.durationDays * 24 * 60 * 60 * 1000),
          paidAt: status === 'paid' ? new Date(date) : null,
          createdAt: new Date(date),
          updatedAt: new Date(date)
        });
      }
    }

    await Attendance.insertMany(attendanceToInsert);
    await Payment.insertMany(paymentsToInsert);
    await JoinRequest.insertMany(requestsToInsert);

    console.log(`Successfully seeded:`);
    console.log(`- ${attendanceToInsert.length} Attendance records`);
    console.log(`- ${paymentsToInsert.length} Payment records`);
    console.log(`- ${requestsToInsert.length} JoinRequest approvals`);

    // Make sure students are marked as active in bittu's mess
    for (const student of students) {
      student.activeMess = mess._id;
      await student.save();
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAnalytics();
