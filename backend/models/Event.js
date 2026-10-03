const mongoose = require('mongoose');

const EVENT_TYPES = [
  'Workshop',
  'Seminar',
  'Hackathon',
  'Cultural',
  'Sports',
  'Technical',
  'Other',
];

const EVENT_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide the event title'],
      trim: true,
      maxlength: [150, 'Event title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide the event description'],
      trim: true,
    },
    eventType: {
      type: String,
      required: [true, 'Please specify the event type'],
      enum: {
        values: EVENT_TYPES,
        message: '{VALUE} is not a valid event type',
      },
      index: true,
    },
    venue: {
      type: String,
      required: [true, 'Please specify the event venue or room'],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Please provide the event date'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Please specify the start time (e.g. 10:00 AM)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'Please specify the end time (e.g. 01:00 PM)'],
      trim: true,
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Please provide the registration deadline'],
      index: true,
    },
    organizer: {
      type: String,
      required: [true, 'Please provide the event organizer name or club'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: 'General',
      index: true,
    },
    capacity: {
      type: Number,
      default: 0, // 0 indicates unlimited capacity
      min: [0, 'Capacity cannot be negative'],
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: EVENT_STATUSES,
        message: '{VALUE} is not a valid status',
      },
      default: 'upcoming',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event creator reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual helper to check if event is active for registration
eventSchema.methods.isOpenForRegistration = function () {
  const now = new Date();
  if (this.status === 'cancelled' || this.status === 'completed') {
    return false;
  }
  if (new Date(this.registrationDeadline) < now) {
    return false;
  }
  return true;
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
