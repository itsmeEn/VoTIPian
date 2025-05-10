const mongoose = require('mongoose');
const Election = require('../models/Election');
require('dotenv').config();

const checkElection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    const now = new Date();
    
    // Get all elections
    const elections = await Election.find();
    console.log('All elections:', elections);

    // Find active election
    const activeElection = await Election.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: 'active'
    });

    if (activeElection) {
      console.log('Found active election:', activeElection);
    } else {
      console.log('No active election found');
      
      // Get the most recent election
      const latestElection = await Election.findOne().sort({ startDate: -1 });
      console.log('Latest election:', latestElection);

      if (latestElection) {
        // Update it to be active and current
        latestElection.status = 'active';
        latestElection.startDate = new Date();
        latestElection.endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        await latestElection.save();
        console.log('Updated election to be active:', latestElection);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkElection();
