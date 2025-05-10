const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Discussion = require('../models/Discussion'); // Import the User model

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
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
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, department, currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update basic info
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.department = department || user.department;

    // If trying to change password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ msg: 'Current password is required to set new password' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ msg: 'Server error updating profile' });
  }
});

// @route   GET api/users/votes
// @desc    Get user's voting history
// @access  Private
router.get('/votes', auth, async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.user.id })
      .populate({
        path: 'election',
        select: 'title startDate endDate'
      })
      .sort({ timestamp: -1 });

    res.json(votes);
  } catch (err) {
    console.error('Error getting user votes:', err);
    res.status(500).json({ msg: 'Server error getting voting history' });
  }
});

// @route   GET api/users/discussions
// @desc    Get user's discussions
// @access  Private
router.get('/discussions', auth, async (req, res) => {
  try {
    const discussions = await Discussion.find({ author: req.user.id })
      .populate('author', 'firstName lastName')
      .select('title content category createdAt updatedAt comments')
      .sort({ updatedAt: -1 });

    // Add comment count to each discussion
    const discussionsWithComments = discussions.map(discussion => {
      const { _doc } = discussion;
      return {
        ..._doc,
        commentCount: discussion.comments ? discussion.comments.length : 0
      };
    });

    res.json(discussionsWithComments);
  } catch (err) {
    console.error('Error getting user discussions:', err);
    res.status(500).json({ msg: 'Server error getting discussions' });
  }
});

module.exports = router;