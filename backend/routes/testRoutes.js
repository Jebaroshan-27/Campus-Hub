const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

/**
 * Temporary development testing routes to verify roleMiddleware & authMiddleware.
 * Will not be used for production application business logic.
 */

// Student-accessible test route
router.get('/student', protect, requireRole('student', 'faculty', 'admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Student clearance verified.',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

// Faculty-only test route
router.get('/faculty', protect, requireRole('faculty', 'admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Faculty academic clearance verified.',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

// Admin-only test route
router.get('/admin', protect, requireRole('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: High-level System Administrator clearance verified.',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

module.exports = router;
