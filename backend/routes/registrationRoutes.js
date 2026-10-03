const express = require('express');
const router = express.Router();

const {
  registerFreeEvent,
  getStudentRegistrationStatus,
  getMyRegistrations,
  getEventRegistrations,
  createRazorpayOrder,
  verifyPaymentAndRegister,
} = require('../controllers/registrationController');

const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Route: /api/my-registrations (Student personal registrations)
router.get(
  '/my-registrations',
  protect,
  requireRole('student'),
  getMyRegistrations
);

// Route: /api/events/:eventId/register (Free RSVP)
router.post(
  '/events/:eventId/register',
  protect,
  requireRole('student'),
  registerFreeEvent
);

// Route: /api/events/:eventId/registration (Single student registration status)
router.get(
  '/events/:eventId/registration',
  protect,
  requireRole('student'),
  getStudentRegistrationStatus
);

// Route: /api/events/:eventId/registrations (Faculty/Admin view attendee roster)
router.get(
  '/events/:eventId/registrations',
  protect,
  requireRole('faculty', 'admin'),
  getEventRegistrations
);

// Route: /api/events/:eventId/create-order (Razorpay Order creation)
router.post(
  '/events/:eventId/create-order',
  protect,
  requireRole('student'),
  createRazorpayOrder
);

// Route: /api/events/:eventId/verify-payment (Razorpay HMAC Verification)
router.post(
  '/events/:eventId/verify-payment',
  protect,
  requireRole('student'),
  verifyPaymentAndRegister
);

module.exports = router;
