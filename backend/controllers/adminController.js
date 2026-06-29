import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Mess from '../models/Mess.js';

// @desc    Get overall platform statistics
// @route   GET /api/admin/stats
// @access  Private/SuperAdmin
export const getPlatformStats = asyncHandler(async (req, res) => {
  const totalMesses = await Mess.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalOwners = await User.countDocuments({ role: 'mess_owner' });

  // For a real app, this could check if a mess has active members or recent activity
  const activeMesses = totalMesses; 

  res.status(200).json({
    totalMesses,
    totalStudents,
    totalOwners,
    activeMesses,
  });
});
