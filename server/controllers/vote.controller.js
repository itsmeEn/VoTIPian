const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @route   POST api/votes
// @desc    Cast a vote
// @access  Private
exports.castVote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  const { electionId, selections } = req.body;

  try {
    // Validate electionId
    if (!electionId || !mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ msg: 'Invalid election ID' });
    }

    // Check if election exists and is active
    const election = await Election.findById(electionId).populate('positions');
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }
    
    const now = new Date();
    if (now < election.startDate) {
      return res.status(400).json({ msg: 'Voting has not started yet' });
    }
    if (now > election.endDate) {
      return res.status(400).json({ msg: 'Voting has ended' });
    }
    if (election.status !== 'active') {
      return res.status(400).json({ msg: 'Election is not active' });
    }
    
    // Check if user has already voted in this election
    const existingVote = await Vote.findOne({
      voter: req.user.id,
      election: electionId
    });
    
    if (existingVote) {
      return res.status(400).json({ msg: 'You have already voted in this election' });
    }
    
    // Validate selections
    if (!Array.isArray(selections)) {
      return res.status(400).json({ msg: 'Invalid selections format' });
    }

    // Check that all positions have selections
    const validSelections = [];
    for (const position of election.positions) {
      const selection = selections.find(s => s.positionId === position._id.toString());
      if (!selection) {
        return res.status(400).json({ msg: `Missing selection for position: ${position.name}` });
      }

      // Verify candidate exists and belongs to this position
      const candidate = await Candidate.findOne({
        _id: selection.candidateId,
        position: position._id,
        election: electionId
      });
      
      if (!candidate) {
        return res.status(400).json({ msg: `Invalid candidate for position: ${position.name}` });
      }
      
      validSelections.push({
        position: position._id,
        candidate: candidate._id
      });
    }
    
    // Create new vote
    const newVote = new Vote({
      voter: req.user.id,
      election: electionId,
      selections: validSelections,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await newVote.save();
    
    // Increment vote counts for each candidate
    for (const selection of validSelections) {
      await Candidate.findByIdAndUpdate(
        selection.candidate,
        { $inc: { voteCount: 1 } }
      );
    }
    
    res.json({ msg: 'Vote cast successfully' });
  } catch (err) {
    console.error('Error casting vote:', err.message);
    res.status(500).json({ msg: 'Server error casting vote' });
  }
};

// @route   GET api/votes/check/:electionId
// @desc    Check if user has voted in an election
// @access  Private
exports.checkVoteStatus = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Validate electionId
    if (!electionId || !mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ msg: 'Invalid election ID' });
    }

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    const vote = await Vote.findOne({
      voter: req.user.id,
      election: electionId
    });
    
    res.json({
      hasVoted: !!vote,
      timestamp: vote ? vote.timestamp : null
    });
  } catch (err) {
    console.error('Error checking vote status:', err.message);
    res.status(500).json({ msg: 'Server error checking vote status' });
  }
};

// @route   GET api/votes/stats/:electionId
// @desc    Get voting statistics for an election
// @access  Private (Admin only)
exports.getVotingStats = async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized to view voting statistics' });
  }

  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }
    
    // Get total votes
    const totalVotes = await Vote.countDocuments({ election: req.params.electionId });
    
    // Get votes by department
    const votesByDepartment = await Vote.aggregate([
      { $match: { election: req.params.electionId } },
      {
        $lookup: {
          from: 'users',
          localField: 'voter',
          foreignField: '_id',
          as: 'voterInfo'
        }
      },
      { $unwind: '$voterInfo' },
      {
        $group: {
          _id: '$voterInfo.department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get votes over time (by day)
    const votesOverTime = await Vote.aggregate([
      { $match: { election: req.params.electionId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalVotes,
      votesByDepartment,
      votesOverTime
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};