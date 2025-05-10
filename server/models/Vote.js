const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  selections: [{
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
      required: true
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true
    }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

// Ensure a user can only vote once per election
VoteSchema.index({ voter: 1, election: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);