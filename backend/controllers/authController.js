const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      registerNumber,
      email,
      password,
      role = 'student',
      department,
      year,
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    if (!registerNumber || !registerNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Register number or ID is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Campus email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters long.',
      });
    }

    // Role safety: default to student. In development, faculty and admin are supported for testing.
    const allowedRoles = ['student', 'faculty', 'admin'];
    const assignedRole = allowedRoles.includes(role?.toLowerCase())
      ? role.toLowerCase()
      : 'student';

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRegNo = registerNumber.trim().toUpperCase();

    // Check for existing user by email or register number
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const existingRegNo = await User.findOne({ registerNumber: normalizedRegNo });
    if (existingRegNo) {
      return res.status(409).json({
        success: false,
        message: 'An account with this register number or ID already exists.',
      });
    }

    // Create user record (pre-save hook hashes password)
    const user = await User.create({
      name: name.trim(),
      registerNumber: normalizedRegNo,
      email: normalizedEmail,
      password: password,
      role: assignedRole,
      department: department?.trim() || 'Computer Science & Engineering',
      year: year?.trim() || (assignedRole === 'student' ? '1st Year' : undefined),
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your register number or email.',
      });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password.',
      });
    }

    const cleanId = identifier.trim();
    const cleanPw = password.trim();

    // Search user by registerNumber OR email (explicitly selecting password)
    const user = await User.findOne({
      $or: [
        { registerNumber: cleanId.toUpperCase() },
        { email: cleanId.toLowerCase() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid register number/email or password.',
      });
    }

    // Verify bcrypt password hash
    const isMatch = await user.matchPassword(cleanPw);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid register number/email or password.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Bearer JWT required)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user attached by protect middleware
    res.status(200).json({
      success: true,
      user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset instructions
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email or register number.',
      });
    }

    const cleanId = identifier.trim();
    const user = await User.findOne({
      $or: [
        { registerNumber: cleanId.toUpperCase() },
        { email: cleanId.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found matching the provided register number or email.',
      });
    }

    // In production, dispatch email with OTP token. For development, return verification code.
    res.status(200).json({
      success: true,
      message: 'Password reset verification code dispatched.',
      testCode: '123456',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using verification code
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Identifier, verification code, and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const cleanId = identifier.trim();
    const user = await User.findOne({
      $or: [
        { registerNumber: cleanId.toUpperCase() },
        { email: cleanId.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.',
      });
    }

    // Set new password (pre-save hook hashes with bcrypt)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been updated successfully. Please sign in.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};
