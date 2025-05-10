const mongoose = require('mongoose');
const Election = require('../models/Election');
const Position = require('../models/Position');
const Candidate = require('../models/Candidate');
require('dotenv').config();

const checkCandidates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Get all active elections
    const elections = await Election.find({
      status: 'active'
    }).populate('positions');

    console.log('\nActive Elections:');
    for (const election of elections) {
      console.log(`\nElection: ${election.title}`);
      console.log('Positions:', election.positions.map(p => p.name));

      // Get candidates for this election
      const candidates = await Candidate.find({ election: election._id });
      console.log('Candidates:', candidates.map(c => ({
        name: c.name,
        position: c.position,
        department: c.department
      })));

      // Check candidates per position
      for (const position of election.positions) {
        const positionCandidates = candidates.filter(
          c => c.position.toString() === position._id.toString()
        );
        console.log(`\nPosition "${position.name}" has ${positionCandidates.length} candidates:`,
          positionCandidates.map(c => c.name));
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCandidates();
