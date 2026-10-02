const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Please provide the company name'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Please provide the job title / role'],
      trim: true,
      maxlength: [120, 'Job title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide the job description'],
      trim: true,
      maxlength: [4000, 'Description cannot exceed 4000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please specify the job location'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    workMode: {
      type: String,
      enum: {
        values: ['On-site', 'Hybrid', 'Remote'],
        message: '{VALUE} is not a valid work mode. Choose On-site, Hybrid, or Remote.',
      },
      default: 'On-site',
    },
    salary: {
      type: String,
      required: [true, 'Please provide the compensation / salary package'],
      trim: true,
      maxlength: [80, 'Salary package cannot exceed 80 characters'],
    },
    eligibility: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Eligibility notes cannot exceed 1000 characters'],
    },
    minimumCGPA: {
      type: Number,
      default: 0,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
    },
    eligibleDepartments: {
      type: [String],
      default: [],
    },
    eligibleYears: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Please provide the application deadline date'],
    },
    applicationUrl: {
      type: String,
      required: [true, 'Please provide the external application URL'],
      trim: true,
      match: [
        /^https?:\/\/.+/i,
        'Please provide a valid application URL starting with http:// or https://',
      ],
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'closed'],
        message: '{VALUE} is not a valid status. Choose open or closed.',
      },
      default: 'open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin creator ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for search performance across company name, job title, and description
placementSchema.index({ companyName: 'text', jobTitle: 'text', description: 'text' });
placementSchema.index({ status: 1, applicationDeadline: 1 });

// Helper to determine active status taking deadline into account
placementSchema.methods.getEffectiveStatus = function () {
  if (this.status === 'closed') return 'closed';
  if (this.applicationDeadline && new Date(this.applicationDeadline) < new Date()) {
    return 'closed';
  }
  return 'open';
};

const Placement = mongoose.model('Placement', placementSchema);

module.exports = Placement;
