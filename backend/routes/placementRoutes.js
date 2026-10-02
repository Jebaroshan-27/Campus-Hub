const express = require('express');
const router = express.Router();

const {
  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  deletePlacement,
} = require('../controllers/placementController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Route: /api/placements
router
  .route('/')
  .get(protect, getPlacements)
  .post(protect, requireRole('admin'), createPlacement);

// Route: /api/placements/:id
router
  .route('/:id')
  .get(protect, getPlacementById)
  .put(protect, requireRole('admin'), updatePlacement)
  .delete(protect, requireRole('admin'), deletePlacement);

module.exports = router;
