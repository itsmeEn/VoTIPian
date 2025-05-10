const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const LoginHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  success: Boolean
});

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpires: {
    type: Date
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^.+@tip\.edu\.ph$/, 'Please use a valid TIP email address']
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true,
    enum: ['CEA', 'CCS', 'CBA', 'CEDU', 'CACS']
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'voter',
    enum: ['voter', 'candidate', 'admin']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [LoginHistorySchema],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  notes: String // Admin notes about the user
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);