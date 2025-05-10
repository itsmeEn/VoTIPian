const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  check('firstName', 'First name is required').not().isEmpty(),
  check('lastName', 'Last name is required').not().isEmpty(),
  check('department', 'Department is required').isIn(['CEA', 'CCS', 'CBA', 'CEDU', 'CACS'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, department } = req.body;

    // Find user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.department = department;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
