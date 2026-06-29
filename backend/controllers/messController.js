import asyncHandler from 'express-async-handler';
import Mess from '../models/Mess.js';
import JoinRequest from '../models/JoinRequest.js';

// @desc    Get mess profile for owner
// @route   GET /api/mess/profile
// @access  Private/MessOwner
export const getMessProfile = asyncHandler(async (req, res) => {
  const mess = await Mess.findOne({ owner: req.user._id });

  if (!mess) {
    res.status(404);
    throw new Error('Mess profile not found');
  }

  // Get pending requests count
  const pendingRequestsCount = await JoinRequest.countDocuments({ mess: mess._id, status: 'pending' });

  res.status(200).json({
    ...mess.toObject(),
    pendingRequestsCount
  });
});

// @desc    Student requests to join a mess using code
// @route   POST /api/mess/join
// @access  Private/Student
export const requestJoin = asyncHandler(async (req, res) => {
  const { joinCode } = req.body;

  if (!joinCode) {
    res.status(400);
    throw new Error('Please provide a join code');
  }

  const mess = await Mess.findOne({ joinCode: joinCode.toUpperCase() });

  if (!mess) {
    res.status(404);
    throw new Error('Invalid join code. Mess not found.');
  }

  // Check if request already exists
  const existingRequest = await JoinRequest.findOne({ student: req.user._id, mess: mess._id });

  if (existingRequest) {
    res.status(400);
    throw new Error(`You already have a ${existingRequest.status} request for this mess.`);
  }

  const joinRequest = await JoinRequest.create({
    student: req.user._id,
    mess: mess._id,
    status: 'pending'
  });

  res.status(201).json({ message: 'Join request sent successfully', request: joinRequest });
});
