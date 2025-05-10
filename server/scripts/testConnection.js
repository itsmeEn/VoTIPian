require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

console.log('MongoDB URI:', process.env.MONGODB_URI);

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB');
    
    // Test the connection by listing all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
