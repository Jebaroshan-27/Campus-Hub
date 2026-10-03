const mongoose = require('mongoose');
const Connection = require('../models/Connection');
const User = require('../models/User');

/**
 * @desc    Search student by exact register number and get connection status
 * @route   GET /api/connections/search/:registerNumber
 * @access  Private (Student only)
 */
const searchStudent = async (req, res, next) => {
  try {
    const { registerNumber } = req.params;

    if (!registerNumber || !registerNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid register number.',
      });
    }

    const cleanedRegNo = registerNumber.trim().toUpperCase();

    // 1. Find target student
    const student = await User.findOne({
      registerNumber: cleanedRegNo,
      role: 'student',
    }).select('name registerNumber department year profileImage');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student found with register number "${cleanedRegNo}".`,
      });
    }

    // 2. Prevent connecting with self
    const isSelf = student._id.equals(req.user._id);
    if (isSelf) {
      return res.status(200).json({
        success: true,
        student: {
          _id: student._id,
          name: student.name,
          registerNumber: student.registerNumber,
          department: student.department,
          year: student.year,
          profileImage: student.profileImage,
        },
        connectionStatus: 'self',
        message: 'You cannot connect with yourself.',
      });
    }

    // 3. Check existing connection between the two students
    const existingConnection = await Connection.findBetween(
      req.user._id,
      student._id
    );

    let connectionStatus = 'none';
    let connectionId = null;

    if (existingConnection) {
      connectionId = existingConnection._id;
      if (existingConnection.status === 'accepted') {
        connectionStatus = 'accepted';
      } else if (existingConnection.status === 'blocked') {
        connectionStatus = 'blocked';
      } else if (existingConnection.status === 'pending') {
        if (existingConnection.requester.equals(req.user._id)) {
          connectionStatus = 'pending_sent';
        } else {
          connectionStatus = 'pending_received';
        }
      } else if (existingConnection.status === 'rejected') {
        connectionStatus = 'rejected';
      }
    }

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        registerNumber: student.registerNumber,
        department: student.department,
        year: student.year,
        profileImage: student.profileImage,
      },
      connectionStatus,
      connectionId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a connection request to a student using exact register number
 * @route   POST /api/connections/request
 * @access  Private (Student only)
 */
const sendConnectionRequest = async (req, res, next) => {
  try {
    const { registerNumber } = req.body;

    if (!registerNumber || !registerNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the student register number.',
      });
    }

    const cleanedRegNo = registerNumber.trim().toUpperCase();

    // 1. Find receiver
    const receiver = await User.findOne({
      registerNumber: cleanedRegNo,
      role: 'student',
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: `Student with register number "${cleanedRegNo}" not found.`,
      });
    }

    // 2. Prevent self request
    if (receiver._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a connection request to yourself.',
      });
    }

    // 3. Check existing connection in either direction
    const existing = await Connection.findBetween(req.user._id, receiver._id);

    if (existing) {
      if (existing.status === 'pending') {
        if (existing.requester.equals(req.user._id)) {
          return res.status(400).json({
            success: false,
            message: 'Connection request already pending.',
          });
        } else {
          return res.status(400).json({
            success: false,
            message:
              'This student has already sent you a connection request. Check your received invitations to accept.',
          });
        }
      }

      if (existing.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'You are already connected with this student.',
        });
      }

      if (existing.status === 'blocked') {
        return res.status(400).json({
          success: false,
          message: 'Connection unavailable.',
        });
      }

      // Re-request behavior after rejection: reset to pending
      if (existing.status === 'rejected') {
        existing.requester = req.user._id;
        existing.receiver = receiver._id;
        existing.status = 'pending';
        existing.blockedBy = null;
        await existing.save();

        const populated = await Connection.findById(existing._id)
          .populate('receiver', 'name registerNumber department year profileImage')
          .populate('requester', 'name registerNumber department year profileImage');

        return res.status(201).json({
          success: true,
          message: `Connection request sent to ${receiver.name}.`,
          connection: populated,
        });
      }
    }

    // 4. Create new connection
    const newConnection = await Connection.create({
      requester: req.user._id,
      receiver: receiver._id,
      status: 'pending',
    });

    const populated = await Connection.findById(newConnection._id)
      .populate('receiver', 'name registerNumber department year profileImage')
      .populate('requester', 'name registerNumber department year profileImage');

    res.status(201).json({
      success: true,
      message: `Connection request sent to ${receiver.name}.`,
      connection: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all connections for the logged-in student (received, sent, accepted, blocked)
 * @route   GET /api/connections
 * @access  Private (Student only)
 */
const getConnections = async (req, res, next) => {
  try {
    const all = await Connection.find({
      $or: [{ requester: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ updatedAt: -1 })
      .populate('requester', 'name registerNumber department year profileImage')
      .populate('receiver', 'name registerNumber department year profileImage');

    const pendingReceived = [];
    const pendingSent = [];
    const accepted = [];
    const blocked = [];

    all.forEach((conn) => {
      const isRequester = conn.requester?._id.equals(req.user._id);
      const partner = isRequester ? conn.receiver : conn.requester;

      // Skip orphaned user records if deleted
      if (!partner) return;

      const obj = conn.toObject();
      obj.partner = partner;

      if (conn.status === 'pending') {
        if (isRequester) {
          pendingSent.push(obj);
        } else {
          pendingReceived.push(obj);
        }
      } else if (conn.status === 'accepted') {
        accepted.push(obj);
      } else if (conn.status === 'blocked') {
        blocked.push(obj);
      }
    });

    res.status(200).json({
      success: true,
      counts: {
        pendingReceived: pendingReceived.length,
        pendingSent: pendingSent.length,
        accepted: accepted.length,
        blocked: blocked.length,
      },
      pendingReceived,
      pendingSent,
      accepted,
      blocked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a pending connection request
 * @route   POST /api/connections/:id/accept
 * @access  Private (Student only - receiver only)
 */
const acceptConnection = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid connection identifier.',
      });
    }

    const connection = await Connection.findById(id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found or removed.',
      });
    }

    // Only the designated receiver can accept the pending request
    if (!connection.receiver.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient of a connection invitation can accept it.',
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept connection currently in "${connection.status}" state.`,
      });
    }

    connection.status = 'accepted';
    await connection.save();

    const populated = await Connection.findById(connection._id)
      .populate('requester', 'name registerNumber department year profileImage')
      .populate('receiver', 'name registerNumber department year profileImage');

    res.status(200).json({
      success: true,
      message: 'Connection request accepted. You can now chat in real-time!',
      connection: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a pending connection request
 * @route   POST /api/connections/:id/reject
 * @access  Private (Student only - receiver only)
 */
const rejectConnection = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid connection identifier.',
      });
    }

    const connection = await Connection.findById(id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found.',
      });
    }

    // Only the designated receiver can reject
    if (!connection.receiver.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient of a connection invitation can decline it.',
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject connection currently in "${connection.status}" state.`,
      });
    }

    connection.status = 'rejected';
    await connection.save();

    res.status(200).json({
      success: true,
      message: 'Connection invitation declined.',
      connectionId: id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Block an existing connection
 * @route   POST /api/connections/:id/block
 * @access  Private (Student only - either participant)
 */
const blockConnection = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid connection ID.',
      });
    }

    const connection = await Connection.findById(id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found.',
      });
    }

    // Must be one of the participants
    const isParticipant =
      connection.requester.equals(req.user._id) ||
      connection.receiver.equals(req.user._id);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not a participant in this connection.',
      });
    }

    connection.status = 'blocked';
    connection.blockedBy = req.user._id;
    await connection.save();

    res.status(200).json({
      success: true,
      message: 'Student blocked successfully. Chat access has been terminated.',
      connectionId: id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchStudent,
  sendConnectionRequest,
  getConnections,
  acceptConnection,
  rejectConnection,
  blockConnection,
};
