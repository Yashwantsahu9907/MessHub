import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error('User already exists');
  }

  // Ensure super_admin cannot be created via this endpoint
  const assignedRole = role === 'super_admin' ? 'student' : (role || 'student');

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole,
  });

  if (user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    };
  } else {
    throw new Error('Invalid user data');
  }
};

const loginUser = async (credentials) => {
  const { email, password } = credentials;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

export default {
  registerUser,
  loginUser
};
