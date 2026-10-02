const express = require('express');
const router = express.Router();

const {
  createNote,
  getNotes,
  getNoteById,
  deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { uploadNoteFile } = require('../middleware/uploadMiddleware');

// Route: /api/notes
router
  .route('/')
  .get(protect, getNotes)
  .post(protect, requireRole('faculty', 'admin'), uploadNoteFile, createNote);

// Route: /api/notes/:id
router
  .route('/:id')
  .get(protect, getNoteById)
  .delete(protect, requireRole('faculty', 'admin'), deleteNote);

module.exports = router;
