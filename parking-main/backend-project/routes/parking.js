const express = require('express');
const router = express.Router();
const ParkingController = require('../controllers/parkingController');
const { authenticateUser, requireManagerOrAdmin } = require('../middleware/auth');
const { validateParkingEntry, validateDateRange } = require('../middleware/validation');

// @route   GET /api/parking/records
// @desc    Get all parking records
// @access  Private
router.get('/records', authenticateUser, ParkingController.getAllRecords);

// @route   GET /api/parking/records/active
// @desc    Get active parking records
// @access  Private
router.get('/records/active', authenticateUser, ParkingController.getActiveRecords);

// @route   GET /api/parking/records/search
// @desc    Search parking records
// @access  Private
router.get('/records/search', authenticateUser, ParkingController.searchRecords);

// @route   GET /api/parking/records/:id
// @desc    Get parking record by ID
// @access  Private
router.get('/records/:id', authenticateUser, ParkingController.getRecordById);

// @route   POST /api/parking/entry
// @desc    Record car entry
// @access  Private
router.post('/entry', authenticateUser, requireManagerOrAdmin, validateParkingEntry, ParkingController.carEntry);

// @route   PUT /api/parking/exit/:id
// @desc    Record car exit
// @access  Private
router.put('/exit/:id', authenticateUser, requireManagerOrAdmin, ParkingController.carExit);

// @route   GET /api/parking/statistics
// @desc    Get parking statistics
// @access  Private
router.get('/statistics', authenticateUser, validateDateRange, ParkingController.getStatistics);

// @route   GET /api/parking/revenue/:date
// @desc    Get daily revenue
// @access  Private
router.get('/revenue/:date', authenticateUser, ParkingController.getDailyRevenue);

// @route   GET /api/parking/dashboard
// @desc    Get dashboard data
// @access  Private
router.get('/dashboard', authenticateUser, ParkingController.getDashboard);

module.exports = router;
