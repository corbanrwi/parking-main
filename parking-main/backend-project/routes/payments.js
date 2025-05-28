const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticateUser, requireManagerOrAdmin } = require('../middleware/auth');
const { validatePayment, validateDateRange } = require('../middleware/validation');

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', authenticateUser, PaymentController.getAllPayments);

// @route   GET /api/payments/search
// @desc    Get payments by date range
// @access  Private
router.get('/search', authenticateUser, validateDateRange, PaymentController.getPaymentsByDateRange);

// @route   GET /api/payments/statistics
// @desc    Get payment statistics
// @access  Private
router.get('/statistics', authenticateUser, validateDateRange, PaymentController.getPaymentStatistics);

// @route   GET /api/payments/revenue/:date
// @desc    Get daily revenue
// @access  Private
router.get('/revenue/:date', authenticateUser, PaymentController.getDailyRevenue);

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', authenticateUser, PaymentController.getPaymentById);

// @route   GET /api/payments/receipt/:receipt_number
// @desc    Get payment by receipt number
// @access  Private
router.get('/receipt/:receipt_number', authenticateUser, PaymentController.getPaymentByReceipt);

// @route   GET /api/payments/record/:record_id
// @desc    Get payments by record ID
// @access  Private
router.get('/record/:record_id', authenticateUser, PaymentController.getPaymentsByRecord);

// @route   GET /api/payments/:id/invoice
// @desc    Generate invoice/receipt
// @access  Private
router.get('/:id/invoice', authenticateUser, PaymentController.generateInvoice);

// @route   POST /api/payments
// @desc    Create new payment
// @access  Manager or Admin
router.post('/', authenticateUser, requireManagerOrAdmin, validatePayment, PaymentController.createPayment);

// @route   PUT /api/payments/:id/status
// @desc    Update payment status
// @access  Manager or Admin
router.put('/:id/status', authenticateUser, requireManagerOrAdmin, PaymentController.updatePaymentStatus);

// @route   DELETE /api/payments/:id
// @desc    Delete payment
// @access  Manager or Admin
router.delete('/:id', authenticateUser, requireManagerOrAdmin, PaymentController.deletePayment);

module.exports = router;
