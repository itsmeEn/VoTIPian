const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config();

async function startServer() {
  try {
    const app = express();

    // Connect to MongoDB
    await connectDB();

    // CORS configuration: allow your frontend only
    app.use(cors({
      origin: 'https://votipian-2.onrender.com',  // frontend domain
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],  // allow these headers
      credentials: false  // no cookies, set true if you want to use cookies
    }));

    app.use(express.json());
    app.use(morgan('dev'));

    // Example root route
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to Votipian API' });
    });

    // Your API routes
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/users', require('./routes/user.routes'));
    app.use('/api/elections', require('./routes/election.routes'));
    app.use('/api/admin', require('./routes/admin.routes'));
    app.use('/api/candidates', require('./routes/candidate.routes'));
    app.use('/api/discussions', require('./routes/discussion.routes'));
    app.use('/api/votes', require('./routes/vote.routes'));

    // Serve React build in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static('client/build'));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
      });
    }

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
