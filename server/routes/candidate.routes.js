const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const candidateController = require('../controllers/candidate.controller');
const auth = require('../middleware/auth');

// @route   GET api/candidates/:id
// @desc    Get candidate by ID
// @access  Public
router.get('/:id', candidateController.getCandidateById);

// @route   GET api/candidates
// @desc    Get all candidates
// @access  Public
router.get('/', candidateController.getAllCandidates);

// @route   GET api/candidates/election/:electionId
// @desc    Get candidates by election
// @access  Public
router.get('/election/:electionId', candidateController.getCandidatesByElection);

// @route   POST api/candidates
// @desc    Create a new candidate
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('department', 'Department is required').not().isEmpty(),
      check('election', 'Election ID is required').not().isEmpty(),
      check('position', 'Position ID is required').not().isEmpty(),
      check('platform', 'Platform is required').not().isEmpty()
    ]
  ],
  candidateController.createCandidate
);

// @route   PUT api/candidates/:id
// @desc    Update candidate
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('department', 'Department is required').not().isEmpty(),
      check('position', 'Position ID is required').not().isEmpty(),
      check('platform', 'Platform is required').not().isEmpty()
    ]
  ],
  candidateController.updateCandidate
);

// @route   DELETE api/candidates/:id
// @desc    Delete candidate
// @access  Private (Admin only)
router.delete('/:id', auth, candidateController.deleteCandidate);

module.exports = router;