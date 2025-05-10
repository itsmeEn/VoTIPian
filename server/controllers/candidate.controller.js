const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Position = require('../models/Position');
const { validationResult } = require('express-validator');

// @route   GET api/candidates
// @desc    Get all candidates
// @access  Public
exports.getAllCandidates = async (req, res) => {
  try {
    const filter = {};
    
    // Filter by election if provided
    if (req.query.election) {
      filter.election = req.query.election;
    }
    
    // Filter by position if provided
    if (req.query.position) {
      filter.position = req.query.position;
    }
    
    const candidates = await Candidate.find(filter)
      .populate('election', 'title startDate endDate')
      .populate('position', 'title')
      .sort({ 'election.startDate': -1, 'position.title': 1 });
    
    res.json(candidates);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET api/candidates/:id
// @desc    Get candidate by ID
// @access  Public
exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('election', 'title startDate endDate')
      .populate('position', 'title');
    
    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found' });
    }
    
    res.json(candidate);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Candidate not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST api/candidates
// @desc    Create a new candidate
// @access  Private (Admin only)
exports.createCandidate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, department, election: electionId, position: positionId, platform } = req.body;

  try {
    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    // Check if position exists and belongs to the election
    const position = await Position.findOne({ 
      _id: positionId,
      election: electionId
    });
    
    if (!position) {
      return res.status(404).json({ msg: 'Position not found in this election' });
    }
    
    // Create new candidate
    const newCandidate = new Candidate({
      name,
      department,
      election: electionId,
      position: positionId,
      platform
    });

    const candidate = await newCandidate.save();
    
    res.json(candidate);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   PUT api/candidates/:id
// @desc    Update candidate
// @access  Private (Admin only)
exports.updateCandidate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found' });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const { name, department, position: positionId, platform } = req.body;
    
    // Check if position exists and belongs to the election
    if (positionId) {
      const position = await Position.findOne({ 
        _id: positionId,
        election: candidate.election
      });
      
      if (!position) {
        return res.status(404).json({ msg: 'Position not found in this election' });
      }
    }
    
    // Update fields
    const updateFields = {};
    for (const [key, value] of Object.entries({ name, department, position: positionId, platform })) {
      if (value !== undefined) {
        updateFields[key] = value;
      }
    }
    
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('election', 'title startDate endDate')
     .populate('position', 'title');

    res.json(updatedCandidate);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Candidate not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   DELETE api/candidates/:id
// @desc    Delete candidate
// @access  Private (Admin only)
exports.deleteCandidate = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found' });
    }
    
    await candidate.remove();
    
    res.json({ msg: 'Candidate deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Candidate not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET api/elections/:electionId/candidates
// @desc    Get candidates by election
// @access  Public
exports.getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ 
      election: req.params.electionId 
    })
    .populate('election', 'title startDate endDate')
    .populate('position', 'title')
    .sort({ 'position.title': 1 });
    
    res.json(candidates);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};