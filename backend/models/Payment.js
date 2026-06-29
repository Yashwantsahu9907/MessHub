import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
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
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: 'cash', // 'online', 'cash'
  },
  transactionId: {
    type: String, // Useful for future gateway integration
    default: null,
  },
  startDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  paidAt: {
    type: Date,
  }
}, {
  timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
