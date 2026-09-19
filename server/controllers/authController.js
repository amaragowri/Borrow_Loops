const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');
const storageService = require('../services/storageService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, location, bio, preference } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log(`[Auth Register] Registration attempt received for normalized email: ${normalizedEmail}`);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log(`[Auth Register] Duplicate registration rejected: user already exists for ${normalizedEmail}`);
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    let avatarData = {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      publicId: 'default_avatar',
    };

    if (req.file) {
      const processed = storageService.processUploadedFile(req.file);
      if (processed) {
        avatarData = {
          url: processed.url,
          publicId: processed.publicId,
        };
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      phone: phone ? phone.trim() : '',
      location: location ? location.trim() : 'Bengaluru, India',
      bio: bio ? bio.trim() : 'BorrowLoop member sharing resources in the community.',
      preference: preference || 'both',
      avatar: avatarData,
    });

    console.log(`[Auth Register] User successfully created in MongoDB (ID: ${user._id})`);

    const token = generateToken(user._id);
    console.log(`[Auth Register] JWT generated successfully for new user ID: ${user._id}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to BorrowLoop.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        role: user.role,
        preference: user.preference,
        avatar: user.avatar,
        rating: user.rating,
        ratingsCount: user.ratingsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log(`[Auth Login] Login request received for normalized email: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    const userFound = !!user;
    console.log(`[Auth Login] User found: ${userFound}`);

    if (!user) {
      console.log(`[Auth Login] Login failed: User not found for email: ${normalizedEmail}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isBlocked) {
      console.log(`[Auth Login] Login blocked: User account is suspended (ID: ${user._id})`);
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    console.log(`[Auth Login] Password comparison result: ${isMatch}`);

    if (!isMatch) {
      console.log(`[Auth Login] Login failed: Password mismatch for user ID: ${user._id}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    console.log(`[Auth Login] JWT generated successfully for user ID: ${user._id}`);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        role: user.role,
        preference: user.preference,
        avatar: user.avatar,
        rating: user.rating,
        ratingsCount: user.ratingsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & avatar
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, location, bio, preference } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (preference) user.preference = preference;

    if (req.file) {
      const processed = storageService.processUploadedFile(req.file);
      if (processed) {
        // Delete old avatar if local
        if (user.avatar && user.avatar.publicId && user.avatar.publicId !== 'default_avatar') {
          storageService.deleteFile(user.avatar.publicId, 'profiles');
        }
        user.avatar = {
          url: processed.url,
          publicId: processed.publicId,
        };
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulated Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account with that email address exists.' });
    }

    res.json({
      success: true,
      message: 'Password reset link has been dispatched to your email address (Simulated).',
      mockToken: 'reset_mock_token_borrowloop_sample',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulated Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been successfully reset! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
};
