const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @route   GET api/elections
// @desc    Get all elections
// @access  Public
exports.getAllElections = async (req, res) => {
  try {
    console.log('Fetching elections with query:', req.query);
    const { status } = req.query;
    const now = new Date();
    
    let query = {};
    
    if (status) {
      switch (status) {
        case 'active':
          query = {
            startDate: { $lte: now },
            endDate: { $gte: now }
          };
          break;
        case 'upcoming':
          query = {
            startDate: { $gt: now }
          };
          break;
        case 'completed':
          query = {
            endDate: { $lt: now }
          };
          break;
      }
    }
    
    const elections = await Election.find(query)
      .populate('positions')
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: -1 });
    
    console.log(`Found ${elections.length} elections`);
    if (elections.length > 0) {
      console.log('Sample election:', {
        id: elections[0]._id,
        title: elections[0].title,
        positions: elections[0].positions?.length || 0
      });
    }
    
    res.json(elections);
  } catch (err) {
    console.error('Error getting all elections:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ msg: 'Server error getting elections', error: err.message });
  }
};

// @route   GET api/elections/active
// @desc    Get active elections
// @access  Public
exports.getActiveElections = async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: 'active'
    })
    .sort({ endDate: 1 })
    .populate('createdBy', 'firstName lastName')
    .populate('positions');
    
    res.json(elections);
  } catch (err) {
    console.error('Error getting active elections:', err.message);
    res.status(500).json({ msg: 'Server error getting active elections' });
  }
};

// @route   GET api/elections/:id/positions
// @desc    Get positions for an election
// @access  Public
exports.getElectionPositions = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate({
        path: 'positions',
        select: 'name description maxCandidates'
      });
    
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }
    
    res.json(election.positions || []);
  } catch (err) {
    console.error('Error getting election positions:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Election not found' });
    }
    res.status(500).json({ msg: 'Server error getting election positions' });
  }
};

// @route   GET api/elections/:id
// @desc    Get election by ID with positions and candidates
// @access  Public
exports.getElectionById = async (req, res) => {
  try {
    console.log('Getting election with ID:', req.params.id);
    
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid election ID format:', req.params.id);
      return res.status(400).json({ msg: 'Invalid election ID format' });
    }

    // Get the election with positions populated
    const election = await Election.findById(req.params.id)
      .populate({
        path: 'positions',
        select: 'name description maxCandidates'
      })
      .populate('createdBy', 'firstName lastName');

    if (!election) {
      console.log('No election found with ID:', req.params.id);
      return res.status(404).json({ msg: 'Election not found' });
    }

    console.log('Found election:', {
      id: election._id,
      title: election.title,
      positions: election.positions?.map(p => ({
        id: p._id,
        name: p.name
      })) || []
    });

    // Get all candidates for this election
    const candidates = await Candidate.find({ election: req.params.id })
      .select('name department position platform')
      .lean();

    console.log('Found candidates:', candidates.map(c => ({
      id: c._id,
      name: c.name,
      position: c.position
    })));

    // Initialize candidates array even if none are found
    if (!candidates) {
      console.log('No candidates found for election:', req.params.id);
      candidates = [];
    }

    console.log('Total candidates found:', candidates.length);

    // Create a map of position IDs to candidates
    const positionCandidatesMap = new Map();
    if (candidates.length > 0) {
      candidates.forEach(candidate => {
        const positionId = candidate.position.toString();
        console.log('Mapping candidate to position:', {
          candidateName: candidate.name,
          candidateId: candidate._id,
          positionId: positionId
        });
        
        if (!positionCandidatesMap.has(positionId)) {
          positionCandidatesMap.set(positionId, []);
        }
        positionCandidatesMap.get(positionId).push(candidate);
      });
    }

    console.log('Position-Candidate map created. Positions with candidates:', 
      Array.from(positionCandidatesMap.entries()).map(([posId, candidates]) => ({
        positionId: posId,
        candidateCount: candidates.length,
        candidates: candidates.map(c => c.name)
      })));

    // Check if any position has no candidates
    const positionsWithoutCandidates = election.positions.filter(position => {
      const positionId = position._id.toString();
      const hasCandidates = positionCandidatesMap.has(positionId) && 
        positionCandidatesMap.get(positionId).length > 0;
      
      console.log('Checking position:', {
        name: position.name,
        id: positionId,
        hasCandidates,
        candidateCount: positionCandidatesMap.get(positionId)?.length || 0
      });
      
      return !hasCandidates;
    });

    if (positionsWithoutCandidates.length > 0) {
      console.log('Positions without candidates:', 
        positionsWithoutCandidates.map(p => p.name));
      return res.status(400).json({ 
        msg: 'Some positions do not have any candidates',
        positions: positionsWithoutCandidates.map(p => p.name)
      });
    }

    // Attach candidates to their positions
    const electionData = election.toObject();
    electionData.positions = election.positions.map(position => {
      const positionObj = position.toObject();
      return {
        ...positionObj,
        candidates: positionCandidatesMap.get(position._id.toString()) || []
      };
    });

    console.log('Sending election data with positions and candidates:', {
      id: electionData._id,
      title: electionData.title,
      positions: electionData.positions.map(p => ({
        name: p.name,
        candidateCount: p.candidates.length
      }))
    });

    return res.json(electionData);
  } catch (err) {
    console.error('Error getting election by ID:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Election not found' });
    }
    res.status(500).json({ msg: 'Server error getting election' });
  }
};

// @route   GET api/elections/upcoming
// @desc    Get upcoming elections
// @access  Public
exports.getUpcomingElections = async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      startDate: { $gt: now },
      status: 'active'
    })
    .sort({ startDate: 1 })
    .populate('createdBy', 'firstName lastName')
    .populate('positions');
    
    res.json(elections);
  } catch (err) {
    console.error('Error getting upcoming elections:', err.message);
    res.status(500).json({ msg: 'Server error getting upcoming elections' });
  }
};

// @route   GET api/elections/completed
// @desc    Get completed elections
// @access  Public
exports.getCompletedElections = async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      $or: [
        { endDate: { $lt: now } },
        { status: 'completed' }
      ]
    })
    .sort({ endDate: -1 })
    .populate('createdBy', 'firstName lastName')
    .populate('positions');
    
    res.json(elections);
  } catch (err) {
    console.error('Error getting completed elections:', err.message);
    res.status(500).json({ msg: 'Server error getting completed elections' });
  }
};

// @route   POST api/elections
// @desc    Create a new election
// @access  Private (Admin only)
exports.createElection = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized to create elections' });
  }

  const { 
    title, 
    description, 
    startDate, 
    endDate, 
    status,
    positions 
  } = req.body;

  try {
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime())) {
      return res.status(400).json({ msg: 'Invalid start date format' });
    }
    if (isNaN(end.getTime())) {
      return res.status(400).json({ msg: 'Invalid end date format' });
    }
    if (end <= start) {
      return res.status(400).json({ msg: 'End date must be after start date' });
    }

    // Create election
    const newElection = new Election({
      title,
      description,
      startDate,
      endDate,
      status: status || 'active',
      positions: positions.map(pos => ({
        title: pos.title,
        description: pos.description || ''
      })),
      createdBy: req.user.id
    });

    const election = await newElection.save();
    
    // Populate createdBy and positions
    await election.populate('createdBy', 'firstName lastName');
    
    res.json(election);
  } catch (err) {
    console.error('Error creating election:', err.message);
    res.status(500).json({ msg: 'Server error creating election' });
  }
};

// @route   PUT api/elections/:id
// @desc    Update an election
// @access  Private (Admin only)
exports.updateElection = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized to update elections' });
  }

  try {
    const { id } = req.params;

    // Validate election ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid election ID' });
    }

    let election = await Election.findById(id);
    
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    // Check if election has votes and prevent certain updates
    const hasVotes = await Vote.exists({ election: id });
    if (hasVotes) {
      // Don't allow changing positions if votes exist
      if (req.body.positions) {
        return res.status(400).json({ 
          msg: 'Cannot modify positions after voting has started' 
        });
      }
    }

    // Update fields
    const updateFields = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (value !== undefined) {
        updateFields[key] = value;
      }
    }

    // Validate dates
    if (updateFields.startDate) {
      const start = new Date(updateFields.startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ msg: 'Invalid start date format' });
      }
    }
    if (updateFields.endDate) {
      const end = new Date(updateFields.endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ msg: 'Invalid end date format' });
      }
    }
    if (updateFields.startDate && updateFields.endDate) {
      const start = new Date(updateFields.startDate);
      const end = new Date(updateFields.endDate);
      if (end <= start) {
        return res.status(400).json({ msg: 'End date must be after start date' });
      }
    }

    election = await Election.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    // Populate createdBy and positions
    await election.populate('createdBy', 'firstName lastName');
    
    res.json(election);
  } catch (err) {
    console.error('Error updating election:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Election not found' });
    }
    res.status(500).json({ msg: 'Server error updating election' });
  }
};

// @route   DELETE api/elections/:id
// @desc    Delete an election
// @access  Private (Admin only)
exports.deleteElection = async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized to delete elections' });
  }

  try {
    const { id } = req.params;

    // Validate election ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid election ID' });
    }

    const election = await Election.findById(id);
    
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    // Check if election has votes
    const hasVotes = await Vote.exists({ election: id });
    if (hasVotes) {
      return res.status(400).json({ 
        msg: 'Cannot delete an election that has votes' 
      });
    }

    // Delete associated candidates
    await Candidate.deleteMany({ election: id });
    
    // Delete the election
    await election.remove();
    
    res.json({ msg: 'Election deleted' });
  } catch (err) {
    console.error('Error deleting election:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Election not found' });
    }
    res.status(500).json({ msg: 'Server error deleting election' });
  }
};

// @route   POST api/elections
// @desc    Create a new election
// @access  Private (Admin only)
exports.createElectionWithPositions = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { positions, ...electionData } = req.body;
    
    // Create the election first without positions
    const newElection = new Election({
      ...electionData,
      createdBy: req.user.id,
      positions: [] // Initialize empty positions array
    });

    // Save the election
    const savedElection = await newElection.save();

    // Create Position documents for each position
    const Position = require('../models/Position');
    const positionPromises = positions.map(async (pos) => {
      // Map title to name for consistency
      const newPosition = new Position({
        name: pos.title || pos.name,
        description: pos.description,
        election: savedElection._id,
        maxCandidates: pos.maxCandidates || 1
      });
      console.log('Creating position:', newPosition);
      return newPosition.save();
    });

    // Wait for all positions to be created
    const savedPositions = await Promise.all(positionPromises);

    // Update election with position references
    savedElection.positions = savedPositions.map(pos => pos._id);
    await savedElection.save();

    // Return the election with populated positions
    const populatedElection = await Election.findById(savedElection._id)
      .populate({
        path: 'positions',
        select: 'name description maxCandidates'
      });

    res.json(populatedElection);
  } catch (err) {
    console.error('Error creating election:', err.message);
    res.status(500).json({ msg: 'Server error creating election' });
  }
};

// @route   GET api/elections/:id/results
// @desc    Get election results
// @access  Public (but only if election is completed)
exports.getElectionResults = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate election ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid election ID' });
    }

    const election = await Election.findById(id).populate('positions');
    
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    // Only show results if election is completed or user is admin
    const now = new Date();
    const isCompleted = election.status === 'completed' || new Date(election.endDate) < now;
    const isAdmin = req.user && req.user.role === 'admin';
    
    console.log('Election status check:', {
      electionId: election._id,
      status: election.status,
      endDate: election.endDate,
      now: now,
      isCompleted: isCompleted,
      isAdmin: isAdmin
    });

    if (!isCompleted && !isAdmin) {
      return res.status(403).json({ 
        msg: 'Results are not available until the election is completed' 
      });
    }

    console.log('Fetching candidates for election:', id);

    // Get all votes for this election
    const votes = await Vote.find({ election: id }).populate('selections.candidate');
    console.log('Found votes:', {
      electionId: id,
      voteCount: votes.length
    });

    // Calculate vote counts for each candidate
    const voteCounts = new Map();
    votes.forEach(vote => {
      vote.selections.forEach(selection => {
        const candidateId = selection.candidate._id.toString();
        voteCounts.set(candidateId, (voteCounts.get(candidateId) || 0) + 1);
      });
    });

    // Get candidates with vote counts
    const candidates = await Candidate.find({ election: id })
      .populate('position')
      .select('name department position platform');

    // Update candidates with their vote counts
    const candidatesWithVotes = candidates.map(candidate => ({
      ...candidate.toObject(),
      voteCount: voteCounts.get(candidate._id.toString()) || 0
    }));

    console.log('Candidates with votes:', {
      electionId: id,
      candidateCount: candidates.length,
      candidates: candidatesWithVotes.map(c => ({
        id: c._id,
        name: c.name,
        position: c.position ? {
          id: c.position._id,
          name: c.position.name
        } : null,
        voteCount: c.voteCount
      }))
    });

    // Organize results by position
    const results = {};
    
    if (!election.positions || election.positions.length === 0) {
      console.log('No positions found for election:', id);
      return res.status(404).json({ msg: 'No positions found for this election' });
    }

    election.positions.forEach(position => {
      if (position && position._id) {
        const positionCandidates = candidatesWithVotes.filter(candidate => 
          candidate.position && 
          candidate.position._id && 
          candidate.position._id.toString() === position._id.toString()
        );

        results[position.name] = positionCandidates.map(candidate => ({
          name: candidate.name,
          department: candidate.department,
          voteCount: candidate.voteCount,
          platform: candidate.platform
        })).sort((a, b) => b.voteCount - a.voteCount);
      }
    });

    console.log('Results by position:', {
      positions: Object.entries(results).map(([position, candidates]) => ({
        position,
        candidates: candidates.map(c => ({ name: c.name, voteCount: c.voteCount }))
      }))
    });

    // Format results for frontend
    const formattedResults = {
      totalVotes: votes.length,
      positions: election.positions.map(position => {
        const positionCandidates = results[position.name] || [];
        const totalVotesForPosition = positionCandidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
        
        // Find the winner (candidate with most votes)
        const winner = positionCandidates.length > 0 
          ? positionCandidates.reduce((max, curr) => curr.voteCount > max.voteCount ? curr : max, positionCandidates[0])
          : null;

        return {
          _id: position._id,
          name: position.name,
          totalVotes: totalVotesForPosition,
          candidates: positionCandidates.map(candidate => ({
            _id: candidate._id,
            name: candidate.name,
            voteCount: candidate.voteCount || 0,
            department: candidate.department,
            platform: candidate.platform
          })),
          winner: winner ? {
            _id: winner._id,
            name: winner.name,
            voteCount: winner.voteCount
          } : null
        };
      })
    };

    // Check if we have any results
    const hasResults = formattedResults.positions.some(pos => pos.candidates.length > 0);
    console.log('Results check:', {
      hasResults,
      totalVotes: formattedResults.totalVotes,
      positions: formattedResults.positions.map(p => ({
        name: p.name,
        totalVotes: p.totalVotes,
        candidates: p.candidates.map(c => ({ name: c.name, voteCount: c.voteCount }))
      }))
    });

    if (!hasResults) {
      console.log('No results found for election:', id);
      return res.status(404).json({ msg: 'No results available for this election yet' });
    }

    res.json(formattedResults);
  } catch (err) {
    console.error('Error getting election results:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Election not found' });
    }
    res.status(500).json({ msg: 'Server error getting election results' });
  }
};