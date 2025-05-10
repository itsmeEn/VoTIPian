require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Election = require('../models/Election');
const Position = require('../models/Position');
const Candidate = require('../models/Candidate');

async function checkPositionIds(electionId) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Get the election
    const election = await Election.findById(electionId).lean();
    if (!election) {
      console.log('Election not found');
      process.exit(1);
    }

    console.log('\nChecking election:', election.title);
    console.log('Election ID:', election._id);

    // Get positions directly from Positions collection
    const positions = await Position.find({ election: electionId }).lean();
    console.log('\nPositions in Positions collection:', positions.length);
    positions.forEach(pos => {
      console.log('Position:', {
        id: pos._id,
        name: pos.name,
        electionId: pos.election
      });
    });

    // Get positions from election.positions array
    console.log('\nPositions in election.positions:', election.positions.length);
    election.positions.forEach(posId => {
      console.log('Position ID:', posId.toString());
    });

    // Get candidates
    const candidates = await Candidate.find({ election: electionId }).lean();
    console.log('\nCandidates:', candidates.length);
    candidates.forEach(candidate => {
      console.log('Candidate:', {
        id: candidate._id,
        name: candidate.name,
        positionId: candidate.position.toString()
      });
    });

    // Check if position IDs match
    console.log('\nChecking position ID matches...');
    candidates.forEach(candidate => {
      const positionExists = positions.some(pos => 
        pos._id.toString() === candidate.position.toString()
      );
      if (!positionExists) {
        console.log('WARNING: Candidate has invalid position ID:', {
          candidateName: candidate.name,
          positionId: candidate.position.toString()
        });
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get election ID from command line argument
const electionId = process.argv[2];
if (!electionId) {
  console.log('Please provide an election ID as a command line argument');
  process.exit(1);
}

checkPositionIds(electionId);
