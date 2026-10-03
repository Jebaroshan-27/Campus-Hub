const express = require('express');
const router = express.Router();

const {
  getMessages,
  sendMessage,
} = require('../controllers/messageController');

const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Route: GET /api/messages/:userId (Fetch chat history with connected student)
router.get(
  '/:userId',
  protect,
  requireRole('student'),
  getMessages
);

// Route: POST /api/messages (Send message to connected student)
router.post(
  '/',
  protect,
  requireRole('student'),
  sendMessage
);

module.exports = router;
