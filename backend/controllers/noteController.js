const mongoose = require('mongoose');
const path = require('path');
const Note = require('../models/Note');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * @desc    Upload a new note / study material
 * @route   POST /api/notes
 * @access  Private (Faculty & Admin only)
 */
const createNote = async (req, res, next) => {
  try {
    const { title, description, department, year, semester, subject } = req.body;

    // 1. Validate required text fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title for the note.',
      });
    }

    if (!department || !department.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please select a department.',
      });
    }

    if (!year || !year.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please select an academic year.',
      });
    }

    if (!semester || !semester.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please select a semester.',
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a subject name or code.',
      });
    }

    // 2. Validate uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document file (PDF, DOCX, DOC, JPG, or PNG).',
      });
    }

    // 3. Upload file buffer to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    } catch (uploadError) {
      return res.status(502).json({
        success: false,
        message: uploadError.message || 'Failed to upload document to cloud storage.',
      });
    }

    // Extract file extension and format
    const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase() || 'FILE';

    // 4. Create Note document in MongoDB
    const note = await Note.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      department: department.trim(),
      year: year.trim(),
      semester: semester.trim(),
      subject: subject.trim(),
      fileUrl: cloudinaryResult.secure_url,
      fileName: req.file.originalname,
      fileType: ext,
      cloudinaryPublicId: cloudinaryResult.public_id,
      uploadedBy: req.user._id,
    });

    // Populate uploader details for clean response
    const populatedNote = await Note.findById(note._id).populate(
      'uploadedBy',
      'name email role department registerNumber'
    );

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully and published to Notes Hub.',
      note: populatedNote,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get notes with search & filtering
 * @route   GET /api/notes
 * @access  Private (All authenticated users)
 */
const getNotes = async (req, res, next) => {
  try {
    const { search, department, year, semester, subject, myNotes, uploadedBy } = req.query;

    const filter = {};

    // Filter by department (ignore if 'All' or empty)
    if (department && department !== 'All') {
      filter.department = department;
    }

    // Filter by year
    if (year && year !== 'All') {
      filter.year = year;
    }

    // Filter by semester
    if (semester && semester !== 'All') {
      filter.semester = semester;
    }

    // Filter by subject
    if (subject && subject !== 'All') {
      filter.subject = new RegExp(subject.trim(), 'i');
    }

    // Filter by uploaded user (e.g. for faculty's own uploaded notes)
    if (myNotes === 'true') {
      filter.uploadedBy = req.user._id;
    } else if (uploadedBy && mongoose.Types.ObjectId.isValid(uploadedBy)) {
      filter.uploadedBy = uploadedBy;
    }

    // Search query across title, subject, and description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { description: searchRegex },
      ];
    }

    // Sort newest notes first
    const notes = await Note.find(filter)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email role department registerNumber');

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single note by ID
 * @route   GET /api/notes/:id
 * @access  Private (All authenticated users)
 */
const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Note ID format.',
      });
    }

    const note = await Note.findById(id).populate(
      'uploadedBy',
      'name email role department registerNumber'
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a note (Remove from Cloudinary and MongoDB)
 * @route   DELETE /api/notes/:id
 * @access  Private (Admin or Note Owner)
 */
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Note ID format.',
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Authorization check: Only Admin or the faculty member who uploaded the note
    const isAdmin = req.user.role === 'admin';
    const isOwner = note.uploadedBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this note.',
      });
    }

    // 1. Delete file from Cloudinary
    if (note.cloudinaryPublicId) {
      const resourceType =
        note.fileType === 'JPG' || note.fileType === 'JPEG' || note.fileType === 'PNG'
          ? 'image'
          : 'raw';
      await deleteFromCloudinary(note.cloudinaryPublicId, resourceType);
    }

    // 2. Remove document from MongoDB
    await Note.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Note and attached document successfully removed.',
      deletedId: id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  deleteNote,
};
