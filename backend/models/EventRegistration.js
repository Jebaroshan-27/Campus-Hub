const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    registrationStatus: {
      type: String,
      enum: {
        values: ['registered', 'cancelled'],
        message: '{VALUE} is not a valid registration status',
      },
      default: 'registered',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['not_required', 'pending', 'paid', 'failed'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'not_required',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      default: null,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      default: null,
      trim: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registration for the same student and event
eventRegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

const EventRegistration = mongoose.model(
  'EventRegistration',
  eventRegistrationSchema
);

module.exports = EventRegistration;
