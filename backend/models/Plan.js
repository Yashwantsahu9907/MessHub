import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  mess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
    required: true,
  },
  name: {
    type: String,
    required: true, // e.g. "Monthly Premium", "15 Days Basic"
  },
  durationDays: {
    type: Number,
    required: true,
  },
  mealsIncluded: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
