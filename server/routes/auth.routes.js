const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid TIP email').isEmail().matches(/@tip\.edu\.ph$/),
    check('studentId', 'Student ID is required').not().isEmpty(),
    check('department', 'Department is required').isIn(['CEA', 'CCS', 'CBA', 'CEDU', 'CACS']),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getCurrentUser);

// @route   GET api/auth/verify-email
// @desc    Verify user's email
// @access  Public
router.get('/verify-email', authController.verifyEmail);

// Resend verification email
router.post('/resend-verification', [
  check('email', 'Please include a valid email').isEmail()
], authController.resendVerification);

module.exports = router;