import asyncHandler from 'express-async-handler';
import Mess from '../models/Mess.js';
import JoinRequest from '../models/JoinRequest.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';

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

// @desc    Get pending join requests for a mess
// @route   GET /api/mess/requests
// @access  Private/MessOwner
export const getJoinRequests = asyncHandler(async (req, res) => {
  const mess = await Mess.findOne({ owner: req.user._id });
  if (!mess) {
    res.status(404);
    throw new Error('Mess not found');
  }

  const requests = await JoinRequest.find({ mess: mess._id, status: 'pending' }).populate('student', 'name email');
  res.status(200).json(requests);
});

// @desc    Approve or reject a join request
// @route   PUT /api/mess/requests/:id
// @access  Private/MessOwner
export const processJoinRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const joinRequest = await JoinRequest.findById(req.params.id).populate('student');
  if (!joinRequest) {
    res.status(404);
    throw new Error('Join request not found');
  }

  const mess = await Mess.findOne({ owner: req.user._id });
  if (!mess || joinRequest.mess.toString() !== mess._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to process this request');
  }

  joinRequest.status = status;
  await joinRequest.save();

  if (status === 'approved') {
    const student = await User.findById(joinRequest.student._id);
    student.activeMess = mess._id;
    await student.save();
  }

  res.status(200).json({ message: `Request ${status} successfully` });
});

// @desc    Get members of a mess
// @route   GET /api/mess/members
// @access  Private/MessOwner
export const getMessMembers = asyncHandler(async (req, res) => {
  const mess = await Mess.findOne({ owner: req.user._id });
  if (!mess) {
    res.status(404);
    throw new Error('Mess not found');
  }

  const members = await User.find({ activeMess: mess._id }).select('-password');
  res.status(200).json(members);
});

// @desc    Remove a member from the mess
// @route   DELETE /api/mess/members/:studentId
// @access  Private/MessOwner
export const removeMember = asyncHandler(async (req, res) => {
  const mess = await Mess.findOne({ owner: req.user._id });
  if (!mess) {
    res.status(404);
    throw new Error('Mess not found');
  }

  const student = await User.findById(req.params.studentId);
  if (!student || !student.activeMess || student.activeMess.toString() !== mess._id.toString()) {
    res.status(404);
    throw new Error('Student not found in this mess');
  }

  student.activeMess = null;
  await student.save();

  res.status(200).json({ message: 'Member removed successfully' });
});

// @desc    Get student's active mess profile
// @route   GET /api/mess/student/active
// @access  Private/Student
export const getStudentMess = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user._id).populate('activeMess');
  if (!student.activeMess) {
    res.status(404);
    throw new Error('No active mess found');
  }

  res.status(200).json(student.activeMess);
});

// @desc    Mark attendance via QR code scan
// @route   POST /api/mess/attendance
// @access  Private/Student
export const markAttendance = asyncHandler(async (req, res) => {
  const { joinCode } = req.body;

  if (!joinCode) {
    res.status(400);
    throw new Error('QR Code data (Join Code) is missing');
  }

  const student = await User.findById(req.user._id);

  if (!student.activeMess) {
    res.status(403);
    throw new Error('You do not have an active mess membership');
  }

  const mess = await Mess.findOne({ joinCode: joinCode.toUpperCase() });

  if (!mess || mess._id.toString() !== student.activeMess.toString()) {
    res.status(403);
    throw new Error('Invalid QR code for your active mess');
  }

  if (student.mealBalance <= 0) {
    res.status(400);
    throw new Error('No meal balance remaining. Please recharge your account.');
  }

  // Determine meal type based on current time (server local time / UTC adjusted if needed)
  const now = new Date();
  const hour = now.getHours(); // 0-23
  let mealType = '';

  if (hour >= 6 && hour <= 11) {
    mealType = 'Breakfast';
  } else if (hour >= 12 && hour <= 16) {
    mealType = 'Lunch';
  } else if (hour >= 18 && hour <= 23) {
    mealType = 'Dinner';
  } else {
    res.status(400);
    throw new Error('Attendance can only be marked during meal hours (Breakfast: 6-11, Lunch: 12-16, Dinner: 18-23)');
  }

  // Format date as YYYY-MM-DD
  const dateStr = now.toISOString().split('T')[0];

  // Check if attendance already exists
  const existingAttendance = await Attendance.findOne({
    student: student._id,
    mess: mess._id,
    date: dateStr,
    mealType: mealType
  });

  if (existingAttendance) {
    res.status(400);
    throw new Error(`Attendance for ${mealType} today has already been marked.`);
  }

  // Create attendance
  await Attendance.create({
    student: student._id,
    mess: mess._id,
    date: dateStr,
    mealType: mealType
  });

  // Deduct balance
  student.mealBalance -= 1;
  await student.save();

  // Create notification
  await Notification.create({
    user: student._id,
    title: 'Attendance Confirmed',
    message: `Your attendance for ${mealType} at ${mess.name} has been recorded. 1 meal deducted. Remaining balance: ${student.mealBalance}.`,
    type: 'success'
  });

  res.status(200).json({ 
    message: 'Attendance marked successfully', 
    mealType, 
    remainingBalance: student.mealBalance 
  });
});

// @desc    Get student notifications
// @route   GET /api/mess/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
  res.status(200).json(notifications);
});
