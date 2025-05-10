const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const electionController = require('../controllers/election.controller');
const auth = require('../middleware/auth');

// GET Routes
// @route   GET api/elections
// @desc    Get all elections
// @access  Public
router.get('/', electionController.getAllElections);

// @route   GET api/elections/active
// @desc    Get active elections
// @access  Public
router.get('/active', electionController.getActiveElections);

// @route   GET api/elections/upcoming
// @desc    Get upcoming elections
// @access  Public
router.get('/upcoming', electionController.getUpcomingElections);

// @route   GET api/elections/completed
// @desc    Get completed elections
// @access  Public
router.get('/completed', electionController.getCompletedElections);

// @route   GET api/elections/:id
// @desc    Get election by ID
// @access  Public
router.get('/:id', electionController.getElectionById);

// @route   GET api/elections/:id/positions
// @desc    Get positions for an election
// @access  Public
router.get('/:id/positions', electionController.getElectionPositions);

// @route   GET api/elections/:id/results
// @desc    Get election results
// @access  Public (but only if election is completed)
router.get('/:id/results', electionController.getElectionResults);

// POST Routes
// @route   POST api/elections
// @desc    Create a new election
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('startDate', 'Start date is required').isISO8601(),
      check('endDate', 'End date is required').isISO8601(),
      check('positions', 'At least one position is required').isArray({ min: 1 }),
      check('positions.*.title', 'Position title is required').not().isEmpty()
    ]
  ],
  electionController.createElectionWithPositions
);

// PUT Routes
// @route   PUT api/elections/:id
// @desc    Update an election
// @access  Private (Admin only)
router.put('/:id', auth, electionController.updateElection);

// DELETE Routes
// @route   DELETE api/elections/:id
// @desc    Delete an election
// @access  Private (Admin only)
router.delete('/:id', auth, electionController.deleteElection);

module.exports = router;