const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { sendVerificationEmail } = require('../services/email.service');
require('dotenv').config();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
exports.register = async (req, res) => {
  console.log('Registration attempt with data:', req.body);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, studentId, department, password } = req.body;

  try {
    // Check if user already exists
    console.log('Checking for existing user with email:', email);
    let user = await User.findOne({ email });
    if (user) {
      console.log('User with email already exists');
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    user = await User.findOne({ studentId });
    if (user) {
      return res.status(400).json({ msg: 'User with this student ID already exists' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    console.log('Creating new user with data:', {
      firstName,
      lastName,
      email,
      studentId,
      department,
      verificationToken,
      verificationTokenExpires
    });

    try {
      user = new User({
        firstName,
        lastName,
        email,
        studentId,
        department,
        password,
        verificationToken,
        verificationTokenExpires
      });

      await user.save();
      console.log('User saved successfully with ID:', user._id);
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      throw saveError;
    }

    // Send verification email
    console.log('Attempting to send verification email in controller...');
    try {
      const emailSent = await sendVerificationEmail(email, verificationToken);
      console.log('Email send result:', emailSent);
      // Don't delete the user if email service is disabled
      if (!emailSent && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log('Email sending failed with configured email service, deleting user...');
        await User.deleteOne({ _id: user._id });
        return res.status(500).json({ msg: 'Failed to send verification email' });
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ msg: 'Failed to send verification email: ' + emailError.message });
    }

    // Return success message without token
    res.json({ 
      msg: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if email is verified (skip for admin users)
    if (!user.isEmailVerified && user.role !== 'admin') {
      return res.status(400).json({ 
        msg: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email // Send back email for resend verification
      });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            studentId: user.studentId,
            department: user.department,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ msg: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);
    // Only report failure if email service is configured but failed
    if (!emailSent && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      return res.status(500).json({ msg: 'Failed to send verification email' });
    }

    res.json({ msg: 'Verification email sent successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/auth/verify-email
// @desc    Verify user's email address
// @access  Public
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // Find user with matching verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired verification token' });
    }

    // Update user's verification status
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};