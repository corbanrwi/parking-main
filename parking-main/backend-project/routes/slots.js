const express = require('express');
const router = express.Router();
const SlotController = require('../controllers/slotController');
const { authenticateUser, requireManagerOrAdmin, requireAdmin } = require('../middleware/auth');
const { validateParkingSlot } = require('../middleware/validation');

// @route   GET /api/slots
// @desc    Get all parking slots
// @access  Private
router.get('/', authenticateUser, SlotController.getAllSlots);

// @route   GET /api/slots/available
// @desc    Get available parking slots
// @access  Private
router.get('/available', authenticateUser, SlotController.getAvailableSlots);

// @route   GET /api/slots/type/:type
// @desc    Get slots by type
// @access  Private
router.get('/type/:type', authenticateUser, SlotController.getSlotsByType);

// @route   GET /api/slots/statistics
// @desc    Get slot statistics
// @access  Private
router.get('/statistics', authenticateUser, SlotController.getSlotStatistics);

// @route   GET /api/slots/map
// @desc    Get slot occupancy map
// @access  Private
router.get('/map', authenticateUser, SlotController.getSlotMap);

// @route   GET /api/slots/:slot_number
// @desc    Get slot by number
// @access  Private
router.get('/:slot_number', authenticateUser, SlotController.getSlotByNumber);

// @route   POST /api/slots
// @desc    Create new parking slot
// @access  Admin only
router.post('/', authenticateUser, requireAdmin, validateParkingSlot, SlotController.createSlot);

// @route   PUT /api/slots/:slot_number/status
// @desc    Update slot status
// @access  Manager or Admin
router.put('/:slot_number/status', authenticateUser, requireManagerOrAdmin, SlotController.updateSlotStatus);

// @route   PUT /api/slots/:slot_number
// @desc    Update slot details
// @access  Admin only
router.put('/:slot_number', authenticateUser, requireAdmin, SlotController.updateSlot);

// @route   DELETE /api/slots/:slot_number
// @desc    Delete parking slot
// @access  Admin only
router.delete('/:slot_number', authenticateUser, requireAdmin, SlotController.deleteSlot);

module.exports = router;
