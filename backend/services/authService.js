import User from '../models/User.js';
import Mess from '../models/Mess.js';
import generateToken from '../utils/generateToken.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

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
    // If mess_owner, create a unique Mess profile automatically
    if (assignedRole === 'mess_owner') {
      const joinCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char unique code
      
      // Generate QR Code data URI containing the join code (or a URL with the join code)
      const qrData = JSON.stringify({ action: 'join_mess', code: joinCode });
      const qrCodeImage = await QRCode.toDataURL(qrData);

      await Mess.create({
        owner: user._id,
        name: `${user.name}'s Mess`, // Default name, can be changed later
        joinCode,
        qrCode: qrCodeImage
      });
    }

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
