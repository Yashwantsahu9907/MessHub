import asyncHandler from 'express-async-handler';
import authService from '../services/authService.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please include all required fields');
  }
  const user = await authService.registerUser({ name, email, password, role });
  res.status(201).json(user);
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please include email and password');
  }
  const user = await authService.loginUser({ email, password });
  res.status(200).json(user);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await import('../models/User.js').then(m => m.default).then(User => 
    User.findById(req.user._id).populate('activePlan', 'name mealsIncluded durationDays')
  );

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    activeMess: user.activeMess,
    mealBalance: user.mealBalance,
    activePlan: user.activePlan,
    planExpiry: user.planExpiry,
  });
});
