const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config();

async function startServer() {
  try {
    console.log('Starting Votipian server...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    // Initialize express app
    const app = express();

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');

    // Middleware
    app.use(cors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 200
    }));
    app.use(express.json());
    app.use(morgan('dev'));

    // Add this route before other route definitions
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to Votipian API' });
    });

    // Define Routes
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/users', require('./routes/user.routes'));
    app.use('/api/elections', require('./routes/election.routes'));
    app.use('/api/admin', require('./routes/admin.routes'));
    app.use('/api/candidates', require('./routes/candidate.routes'));
    app.use('/api/discussions', require('./routes/discussion.routes'));
    app.use('/api/votes', require('./routes/vote.routes'));

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
      // Set static folder
      app.use(express.static('client/build'));

      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
      });
    }

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Server is ready to accept connections');
    });

    // Handle server errors
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled rejection:', err);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception:', err);
      server.close(() => process.exit(1));
    });

  } catch (err) {
    console.error('Failed to start server:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    process.exit(1);
  }
}

// Start the server
startServer().catch(err => {
  console.error('Unhandled error during server startup:', err);
  process.exit(1);
});
