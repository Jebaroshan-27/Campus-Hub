const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables from .env file
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const placementRoutes = require('./routes/placementRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const testRoutes = require('./routes/testRoutes');
const { initChatSocket } = require('./sockets/chatSocket');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  pingTimeout: 60000,
});

// Attach Socket.IO to Express app instance
app.set('io', io);

// Initialize real-time chat socket handlers with JWT auth
initChatSocket(io);

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
app.use('/api/notes', noteRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', registrationRoutes);
app.use('/api/test', testRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP + WebSocket server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[CampusHub Server]: Running on http://localhost:${PORT}`);
      console.log(`[CampusHub Health Check]: http://localhost:${PORT}/api/health`);
      console.log(`[CampusHub WebSockets]: Real-time Socket.IO server active on port ${PORT}`);
    });
  } catch (err) {
    console.error('[CampusHub Server Launch Failed]:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
app.server = server;
