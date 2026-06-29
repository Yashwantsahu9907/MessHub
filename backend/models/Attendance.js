import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
    required: true,
  }
}, {
  timestamps: true,
});

// Ensure duplicate attendance is not recorded for the same student, same mess, same date, and same mealType
attendanceSchema.index({ student: 1, mess: 1, date: 1, mealType: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
