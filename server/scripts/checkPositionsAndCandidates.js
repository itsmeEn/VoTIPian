require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Election = require('../models/Election');
const Position = require('../models/Position');
const Candidate = require('../models/Candidate');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Get all active elections
    const elections = await Election.find({ status: 'active' });
    
    for (const election of elections) {
      console.log(`\nElection: ${election.title} (${election._id})`);
      
      // Get positions for this election
      const positions = await Position.find({ election: election._id });
      console.log(`Positions (${positions.length}):`);
      
      for (const position of positions) {
        console.log(`\n  Position: ${position.name} (${position._id})`);
        
        // Get candidates for this position
        const candidates = await Candidate.find({ 
          election: election._id,
          position: position._id
        });
        
        console.log('  Candidates:');
        candidates.forEach(candidate => {
          console.log(`    - ${candidate.name} (${candidate.department})`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
