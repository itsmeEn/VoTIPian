const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  maxCandidates: {
    type: Number,
    required: true,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
positionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Position', positionSchema);
