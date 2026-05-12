import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateOTP, sendOTPEmail, sendWelcomeEmail } from '../utils/emailService.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // If a file was uploaded by multer, store local path (served via /uploads)
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  // Create user (unverified)
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'customer',
    isVerified: false,
    verificationOTP: otp,
    verificationOTPExpires: otpExpires,
    image, // <-- new
  });

  if (user) {
    // Send OTP email (best-effort)
    try {
      await sendOTPEmail(email, otp, name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue registration even if email fails
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        image: user.image || '', // <-- include image for FE avatar
      },
      requiresVerification: true,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      assignedBranch: user.assignedBranch,
      image: user.image || '', // <-- include image
    },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      assignedBranch: user.assignedBranch,
      isActive: user.isActive,
      createdAt: user.createdAt,
      image: user.image || '', // <-- include image
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update allowed fields
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;

  // If a new file was uploaded, update local image path
  if (req.file) {
    user.image = `/uploads/${req.file.filename}`; // <-- local path
  } else if (typeof req.body.image === 'string') {
    // Optional: if a direct URL was provided (keep this if you want to support URL pasting)
    user.image = req.body.image || user.image;
  }

  // Handle address - it might come as JSON string from FormData
  if (req.body.address) {
    let addressData = req.body.address;
    
    // If it's a string (from FormData), parse it
    if (typeof addressData === 'string') {
      try {
        addressData = JSON.parse(addressData);
      } catch (e) {
        console.error('Failed to parse address:', e);
      }
    }
    
    user.address = {
      ...user.address,
      ...addressData,
    };
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      image: updatedUser.image || '', // <-- include image
    },
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Private
export const verifyOTP = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.id;

  if (!otp) {
    res.status(400);
    throw new Error('Please provide OTP');
  }

  // Get user with OTP fields
  const user = await User.findById(userId).select('+verificationOTP +verificationOTPExpires');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Email already verified');
  }

  // Check if OTP exists
  if (!user.verificationOTP || !user.verificationOTPExpires) {
    res.status(400);
    throw new Error('No OTP found. Please request a new one.');
  }

  // Check if OTP expired
  if (new Date() > user.verificationOTPExpires) {
    res.status(400);
    throw new Error('OTP has expired. Please request a new one.');
  }

  // Verify OTP
  if (user.verificationOTP !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Mark user as verified
  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpires = undefined;
  await user.save();

  // Send welcome email (best-effort)
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (emailError) {
    console.error('Welcome email failed:', emailError);
  }

  res.json({
    success: true,
    message: 'Email verified successfully!',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      image: user.image || '', // <-- include image
    },
  });
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Private
export const resendOTP = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Email already verified');
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.verificationOTP = otp;
  user.verificationOTPExpires = otpExpires;
  await user.save();

  // Send OTP email
  try {
    await sendOTPEmail(user.email, otp, user.name);
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    res.status(500);
    throw new Error('Failed to send OTP email. Please try again.');
  }

  res.json({
    success: true,
    message: 'New OTP sent to your email',
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // In a real app with refresh tokens, you'd invalidate them here
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide email address');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No account found with this email');
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save OTP to user
  user.resetPasswordToken = otp;
  user.resetPasswordExpires = otpExpires;
  await user.save();

  // Send OTP email
  try {
    const { sendForgotPasswordEmail } = await import('../utils/emailService.js');
    await sendForgotPasswordEmail(email, otp, user.name);
  } catch (emailError) {
    console.error('Password reset email failed:', emailError);
    res.status(500);
    throw new Error('Failed to send password reset email. Please try again.');
  }

  res.json({
    success: true,
    message: 'Password reset code sent to your email',
  });
});

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    res.status(400);
    throw new Error('Please provide email, OTP, and new password');
  }

  // Find user with valid OTP
  const user = await User.findOne({
    email,
    resetPasswordToken: otp,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset code');
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful. You can now login with your new password.',
  });
});