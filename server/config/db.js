const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('Attempting to connect to MongoDB at:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('MongoDB Connected and responding to ping...');
  } catch (err) {
    console.error('MongoDB connection error:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });
    throw err; // Let the caller handle the error
  }
};

module.exports = connectDB;