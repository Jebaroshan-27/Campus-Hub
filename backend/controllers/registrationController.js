const mongoose = require('mongoose');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const razorpayService = require('../services/razorpayService');

/**
 * @desc    Register student for a FREE event
 * @route   POST /api/events/:eventId/register
 * @access  Private (Student only)
 */
const registerFreeEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event identifier format.',
      });
    }

    // 1. Check event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or has been removed.',
      });
    }

    // 2. Check if event is free
    if (event.isPaid && event.price > 0) {
      return res.status(400).json({
        success: false,
        message: 'This is a paid event. Please use the "Register & Pay" checkout flow.',
      });
    }

    // 3. Check event status
    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This event has been cancelled by the organizer.',
      });
    }

    if (event.status === 'completed' || new Date(event.eventDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This event has already concluded.',
      });
    }

    // 4. Check registration deadline
    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed. Registration is closed.',
      });
    }

    // 5. Check event capacity
    if (event.capacity > 0) {
      const activeCount = await EventRegistration.countDocuments({
        event: event._id,
        registrationStatus: 'registered',
      });

      if (activeCount >= event.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Event is full. Maximum participant capacity has been reached.',
        });
      }
    }

    // 6. Check duplicate registration
    const existingRegistration = await EventRegistration.findOne({
      event: event._id,
      student: req.user._id,
    });

    if (existingRegistration && existingRegistration.registrationStatus === 'registered') {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }

    // 7. Create or update registration
    let registration;
    if (existingRegistration) {
      existingRegistration.registrationStatus = 'registered';
      existingRegistration.paymentStatus = 'not_required';
      existingRegistration.registeredAt = new Date();
      registration = await existingRegistration.save();
    } else {
      registration = await EventRegistration.create({
        event: event._id,
        student: req.user._id,
        registrationStatus: 'registered',
        paymentStatus: 'not_required',
        registeredAt: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event.',
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get current student registration status for a specific event
 * @route   GET /api/events/:eventId/registration
 * @access  Private (Student)
 */
const getStudentRegistrationStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format.',
      });
    }

    const registration = await EventRegistration.findOne({
      event: eventId,
      student: req.user._id,
    });

    const isRegistered = Boolean(
      registration && registration.registrationStatus === 'registered'
    );

    res.status(200).json({
      success: true,
      isRegistered,
      registration: isRegistered ? registration : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events registered by the logged-in student
 * @route   GET /api/my-registrations
 * @access  Private (Student only)
 */
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({
      student: req.user._id,
    })
      .sort({ registeredAt: -1 })
      .populate({
        path: 'event',
        populate: {
          path: 'createdBy',
          select: 'name email role department',
        },
      });

    // Filter out orphaned registrations if event was deleted
    const validRegistrations = registrations.filter((reg) => reg.event !== null);

    res.status(200).json({
      success: true,
      count: validRegistrations.length,
      registrations: validRegistrations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all student registrations for an event (Admin / Event Creator)
 * @route   GET /api/events/:eventId/registrations
 * @access  Private (Admin or Event Creator Faculty)
 */
const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event identifier format.',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Authorization: Admin or the Faculty who created the event
    if (
      req.user.role === 'faculty' &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Faculty members can only view registrations for their own events.',
      });
    }

    const registrations = await EventRegistration.find({
      event: event._id,
    })
      .sort({ registeredAt: -1 })
      .populate('student', 'name registerNumber email department year profileImage');

    res.status(200).json({
      success: true,
      count: registrations.length,
      event: {
        _id: event._id,
        title: event.title,
        eventDate: event.eventDate,
        venue: event.venue,
        capacity: event.capacity,
        isPaid: event.isPaid,
        price: event.price,
      },
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create Razorpay Order for a paid event
 * @route   POST /api/events/:eventId/create-order
 * @access  Private (Student only)
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event identifier format.',
      });
    }

    // 1. Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or has been removed.',
      });
    }

    // 2. Check event is paid
    if (!event.isPaid || event.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This is a free event. Please use the free registration button.',
      });
    }

    // 3. Check event status
    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This event has been cancelled.',
      });
    }

    if (event.status === 'completed' || new Date(event.eventDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This event has already concluded.',
      });
    }

    // 4. Check registration deadline
    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed. Registration is closed.',
      });
    }

    // 5. Check capacity
    if (event.capacity > 0) {
      const activeCount = await EventRegistration.countDocuments({
        event: event._id,
        registrationStatus: 'registered',
      });

      if (activeCount >= event.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Event is full. No more seats available.',
        });
      }
    }

    // 6. Check duplicate registration
    const existingRegistration = await EventRegistration.findOne({
      event: event._id,
      student: req.user._id,
    });

    if (
      existingRegistration &&
      existingRegistration.registrationStatus === 'registered' &&
      existingRegistration.paymentStatus === 'paid'
    ) {
      return res.status(400).json({
        success: false,
        message: 'You have already paid and registered for this event.',
      });
    }

    // 7. Read price strictly from MongoDB (amount in paise)
    const receipt = `rcpt_ev_${event._id.toString().substring(18)}_${req.user._id.toString().substring(18)}_${Date.now()}`;

    // 8. Create Razorpay order
    const order = await razorpayService.createOrder({
      amountInRupees: event.price,
      receipt,
      notes: {
        eventId: event._id.toString(),
        eventTitle: event.title,
        studentId: req.user._id.toString(),
        studentEmail: req.user.email,
        studentName: req.user.name,
      },
    });

    // 9. Return only needed checkout data (never expose secret)
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      event: {
        id: event._id,
        title: event.title,
        price: event.price,
      },
      prefill: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.registerNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature & confirm student registration
 * @route   POST /api/events/:eventId/verify-payment
 * @access  Private (Student only)
 */
const verifyPaymentAndRegister = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format.',
      });
    }

    // 1. Validate payload
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification parameters.',
      });
    }

    // 2. Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // 3. Payment duplicate protection: Check if paymentId was already used
    const paymentAlreadyUsed = await EventRegistration.findOne({
      razorpayPaymentId,
    });

    if (paymentAlreadyUsed) {
      return res.status(400).json({
        success: false,
        message: 'This payment transaction has already been processed.',
      });
    }

    // Check if student already registered
    const existingRegistration = await EventRegistration.findOne({
      event: event._id,
      student: req.user._id,
    });

    if (
      existingRegistration &&
      existingRegistration.registrationStatus === 'registered' &&
      existingRegistration.paymentStatus === 'paid'
    ) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed registration for this event.',
      });
    }

    // 4. Verify Razorpay cryptographic signature on backend
    const isValidSignature = razorpayService.verifySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature.',
      });
    }

    // 5. Create or update EventRegistration record
    let registration;
    if (existingRegistration) {
      existingRegistration.registrationStatus = 'registered';
      existingRegistration.paymentStatus = 'paid';
      existingRegistration.razorpayOrderId = razorpayOrderId;
      existingRegistration.razorpayPaymentId = razorpayPaymentId;
      existingRegistration.razorpaySignature = razorpaySignature;
      existingRegistration.registeredAt = new Date();
      registration = await existingRegistration.save();
    } else {
      registration = await EventRegistration.create({
        event: event._id,
        student: req.user._id,
        registrationStatus: 'registered',
        paymentStatus: 'paid',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        registeredAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and event registration confirmed successfully.',
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }
    next(error);
  }
};

module.exports = {
  registerFreeEvent,
  getStudentRegistrationStatus,
  getMyRegistrations,
  getEventRegistrations,
  createRazorpayOrder,
  verifyPaymentAndRegister,
};
