const mongoose = require('mongoose');
const Election = require('../models/Election');
const Position = require('../models/Position');
const Candidate = require('../models/Candidate');
require('dotenv').config();

const setupElection = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Get the first active election
    const election = await Election.findOne({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      status: 'active'
    });

    if (!election) {
      console.log('No active election found');
      process.exit(1);
    }

    console.log(`Found election: ${election.title}`);

    // Define positions
    const positionData = [
      {
        name: 'President',
        description: 'Lead the student council and represent the student body',
        maxCandidates: 3
      },
      {
        name: 'Vice President',
        description: 'Assist the president and lead specific initiatives',
        maxCandidates: 3
      },
      {
        name: 'Secretary',
        description: 'Manage records and communications',
        maxCandidates: 2
      },
      {
        name: 'Treasurer',
        description: 'Manage the council budget and financial records',
        maxCandidates: 2
      }
    ];

    // Create positions if they don't exist
    const positions = [];
    for (const pos of positionData) {
      let position = await Position.findOne({ 
        name: pos.name,
        election: election._id
      });

      if (!position) {
        position = await Position.create({
          ...pos,
          election: election._id
        });
        console.log(`Created position: ${position.name}`);
      } else {
        console.log(`Position already exists: ${position.name}`);
      }
      positions.push(position);
    }

    // Update election with position references
    election.positions = positions.map(p => p._id);
    await election.save();

    // Check if candidates exist
    const existingCandidates = await Candidate.find({ election: election._id });
    
    if (existingCandidates.length > 0) {
      console.log(`${existingCandidates.length} candidates already exist for this election`);
      process.exit(0);
    }

    // Create candidates for each position
    const departments = ['CCS', 'CEA', 'CBA', 'CEDU', 'CACS'];
    const candidatePromises = positions.flatMap(position => {
      const numCandidates = position.maxCandidates;
      
      return Array.from({ length: numCandidates }, (_, index) => {
        const dept = departments[Math.floor(Math.random() * departments.length)];
        return Candidate.create({
          name: `${dept} Candidate ${index + 1}`,
          department: dept,
          election: election._id,
          position: position._id,
          platform: `As a candidate from ${dept}, I promise to represent all students and work towards improving campus life.`
        });
      });
    });

    const candidates = await Promise.all(candidatePromises);
    console.log(`Created ${candidates.length} candidates`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

setupElection();
