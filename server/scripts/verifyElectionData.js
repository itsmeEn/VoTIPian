require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Election = require('../models/Election');
const Position = require('../models/Position');
const Candidate = require('../models/Candidate');

async function verifyElectionData(electionId) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Get the election with positions
    const election = await Election.findById(electionId)
      .populate('positions')
      .lean();

    if (!election) {
      console.log('Election not found');
      process.exit(1);
    }

    console.log('\nElection Details:');
    console.log('----------------');
    console.log('Title:', election.title);
    console.log('Status:', election.status);
    console.log('Start Date:', election.startDate);
    console.log('End Date:', election.endDate);
    console.log('Number of Positions:', election.positions.length);

    // Get all candidates for this election
    const candidates = await Candidate.find({ election: electionId }).lean();
    console.log('Total Candidates:', candidates.length);

    // Check each position
    console.log('\nPosition Details:');
    console.log('----------------');
    for (const position of election.positions) {
      const positionCandidates = candidates.filter(
        c => c.position.toString() === position._id.toString()
      );

      console.log(`\nPosition: ${position.name}`);
      console.log('Position ID:', position._id);
      console.log('Number of Candidates:', positionCandidates.length);
      
      if (positionCandidates.length === 0) {
        console.log('WARNING: No candidates found for this position');
      } else {
        console.log('Candidates:');
        positionCandidates.forEach(candidate => {
          console.log(`- ${candidate.name} (${candidate.department})`);
        });
      }
    }

    // Check for orphaned candidates (candidates with invalid position IDs)
    const orphanedCandidates = candidates.filter(candidate => 
      !election.positions.some(position => 
        position._id.toString() === candidate.position.toString()
      )
    );

    if (orphanedCandidates.length > 0) {
      console.log('\nWARNING: Found orphaned candidates:');
      orphanedCandidates.forEach(candidate => {
        console.log(`- ${candidate.name} (Position ID: ${candidate.position})`);
      });
    }

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

verifyElectionData(electionId);
