const mongoose = require('mongoose');
const { Message, getConversationKey } = require('../models/Message');
const Connection = require('../models/Connection');
const User = require('../models/User');

/**
 * Validates that two users have an active, accepted connection and neither is blocked.
 * @returns {Promise<{ authorized: boolean, statusCode?: number, message?: string, connection?: Object }>}
 */
const verifyChatAuthorization = async (userAId, userBId) => {
  const connection = await Connection.findBetween(userAId, userBId);

  if (!connection) {
    return {
      authorized: false,
      statusCode: 403,
      message: 'Chat is available only after the connection request is accepted.',
    };
  }

  if (connection.status === 'blocked') {
    return {
      authorized: false,
      statusCode: 403,
      message: 'Chat is unavailable because this connection is blocked.',
    };
  }

  if (connection.status !== 'accepted') {
    return {
      authorized: false,
      statusCode: 403,
      message: 'Chat is available only after the connection request is accepted.',
    };
  }

  return { authorized: true, connection };
};

/**
 * @desc    Get chat message history with a connected student
 * @route   GET /api/messages/:userId
 * @access  Private (Student only)
 */
const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user identifier.',
      });
    }

    if (req.user._id.equals(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot retrieve chat history with yourself.',
      });
    }

    // 1. Verify target student exists
    const partner = await User.findById(userId).select(
      'name registerNumber department year profileImage'
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Classmate profile not found.',
      });
    }

    // 2. Chat authorization check: accepted and not blocked
    const authCheck = await verifyChatAuthorization(req.user._id, userId);
    if (!authCheck.authorized) {
      return res.status(authCheck.statusCode).json({
        success: false,
        message: authCheck.message,
      });
    }

    // 3. Fetch message history chronologically (oldest -> newest)
    const conversationKey = getConversationKey(req.user._id, userId);
    const messages = await Message.find({ conversationKey })
      .sort({ createdAt: 1 })
      .populate('sender', 'name registerNumber profileImage')
      .populate('receiver', 'name registerNumber profileImage');

    res.status(200).json({
      success: true,
      count: messages.length,
      conversationKey,
      connectionId: authCheck.connection._id,
      partner,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message to a connected student
 * @route   POST /api/messages
 * @access  Private (Student only)
 */
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;

    // 1. Validate inputs
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid recipient user ID.',
      });
    }

    if (req.user._id.equals(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send a message to yourself.',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty or only whitespace.',
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds maximum length of 2000 characters.',
      });
    }

    // 2. Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Recipient student not found.',
      });
    }

    // 3. Verify connection is accepted and not blocked
    const authCheck = await verifyChatAuthorization(req.user._id, receiverId);
    if (!authCheck.authorized) {
      return res.status(authCheck.statusCode).json({
        success: false,
        message: authCheck.message,
      });
    }

    // 4. Save message to MongoDB first (source of truth)
    const conversationKey = getConversationKey(req.user._id, receiverId);
    const newMsg = await Message.create({
      conversationKey,
      sender: req.user._id,
      receiver: receiverId,
      message: trimmedMessage,
      status: 'sent',
    });

    const populatedMsg = await Message.findById(newMsg._id)
      .populate('sender', 'name registerNumber profileImage')
      .populate('receiver', 'name registerNumber profileImage');

    // 5. Emit real-time message via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const room = `conversation:${conversationKey}`;
      io.to(room).emit('new_message', populatedMsg);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: populatedMsg,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
  verifyChatAuthorization,
};
