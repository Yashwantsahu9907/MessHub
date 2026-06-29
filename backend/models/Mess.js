import mongoose from 'mongoose';

const messSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  joinCode: {
    type: String,
    required: true,
    unique: true,
  },
  qrCode: {
    type: String, // Data URI for the QR code image
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

const Mess = mongoose.model('Mess', messSchema);
export default Mess;
