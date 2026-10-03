const mongoose = require('mongoose');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

const VALID_EVENT_TYPES = [
  'Workshop',
  'Seminar',
  'Hackathon',
  'Cultural',
  'Sports',
  'Technical',
  'Other',
];

const VALID_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Faculty, Admin)
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      eventType,
      venue,
      eventDate,
      startTime,
      endTime,
      registrationDeadline,
      organizer,
      department,
      capacity,
      isPaid,
      price,
      status,
    } = req.body;

    // 1. Validate required text fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the event title.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the event description.',
      });
    }

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: `Please specify a valid event type (${VALID_EVENT_TYPES.join(', ')}).`,
      });
    }

    if (!venue || !venue.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the event venue or hall.',
      });
    }

    if (!startTime || !startTime.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the start time (e.g. 10:00 AM).',
      });
    }

    if (!endTime || !endTime.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the end time (e.g. 01:00 PM).',
      });
    }

    if (!organizer || !organizer.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the event organizer name or department club.',
      });
    }

    // 2. Validate dates
    if (!eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the event date.',
      });
    }

    if (!registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the registration deadline date.',
      });
    }

    const parsedEventDate = new Date(eventDate);
    const parsedDeadline = new Date(registrationDeadline);

    if (isNaN(parsedEventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event date provided.',
      });
    }

    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration deadline provided.',
      });
    }

    if (parsedDeadline > parsedEventDate) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline cannot be after the event date.',
      });
    }

    // 3. Validate pricing
    const isPaidBool = Boolean(isPaid === true || isPaid === 'true');
    let numPrice = 0;

    if (isPaidBool) {
      numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Paid events must have a valid positive price greater than ₹0.',
        });
      }
    } else {
      numPrice = 0;
    }

    // 4. Validate capacity
    let numCapacity = 0;
    if (capacity !== undefined && capacity !== null && capacity !== '') {
      numCapacity = Number(capacity);
      if (isNaN(numCapacity) || numCapacity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Capacity must be a valid non-negative number.',
        });
      }
    }

    // 5. Create event in MongoDB
    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      eventType,
      venue: venue.trim(),
      eventDate: parsedEventDate,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      registrationDeadline: parsedDeadline,
      organizer: organizer.trim(),
      department: department ? department.trim() : 'General',
      capacity: numCapacity,
      isPaid: isPaidBool,
      price: numPrice,
      status: status && VALID_STATUSES.includes(status) ? status : 'upcoming',
      createdBy: req.user._id,
    });

    const populated = await Event.findById(event._id).populate(
      'createdBy',
      'name email role department'
    );

    res.status(201).json({
      success: true,
      message: 'Event created and published successfully.',
      event: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events with search & filtering
 * @route   GET /api/events
 * @access  Private (Authenticated users)
 */
const getEvents = async (req, res, next) => {
  try {
    const { search, eventType, department, status, isPaid, creator } = req.query;

    const filter = {};

    // Filter by Event Type
    if (eventType && eventType !== 'All') {
      filter.eventType = eventType;
    }

    // Filter by Department
    if (department && department !== 'All') {
      filter.department = department;
    }

    // Filter by Paid / Free
    if (isPaid !== undefined && isPaid !== '' && isPaid !== 'All') {
      filter.isPaid = isPaid === 'true' || isPaid === true;
    }

    // Filter by Status
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Filter by creator (used when faculty wants to see only their events)
    if (creator) {
      if (creator === 'me' && req.user) {
        filter.createdBy = req.user._id;
      } else if (mongoose.Types.ObjectId.isValid(creator)) {
        filter.createdBy = creator;
      }
    }

    // Search across title, description, organizer, and venue
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { organizer: searchRegex },
        { venue: searchRegex },
      ];
    }

    const events = await Event.find(filter)
      .sort({ eventDate: 1, createdAt: -1 })
      .populate('createdBy', 'name email role department');

    // Aggregate registration counts for all events
    const regCounts = await EventRegistration.aggregate([
      { $match: { registrationStatus: 'registered' } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    regCounts.forEach((rc) => {
      countMap[rc._id.toString()] = rc.count;
    });

    // Check student registrations if user is student
    let userRegMap = {};
    if (req.user && req.user.role === 'student') {
      const studentRegs = await EventRegistration.find({
        student: req.user._id,
        registrationStatus: 'registered',
      }).select('event paymentStatus registrationStatus');

      studentRegs.forEach((r) => {
        userRegMap[r.event.toString()] = {
          registered: true,
          paymentStatus: r.paymentStatus,
          registrationStatus: r.registrationStatus,
        };
      });
    }

    const now = new Date();
    const formattedEvents = events.map((ev) => {
      const doc = ev.toObject();
      const registeredCount = countMap[ev._id.toString()] || 0;
      doc.registeredCount = registeredCount;
      doc.isFull = ev.capacity > 0 && registeredCount >= ev.capacity;
      doc.isDeadlinePassed = new Date(ev.registrationDeadline) < now;

      // Dynamic effective status if not cancelled
      if (doc.status !== 'cancelled') {
        const evDate = new Date(ev.eventDate);
        if (evDate < now && doc.status === 'upcoming') {
          doc.effectiveStatus = 'completed';
        } else {
          doc.effectiveStatus = doc.status;
        }
      } else {
        doc.effectiveStatus = 'cancelled';
      }

      if (req.user && req.user.role === 'student') {
        const userReg = userRegMap[ev._id.toString()];
        doc.isUserRegistered = Boolean(userReg);
        doc.userRegistration = userReg || null;
      }

      return doc;
    });

    res.status(200).json({
      success: true,
      count: formattedEvents.length,
      events: formattedEvents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Private (Authenticated users)
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event identifier format.',
      });
    }

    const event = await Event.findById(id).populate(
      'createdBy',
      'name email role department'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or has been removed.',
      });
    }

    const registeredCount = await EventRegistration.countDocuments({
      event: event._id,
      registrationStatus: 'registered',
    });

    const doc = event.toObject();
    doc.registeredCount = registeredCount;
    doc.isFull = event.capacity > 0 && registeredCount >= event.capacity;
    const now = new Date();
    doc.isDeadlinePassed = new Date(event.registrationDeadline) < now;

    if (doc.status !== 'cancelled') {
      const evDate = new Date(event.eventDate);
      if (evDate < now && doc.status === 'upcoming') {
        doc.effectiveStatus = 'completed';
      } else {
        doc.effectiveStatus = doc.status;
      }
    } else {
      doc.effectiveStatus = 'cancelled';
    }

    // Attach student registration status
    if (req.user && req.user.role === 'student') {
      const registration = await EventRegistration.findOne({
        event: event._id,
        student: req.user._id,
      });

      doc.isUserRegistered = Boolean(
        registration && registration.registrationStatus === 'registered'
      );
      doc.userRegistration = registration || null;
    }

    res.status(200).json({
      success: true,
      event: doc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 * @access  Private (Faculty, Admin)
 */
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event identifier.',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Authorization: Faculty can only update their own events. Admin can update any.
    if (
      req.user.role === 'faculty' &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Faculty members can only modify their own events.',
      });
    }

    const {
      title,
      description,
      eventType,
      venue,
      eventDate,
      startTime,
      endTime,
      registrationDeadline,
      organizer,
      department,
      capacity,
      isPaid,
      price,
      status,
    } = req.body;

    // Validate dates if modified
    let parsedEventDate = event.eventDate;
    let parsedDeadline = event.registrationDeadline;

    if (eventDate) {
      parsedEventDate = new Date(eventDate);
      if (isNaN(parsedEventDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event date.',
        });
      }
    }

    if (registrationDeadline) {
      parsedDeadline = new Date(registrationDeadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration deadline.',
        });
      }
    }

    if (parsedDeadline > parsedEventDate) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline cannot be after the event date.',
      });
    }

    // Validate event type
    if (eventType && !VALID_EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}`,
      });
    }

    // Validate status
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    // Validate pricing
    let isPaidBool = event.isPaid;
    let numPrice = event.price;

    if (isPaid !== undefined) {
      isPaidBool = Boolean(isPaid === true || isPaid === 'true');
    }

    if (isPaidBool) {
      const checkPrice = price !== undefined ? price : event.price;
      numPrice = Number(checkPrice);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Paid events must have a valid positive price greater than ₹0.',
        });
      }
    } else {
      numPrice = 0;
    }

    // Validate capacity
    let numCapacity = event.capacity;
    if (capacity !== undefined) {
      numCapacity = Number(capacity);
      if (isNaN(numCapacity) || numCapacity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Capacity must be a valid non-negative number.',
        });
      }
    }

    // Apply updates
    if (title && title.trim()) event.title = title.trim();
    if (description && description.trim()) event.description = description.trim();
    if (eventType) event.eventType = eventType;
    if (venue && venue.trim()) event.venue = venue.trim();
    event.eventDate = parsedEventDate;
    if (startTime && startTime.trim()) event.startTime = startTime.trim();
    if (endTime && endTime.trim()) event.endTime = endTime.trim();
    event.registrationDeadline = parsedDeadline;
    if (organizer && organizer.trim()) event.organizer = organizer.trim();
    if (department) event.department = department.trim();
    event.capacity = numCapacity;
    event.isPaid = isPaidBool;
    event.price = numPrice;
    if (status) event.status = status;

    await event.save();

    const updatedPopulated = await Event.findById(event._id).populate(
      'createdBy',
      'name email role department'
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      event: updatedPopulated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private (Faculty, Admin)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event identifier format.',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or already deleted.',
      });
    }

    // Authorization: Faculty can delete only their own events. Admin can delete any.
    if (
      req.user.role === 'faculty' &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Faculty members can only delete events they created.',
      });
    }

    // Remove associated event registrations
    await EventRegistration.deleteMany({ event: event._id });
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event and associated registrations deleted successfully.',
      deletedId: id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
