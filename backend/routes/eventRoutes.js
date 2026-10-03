const express = require('express');
const router = express.Router();

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

const {
  registerFreeEvent,
  getStudentRegistrationStatus,
  getEventRegistrations,
  createRazorpayOrder,
  verifyPaymentAndRegister,
} = require('../controllers/registrationController');

const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Base Event Routes: /api/events
router
  .route('/')
  .get(protect, getEvents)
  .post(protect, requireRole('faculty', 'admin'), createEvent);

// Single Event Details & Management: /api/events/:id
router
  .route('/:id')
  .get(protect, getEventById)
  .put(protect, requireRole('faculty', 'admin'), updateEvent)
  .delete(protect, requireRole('faculty', 'admin'), deleteEvent);

// Registration & Paid Order Routes: /api/events/:eventId/...
router.post(
  '/:eventId/register',
  protect,
  requireRole('student'),
  registerFreeEvent
);

router.get(
  '/:eventId/registration',
  protect,
  requireRole('student'),
  getStudentRegistrationStatus
);

router.get(
  '/:eventId/registrations',
  protect,
  requireRole('faculty', 'admin'),
  getEventRegistrations
);

router.post(
  '/:eventId/create-order',
  protect,
  requireRole('student'),
  createRazorpayOrder
);

router.post(
  '/:eventId/verify-payment',
  protect,
  requireRole('student'),
  verifyPaymentAndRegister
);

module.exports = router;
