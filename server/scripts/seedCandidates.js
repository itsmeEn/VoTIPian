const mongoose = require('mongoose');
const Election = require('../models/Election');
const Position = require('../models/Position');
const Candidate = require('../models/Candidate');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const seedCandidates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Get all active elections
    const elections = await Election.find({
      status: 'active'
    }).populate('positions');

    console.log(`Found ${elections.length} active elections`);

    for (const election of elections) {
      console.log(`\nProcessing election: ${election.title}`);

      if (!election.positions || election.positions.length === 0) {
        console.log('No positions found for this election');
        continue;
      }

      console.log(`Found ${election.positions.length} positions`);

      // Process each position
      for (const position of election.positions) {
        console.log(`\nChecking position: ${position.name}`);
        
        // Check if this position has candidates
        const existingCandidates = await Candidate.find({ 
          election: election._id,
          position: position._id
        });

        if (existingCandidates.length > 0) {
          console.log(`Position ${position.name} already has ${existingCandidates.length} candidates`);
          continue;
        }

        console.log(`Creating candidates for position: ${position.name}`);
        
        // Create 2 candidates for this position
        const candidates = [
          {
            name: `John Smith`,
            department: 'CCS',
            election: election._id,
            position: position._id,
            platform: `Improve student services and enhance academic resources`
          },
          {
            name: `Maria Garcia`,
            department: 'CEA',
            election: election._id,
            position: position._id,
            platform: `Foster inclusive campus environment and promote student welfare`
          }
        ];

        for (const candidateData of candidates) {
          try {
            const candidate = await Candidate.create(candidateData);
            console.log(`Created candidate: ${candidate.name} for position ${position.name}`);
          } catch (err) {
            console.error(`Failed to create candidate for position ${position.name}:`, err.message);
          }
        }
      }

      // Verify candidates for this election
      const finalCandidates = await Candidate.find({ election: election._id });
      console.log(`\nTotal candidates for election ${election.title}: ${finalCandidates.length}`);
      
      // Log candidates per position
      for (const position of election.positions) {
        const positionCandidates = finalCandidates.filter(
          c => c.position.toString() === position._id.toString()
        );
        console.log(`Position ${position.name} has ${positionCandidates.length} candidates:`,
          positionCandidates.map(c => c.name));
      }
    }

    console.log('\nFinished seeding candidates');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedCandidates();
