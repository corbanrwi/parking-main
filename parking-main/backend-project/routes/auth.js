const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const { validateLogin, validateRegister } = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validateRegister, AuthController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, AuthController.login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', AuthController.logout);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateUser, AuthController.getProfile);

// @route   GET /api/auth/check
// @desc    Check authentication status
// @access  Public
router.get('/check', AuthController.checkAuth);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateUser, AuthController.changePassword);

module.exports = router;
