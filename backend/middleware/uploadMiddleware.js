const multer = require('multer');
const path = require('path');

// Configure in-memory storage for Cloudinary streaming
const storage = multer.memoryStorage();

// Allowed file extensions and MIME types
const ALLOWED_MIME_TYPES = [
  // PDF
  'application/pdf',
  // Word DOC & DOCX
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

// Maximum file size: 25 Megabytes
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);
  const isMimeValid =
    ALLOWED_MIME_TYPES.includes(mime) ||
    // Some mobile devices or OS upload docx as generic octet-stream
    (ext === '.docx' && mime === 'application/octet-stream') ||
    (ext === '.pdf' && mime === 'application/octet-stream');

  if (isExtValid && isMimeValid) {
    return cb(null, true);
  }

  cb(
    new Error(
      `Unsupported file type (${ext || mime}). Please upload a valid document or image: PDF, DOC, DOCX, JPG, or PNG.`
    ),
    false
  );
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Single file per note
  },
  fileFilter,
});

/**
 * Single file upload middleware wrapping Multer with clean error handling
 */
const uploadNoteFile = (req, res, next) => {
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 25MB limit. Please upload a smaller file.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File validation failed.',
      });
    }

    next();
  });
};

module.exports = {
  uploadNoteFile,
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
};
