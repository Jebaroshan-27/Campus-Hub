const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Connection = require('../models/Connection');
const { getConversationKey } = require('../models/Message');

/**
 * Configure and initialize Socket.IO server with JWT authentication and deterministic conversation rooms
 * @param {import('socket.io').Server} io
 */
const initChatSocket = (io) => {
  // 1. JWT Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization;

      if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      if (!token) {
        return next(new Error('Authentication error: Missing token.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User no longer exists.'));
      }

      // Attach verified user to socket
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token.'));
    }
  });

  // 2. Connection handler
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Auto-join personal user room for targeted notifications/events
    socket.join(`user:${userId}`);

    // Join conversation room
    socket.on('join_conversation', async (data) => {
      try {
        const { partnerId } = data || {};
        if (!partnerId) return;

        // Verify accepted connection between authenticated user and partner
        const connection = await Connection.findBetween(socket.user._id, partnerId);

        if (!connection || connection.status !== 'accepted') {
          socket.emit('error_message', {
            message: 'Cannot join room: Active connection required.',
          });
          return;
        }

        const conversationKey = getConversationKey(socket.user._id, partnerId);
        const room = `conversation:${conversationKey}`;

        socket.join(room);
        socket.emit('joined_conversation', { conversationKey, room });
      } catch (err) {
        socket.emit('error_message', { message: 'Failed to join conversation room.' });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (data) => {
      try {
        const { partnerId } = data || {};
        if (!partnerId) return;

        const conversationKey = getConversationKey(socket.user._id, partnerId);
        socket.leave(`conversation:${conversationKey}`);
      } catch (err) {
        // Silently handle leave errors
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      // Clean up connection without crashing
    });
  });
};

module.exports = {
  initChatSocket,
};
