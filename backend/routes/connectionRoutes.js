const express = require('express');
const router = express.Router();

const {
  searchStudent,
  sendConnectionRequest,
  getConnections,
  acceptConnection,
  rejectConnection,
  blockConnection,
} = require('../controllers/connectionController');

const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Route: GET /api/connections/search/:registerNumber
router.get(
  '/search/:registerNumber',
  protect,
  requireRole('student'),
  searchStudent
);

// Route: POST /api/connections/request
router.post(
  '/request',
  protect,
  requireRole('student'),
  sendConnectionRequest
);

// Route: GET /api/connections
router.get(
  '/',
  protect,
  requireRole('student'),
  getConnections
);

// Route: POST /api/connections/:id/accept
router.post(
  '/:id/accept',
  protect,
  requireRole('student'),
  acceptConnection
);

// Route: POST /api/connections/:id/reject
router.post(
  '/:id/reject',
  protect,
  requireRole('student'),
  rejectConnection
);

// Route: POST /api/connections/:id/block
router.post(
  '/:id/block',
  protect,
  requireRole('student'),
  blockConnection
);

module.exports = router;
