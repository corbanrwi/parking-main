const express = require('express');
const router = express.Router();
const CarController = require('../controllers/carController');
const { authenticateUser, requireManagerOrAdmin } = require('../middleware/auth');
const { validateCar, validateCarUpdate } = require('../middleware/validation');

// @route   GET /api/cars
// @desc    Get all cars
// @access  Private
router.get('/', authenticateUser, CarController.getAllCars);

// @route   GET /api/cars/search
// @desc    Search cars
// @access  Private
router.get('/search', authenticateUser, CarController.searchCars);

// @route   GET /api/cars/plate/:plate_number
// @desc    Get car by plate number
// @access  Private
router.get('/plate/:plate_number', authenticateUser, CarController.getCarByPlate);

// @route   GET /api/cars/driver/:driver_name
// @desc    Get cars by driver name
// @access  Private
router.get('/driver/:driver_name', authenticateUser, CarController.getCarsByDriver);

// @route   GET /api/cars/phone/:phone_number
// @desc    Get cars by phone number
// @access  Private
router.get('/phone/:phone_number', authenticateUser, CarController.getCarsByPhone);

// @route   GET /api/cars/:plate_number/history
// @desc    Get car parking history
// @access  Private
router.get('/:plate_number/history', authenticateUser, CarController.getCarHistory);

// @route   GET /api/cars/:plate_number/status
// @desc    Check if car is currently parked
// @access  Private
router.get('/:plate_number/status', authenticateUser, CarController.checkParkingStatus);

// @route   POST /api/cars
// @desc    Create new car
// @access  Manager or Admin
router.post('/', authenticateUser, requireManagerOrAdmin, validateCar, CarController.createCar);

// @route   PUT /api/cars/:plate_number
// @desc    Update car
// @access  Manager or Admin
router.put('/:plate_number', authenticateUser, requireManagerOrAdmin, validateCarUpdate, CarController.updateCar);

// @route   DELETE /api/cars/:plate_number
// @desc    Delete car
// @access  Manager or Admin
router.delete('/:plate_number', authenticateUser, requireManagerOrAdmin, CarController.deleteCar);

module.exports = router;
