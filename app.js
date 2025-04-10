const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileNodeRoutes = require('./routes/fileNode.routes.js');
const uploadRoutes = require('./routes/upload.routes.js');
const errorHandler = require('./middlewares/error.middleware.js');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/files', fileNodeRoutes);  // All file/folder operations
app.use('/api/files', uploadRoutes);    // Upload/download operations

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

module.exports = app;