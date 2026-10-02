const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json());

// CORS configuration for mobile Expo and local client development
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint (Section 5 & 27)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CampusHub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[CampusHub Server]: Running on http://localhost:${PORT}`);
      console.log(`[CampusHub Health Check]: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[CampusHub Server Launch Failed]:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
