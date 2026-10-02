const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    department: {
      type: String,
      required: [true, 'Please select a department'],
      trim: true,
      index: true,
    },
    year: {
      type: String,
      required: [true, 'Please select an academic year'],
      trim: true,
      index: true,
    },
    semester: {
      type: String,
      required: [true, 'Please select a semester'],
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Please specify the subject name or code'],
      trim: true,
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by user ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for high-performance search across title, subject, and description
noteSchema.index({ title: 'text', subject: 'text', description: 'text' });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
