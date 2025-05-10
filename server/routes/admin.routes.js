const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const Discussion = require('../models/Discussion');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const csv = require('fast-csv');
const { sendPasswordResetEmail } = require('../services/email.service');
const crypto = require('crypto');

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', [auth, admin], async (req, res) => {
  try {
    // Get total elections
    const totalElections = await Election.countDocuments();
    
    // Get active elections
    const activeElections = await Election.countDocuments({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    // Get total candidates
    const totalCandidates = await Candidate.countDocuments();

    // Get total registered users
    const totalUsers = await User.countDocuments();

    // Get recent activity (last 5 votes and discussions)
    const recentVotes = await Vote.find()
      .populate('voter', 'firstName lastName')
      .populate('election', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentDiscussions = await Discussion.find()
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate storage usage (mock data for now)
    const storageUsage = {
      used: '2.1 GB',
      total: '10 GB',
      percentage: '21%'
    };

    res.json({
      totalElections,
      activeElections,
      totalCandidates,
      totalUsers,
      recentActivity: {
        votes: recentVotes,
        discussions: recentDiscussions
      },
      storage: storageUsage
    });

  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    res.status(500).json({ msg: 'Server error getting dashboard statistics' });
  }
});

// @route   GET api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private/Admin
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = {};
    
    if (req.query.department && req.query.department !== 'all') {
      query.department = req.query.department;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex }
      ];
    }

    // Get total count for pagination
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get users with pagination
    const users = await User.find(query)
      .select('-password -verificationToken -verificationTokenExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      totalPages,
      currentPage: page,
      totalUsers: total
    });
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ msg: 'Server error getting users' });
  }
});

// Create new user
router.post('/users', [auth, admin], async (req, res) => {
  try {
    const { firstName, lastName, email, studentId, department, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { studentId }] });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create user
    user = new User({
      firstName,
      lastName,
      email,
      studentId,
      department,
      password,
      role: role || 'voter',
      isEmailVerified: true // Admin-created accounts are pre-verified
    });

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ msg: 'Server error creating user' });
  }
});

// Update user
router.put('/users/:id', [auth, admin], async (req, res) => {
  try {
    const { firstName, lastName, email, studentId, department, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (studentId) user.studentId = studentId;
    if (department) user.department = department;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ msg: 'Server error updating user' });
  }
});

// Delete user
router.delete('/users/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.remove();
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ msg: 'Server error deleting user' });
  }
});

// Reset user password
router.post('/users/:id/reset-password', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ msg: 'Password reset email sent' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ msg: 'Server error resetting password' });
  }
});

// Import users from CSV
const upload = multer({ dest: 'uploads/' });
router.post('/users/import', [auth, admin, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a CSV file' });
    }

    const users = [];
    const errors = [];

    csv.parseFile(req.file.path, { headers: true })
      .on('data', async (row) => {
        try {
          const user = new User({
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            studentId: row.studentId,
            department: row.department,
            password: row.password || 'changeme123', // Default password
            role: row.role || 'voter',
            isEmailVerified: true
          });
          users.push(user);
        } catch (err) {
          errors.push({ row, error: err.message });
        }
      })
      .on('end', async () => {
        try {
          await User.insertMany(users);
          res.json({ 
            success: true, 
            imported: users.length,
            errors: errors.length ? errors : undefined
          });
        } catch (err) {
          res.status(500).json({ msg: 'Error importing users', errors });
        }
      });
  } catch (err) {
    console.error('Error importing users:', err);
    res.status(500).json({ msg: 'Server error importing users' });
  }
});

// Export users
router.get('/users/export', [auth, admin], async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpires');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);

    users.forEach(user => {
      csvStream.write({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      });
    });

    csvStream.end();
  } catch (err) {
    console.error('Error exporting users:', err);
    res.status(500).json({ msg: 'Server error exporting users' });
  }
});

// Get user activity logs
router.get('/users/:id/activity', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get user's votes
    const votes = await Vote.find({ voter: req.params.id })
      .populate('election', 'title')
      .select('election createdAt');

    // Get user's discussions
    const discussions = await Discussion.find({ author: req.params.id })
      .select('title createdAt');

    res.json({
      votes,
      discussions,
      lastLogin: user.lastLogin,
      loginHistory: user.loginHistory || []
    });
  } catch (err) {
    console.error('Error getting user activity:', err);
    res.status(500).json({ msg: 'Server error getting user activity' });
  }
});

module.exports = router;
