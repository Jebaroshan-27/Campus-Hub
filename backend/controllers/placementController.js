const mongoose = require('mongoose');
const Placement = require('../models/Placement');

// URL validation regex
const HTTP_URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

/**
 * Normalizes input array (handles JSON strings, comma-separated strings, or arrays)
 */
const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field.map((item) => String(item).trim()).filter(Boolean);
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
    } catch {
      // Split by comma
      return field
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

/**
 * @desc    Create a new placement drive
 * @route   POST /api/placements
 * @access  Private (Admin only)
 */
const createPlacement = async (req, res, next) => {
  try {
    const {
      companyName,
      jobTitle,
      description,
      location,
      workMode,
      salary,
      eligibility,
      minimumCGPA,
      eligibleDepartments,
      eligibleYears,
      skills,
      applicationDeadline,
      applicationUrl,
      status,
    } = req.body;

    // 1. Validate required fields
    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the company name.',
      });
    }

    if (!jobTitle || !jobTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the job title / role.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the job description.',
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the job location.',
      });
    }

    if (!salary || !salary.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the compensation / salary package.',
      });
    }

    if (!applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an application deadline date.',
      });
    }

    const parsedDeadline = new Date(applicationDeadline);
    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deadline date format.',
      });
    }

    if (!applicationUrl || !applicationUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the company application URL.',
      });
    }

    if (!HTTP_URL_REGEX.test(applicationUrl.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Application URL must be a valid HTTP or HTTPS web address.',
      });
    }

    // 2. Parse arrays and numeric values
    const depts = parseArrayField(eligibleDepartments);
    const yrs = parseArrayField(eligibleYears);
    const reqSkills = parseArrayField(skills);
    const cgpa = minimumCGPA !== undefined && minimumCGPA !== '' ? Number(minimumCGPA) : 0;

    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum CGPA must be a valid number between 0 and 10.0.',
      });
    }

    // 3. Create placement document
    const placement = await Placement.create({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      description: description.trim(),
      location: location.trim(),
      workMode: workMode || 'On-site',
      salary: salary.trim(),
      eligibility: eligibility ? eligibility.trim() : '',
      minimumCGPA: cgpa,
      eligibleDepartments: depts,
      eligibleYears: yrs,
      skills: reqSkills,
      applicationDeadline: parsedDeadline,
      applicationUrl: applicationUrl.trim(),
      status: status || (parsedDeadline < new Date() ? 'closed' : 'open'),
      createdBy: req.user._id,
    });

    const populated = await Placement.findById(placement._id).populate(
      'createdBy',
      'name email role'
    );

    res.status(201).json({
      success: true,
      message: 'Placement drive published successfully.',
      placement: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all placement drives with search & filtering
 * @route   GET /api/placements
 * @access  Private (Authenticated users)
 */
const getPlacements = async (req, res, next) => {
  try {
    const { search, department, year, workMode, status } = req.query;

    const filter = {};
    const now = new Date();

    // Work Mode Filter
    if (workMode && workMode !== 'All') {
      filter.workMode = workMode;
    }

    // Department Filter: placement allows this department OR allows all departments
    if (department && department !== 'All') {
      filter.$or = filter.$or || [];
      filter.eligibleDepartments = { $in: [department] };
    }

    // Year Filter
    if (year && year !== 'All') {
      filter.eligibleYears = { $in: [year] };
    }

    // Status Filter (handles expired deadlines dynamically)
    if (status && status !== 'All') {
      if (status.toLowerCase() === 'open') {
        filter.status = 'open';
        filter.applicationDeadline = { $gte: now };
      } else if (status.toLowerCase() === 'closed') {
        // Either status explicitly closed OR deadline has passed
        const closedCondition = [
          { status: 'closed' },
          { applicationDeadline: { $lt: now } },
        ];
        if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { $or: closedCondition }];
          delete filter.$or;
        } else {
          filter.$or = closedCondition;
        }
      }
    }

    // Text Search across companyName, jobTitle, description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchCondition = [
        { companyName: searchRegex },
        { jobTitle: searchRegex },
        { description: searchRegex },
      ];

      if (filter.$or) {
        filter.$and = filter.$and || [];
        filter.$and.push({ $or: filter.$or });
        filter.$and.push({ $or: searchCondition });
        delete filter.$or;
      } else if (filter.$and) {
        filter.$and.push({ $or: searchCondition });
      } else {
        filter.$or = searchCondition;
      }
    }

    // Sort: newest first
    const placements = await Placement.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role');

    // Attach dynamic effectiveStatus
    const formattedPlacements = placements.map((p) => {
      const doc = p.toObject();
      const isDeadlinePassed = new Date(p.applicationDeadline) < now;
      doc.isExpired = isDeadlinePassed;
      doc.effectiveStatus = isDeadlinePassed ? 'closed' : p.status;
      return doc;
    });

    res.status(200).json({
      success: true,
      count: formattedPlacements.length,
      placements: formattedPlacements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single placement drive by ID
 * @route   GET /api/placements/:id
 * @access  Private (Authenticated users)
 */
const getPlacementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid placement drive ID format.',
      });
    }

    const placement = await Placement.findById(id).populate(
      'createdBy',
      'name email role'
    );

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    const doc = placement.toObject();
    const isDeadlinePassed = new Date(placement.applicationDeadline) < new Date();
    doc.isExpired = isDeadlinePassed;
    doc.effectiveStatus = isDeadlinePassed ? 'closed' : placement.status;

    res.status(200).json({
      success: true,
      placement: doc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a placement drive
 * @route   PUT /api/placements/:id
 * @access  Private (Admin only)
 */
const updatePlacement = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid placement drive ID format.',
      });
    }

    const placement = await Placement.findById(id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    const {
      companyName,
      jobTitle,
      description,
      location,
      workMode,
      salary,
      eligibility,
      minimumCGPA,
      eligibleDepartments,
      eligibleYears,
      skills,
      applicationDeadline,
      applicationUrl,
      status,
    } = req.body;

    // Validate applicationUrl if updated
    if (applicationUrl !== undefined) {
      if (!applicationUrl || !HTTP_URL_REGEX.test(applicationUrl.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Application URL must be a valid HTTP or HTTPS web address.',
        });
      }
      placement.applicationUrl = applicationUrl.trim();
    }

    // Validate deadline if updated
    if (applicationDeadline !== undefined) {
      const parsedDeadline = new Date(applicationDeadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid application deadline date format.',
        });
      }
      placement.applicationDeadline = parsedDeadline;
    }

    // Update text fields if provided
    if (companyName !== undefined) placement.companyName = companyName.trim();
    if (jobTitle !== undefined) placement.jobTitle = jobTitle.trim();
    if (description !== undefined) placement.description = description.trim();
    if (location !== undefined) placement.location = location.trim();
    if (workMode !== undefined) placement.workMode = workMode;
    if (salary !== undefined) placement.salary = salary.trim();
    if (eligibility !== undefined) placement.eligibility = eligibility.trim();
    if (status !== undefined) placement.status = status;

    if (minimumCGPA !== undefined) {
      const cgpa = Number(minimumCGPA);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        return res.status(400).json({
          success: false,
          message: 'Minimum CGPA must be a valid number between 0 and 10.0.',
        });
      }
      placement.minimumCGPA = cgpa;
    }

    if (eligibleDepartments !== undefined) {
      placement.eligibleDepartments = parseArrayField(eligibleDepartments);
    }

    if (eligibleYears !== undefined) {
      placement.eligibleYears = parseArrayField(eligibleYears);
    }

    if (skills !== undefined) {
      placement.skills = parseArrayField(skills);
    }

    await placement.save();

    const updated = await Placement.findById(id).populate(
      'createdBy',
      'name email role'
    );

    const doc = updated.toObject();
    const isDeadlinePassed = new Date(updated.applicationDeadline) < new Date();
    doc.isExpired = isDeadlinePassed;
    doc.effectiveStatus = isDeadlinePassed ? 'closed' : updated.status;

    res.status(200).json({
      success: true,
      message: 'Placement drive updated successfully.',
      placement: doc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a placement drive
 * @route   DELETE /api/placements/:id
 * @access  Private (Admin only)
 */
const deletePlacement = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid placement drive ID format.',
      });
    }

    const placement = await Placement.findById(id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    await Placement.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Placement drive successfully deleted.',
      deletedId: id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  deletePlacement,
};
