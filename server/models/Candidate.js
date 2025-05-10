const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  voteCount: {
    type: Number,
    default: 0
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

// Ensure a candidate can only run for one position in an election
CandidateSchema.index({ election: 1, position: 1, name: 1 }, { unique: true });

// Update the updatedAt field before saving
CandidateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Candidate', CandidateSchema);