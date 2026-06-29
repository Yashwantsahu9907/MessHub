import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Mess from '../models/Mess.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';
import Complaint from '../models/Complaint.js';
import Setting from '../models/Setting.js';
import Notification from '../models/Notification.js';
import { broadcastNotification } from '../socket.js';

// @desc    Get overall platform statistics
// @route   GET /api/admin/stats
// @access  Private/SuperAdmin
export const getPlatformStats = asyncHandler(async (req, res) => {
  const totalMesses = await Mess.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalOwners = await User.countDocuments({ role: 'mess_owner' });
  const activeMesses = await Mess.countDocuments({ isApproved: true });
  
  const totalAttendance = await Attendance.countDocuments();
  const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
  const totalComplaints = await Complaint.countDocuments();

  const revenueAggregation = await Payment.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

  res.status(200).json({
    totalMesses,
    totalStudents,
    totalOwners,
    activeMesses,
    totalRevenue,
    totalAttendance,
    pendingComplaints,
    totalComplaints
  });
});

// @desc    Get all registered messes
// @route   GET /api/admin/messes
// @access  Private/SuperAdmin
export const getAllMesses = asyncHandler(async (req, res) => {
  const messes = await Mess.find()
    .populate('owner', 'name email isSuspended')
    .sort({ createdAt: -1 });

  res.status(200).json(messes);
});

// @desc    Approve or block a mess
// @route   PUT /api/admin/messes/:id/status
// @access  Private/SuperAdmin
export const updateMessStatus = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;
  
  const mess = await Mess.findById(req.params.id);
  if (!mess) {
    res.status(404);
    throw new Error('Mess not found');
  }

  mess.isApproved = isApproved;
  await mess.save();

  res.status(200).json({
    message: `Mess ${isApproved ? 'approved' : 'blocked'} successfully`,
    mess
  });
});

// @desc    Get all users (students & mess owners)
// @route   GET /api/admin/users
// @access  Private/SuperAdmin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: 'super_admin' } })
    .populate('activeMess', 'name')
    .sort({ role: 1, name: 1 });

  res.status(200).json(users);
});

// @desc    Suspend or unsuspend user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/SuperAdmin
export const updateUserSuspension = asyncHandler(async (req, res) => {
  const { isSuspended } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'super_admin') {
    res.status(400);
    throw new Error('Super Admins cannot be suspended');
  }

  user.isSuspended = isSuspended;
  await user.save();

  res.status(200).json({
    message: `User account ${isSuspended ? 'suspended' : 'activated'} successfully`,
    user
  });
});

// @desc    Broadcast announcement to all users
// @route   POST /api/admin/broadcast
// @access  Private/SuperAdmin
export const broadcastAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error('Title and message are required');
  }

  // 1. Get all active users who are not super admin
  const users = await User.find({ role: { $ne: 'super_admin' } });
  
  // 2. Create notifications for all of them in database
  const notifications = users.map(user => ({
    user: user._id,
    title,
    message,
    type: 'announcement',
    isRead: false
  }));

  await Notification.insertMany(notifications);

  // 3. Emit real-time announcement to all connected sockets
  broadcastNotification({
    title,
    message,
    type: 'announcement',
    createdAt: new Date()
  });

  res.status(200).json({
    message: 'Announcement broadcasted successfully to all users',
    recipientCount: users.length
  });
});

// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private/SuperAdmin
export const getAllComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find()
    .populate('student', 'name email')
    .populate('mess', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(complaints);
});

// @desc    Resolve a student complaint
// @route   PUT /api/admin/complaints/:id/resolve
// @access  Private/SuperAdmin
export const resolveComplaint = asyncHandler(async (req, res) => {
  const { resolution } = req.body;

  if (!resolution) {
    res.status(400);
    throw new Error('Resolution details are required');
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  complaint.status = 'resolved';
  complaint.resolution = resolution;
  await complaint.save();

  // Create a notification for the student
  await Notification.create({
    user: complaint.student,
    title: 'Complaint Resolved',
    message: `Your complaint "${complaint.title}" has been resolved: ${resolution}`,
    type: 'general',
    isRead: false
  });

  res.status(200).json({
    message: 'Complaint resolved successfully',
    complaint
  });
});

// @desc    Get all global platform settings
// @route   GET /api/admin/settings
// @access  Private/SuperAdmin
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.find();
  
  // If no settings exist yet, create default settings
  if (settings.length === 0) {
    settings = await Setting.create([
      { key: 'allowNewRegistrations', value: true, description: 'Allow new students and mess owners to sign up.' },
      { key: 'maxPlanPriceLimit', value: 10000, description: 'Maximum price (INR) allowed for mess subscription plans.' },
      { key: 'maintenanceMode', value: false, description: 'Put the platform under scheduled maintenance.' }
    ]);
  }

  res.status(200).json(settings);
});

// @desc    Update a global platform setting
// @route   PUT /api/admin/settings
// @access  Private/SuperAdmin
export const updateSetting = asyncHandler(async (req, res) => {
  const { key, value } = req.body;

  let setting = await Setting.findOne({ key });
  if (!setting) {
    setting = new Setting({ key, value });
  } else {
    setting.value = value;
  }

  await setting.save();

  res.status(200).json({
    message: `Setting ${key} updated successfully`,
    setting
  });
});

// @desc    Get system health and diagnostics
// @route   GET /api/admin/health
// @access  Private/SuperAdmin
export const getSystemHealth = asyncHandler(async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  const processUptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'Healthy',
    database: dbStatus,
    uptime: `${Math.floor(processUptime / 3600)}h ${Math.floor((processUptime % 3600) / 60)}m`,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    },
    platform: process.platform,
    nodeVersion: process.version
  });
});
