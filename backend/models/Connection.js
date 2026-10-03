const mongoose = require('mongoose');

const CONNECTION_STATUSES = ['pending', 'accepted', 'rejected', 'blocked'];

const connectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester user reference is required'],
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver user reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: CONNECTION_STATUSES,
        message: '{VALUE} is not a valid connection status',
      },
      default: 'pending',
      index: true,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to rapidly lookup connections between any two users
connectionSchema.index({ requester: 1, receiver: 1 });
connectionSchema.index({ receiver: 1, requester: 1 });
connectionSchema.index({ status: 1, requester: 1 });
connectionSchema.index({ status: 1, receiver: 1 });

/**
 * Helper to find existing connection between two users in either direction
 */
connectionSchema.statics.findBetween = function (userAId, userBId) {
  return this.findOne({
    $or: [
      { requester: userAId, receiver: userBId },
      { requester: userBId, receiver: userAId },
    ],
  });
};

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;
