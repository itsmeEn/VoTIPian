const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const voteController = require('../controllers/vote.controller');
const auth = require('../middleware/auth');

// @route   POST api/votes
// @desc    Cast a vote
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('electionId', 'Election ID is required').not().isEmpty(),
      check('selections', 'Selections are required').isArray({ min: 1 }),
      check('selections.*.positionId', 'Position ID is required for each selection').not().isEmpty(),
      check('selections.*.candidateId', 'Candidate ID is required for each selection').not().isEmpty()
    ]
  ],
  voteController.castVote
);

// @route   GET api/votes/check/:electionId
// @desc    Check if user has voted in an election
// @access  Private
router.get('/check/:electionId', auth, voteController.checkVoteStatus);

// @route   GET api/votes/stats/:electionId
// @desc    Get voting statistics for an election
// @access  Private (Admin only)
router.get('/stats/:electionId', auth, voteController.getVotingStats);

module.exports = router;