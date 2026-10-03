const mongoose = require('mongoose');

/**
 * Deterministically generates a conversation key between any two user ObjectIds
 * Regardless of who sends, userA + userB produces identical key
 */
const getConversationKey = (userAId, userBId) => {
  const a = String(userAId);
  const b = String(userBId);
  return a < b ? `${a}_${b}` : `${b}_${a}`;
};

const messageSchema = new mongoose.Schema(
  {
    conversationKey: {
      type: String,
      required: [true, 'Conversation key is required'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender reference is required'],
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver reference is required'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['sent', 'delivered', 'read'],
        message: '{VALUE} is not a valid message status',
      },
      default: 'sent',
    },
  },
  {
    timestamps: true,
  }
);

// High performance index for retrieving message history chronologically
messageSchema.index({ conversationKey: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = {
  Message,
  getConversationKey,
};
