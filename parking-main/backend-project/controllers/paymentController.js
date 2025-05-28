const Payment = require('../models/Payment');

class PaymentController {
    // Get all payments
    static async getAllPayments(req, res) {
        try {
            const payments = await Payment.getAll();

            res.json({
                success: true,
                message: 'Payments retrieved successfully',
                data: payments
            });
        } catch (error) {
            console.error('Get all payments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payments',
                error: error.message
            });
        }
    }

    // Get payment by ID
    static async getPaymentById(req, res) {
        try {
            const { id } = req.params;
            const payment = await Payment.findById(id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            res.json({
                success: true,
                message: 'Payment retrieved successfully',
                data: payment
            });
        } catch (error) {
            console.error('Get payment by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment',
                error: error.message
            });
        }
    }

    // Get payment by receipt number
    static async getPaymentByReceipt(req, res) {
        try {
            const { receipt_number } = req.params;
            const payment = await Payment.findByReceiptNumber(receipt_number);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            res.json({
                success: true,
                message: 'Payment retrieved successfully',
                data: payment
            });
        } catch (error) {
            console.error('Get payment by receipt error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment',
                error: error.message
            });
        }
    }

    // Create new payment
    static async createPayment(req, res) {
        try {
            const { record_id, amount_paid, payment_method } = req.body;

            const payment = await Payment.create({
                record_id,
                amount_paid,
                payment_method,
                created_by: req.user.user_id
            });

            res.status(201).json({
                success: true,
                message: 'Payment created successfully',
                data: payment
            });
        } catch (error) {
            console.error('Create payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create payment',
                error: error.message
            });
        }
    }

    // Get payments by record ID
    static async getPaymentsByRecord(req, res) {
        try {
            const { record_id } = req.params;
            const payments = await Payment.getByRecordId(record_id);

            res.json({
                success: true,
                message: 'Payments retrieved successfully',
                data: payments
            });
        } catch (error) {
            console.error('Get payments by record error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payments',
                error: error.message
            });
        }
    }

    // Get payments by date range
    static async getPaymentsByDateRange(req, res) {
        try {
            const { date_from, date_to } = req.query;

            if (!date_from || !date_to) {
                return res.status(400).json({
                    success: false,
                    message: 'Both date_from and date_to are required'
                });
            }

            const payments = await Payment.getByDateRange(date_from, date_to);

            res.json({
                success: true,
                message: 'Payments retrieved successfully',
                data: payments
            });
        } catch (error) {
            console.error('Get payments by date range error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payments',
                error: error.message
            });
        }
    }

    // Update payment status
    static async updatePaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['pending', 'completed', 'failed'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be pending, completed, or failed'
                });
            }

            const payment = await Payment.updateStatus(id, status);

            res.json({
                success: true,
                message: 'Payment status updated successfully',
                data: payment
            });
        } catch (error) {
            console.error('Update payment status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update payment status',
                error: error.message
            });
        }
    }

    // Delete payment
    static async deletePayment(req, res) {
        try {
            const { id } = req.params;

            const payment = await Payment.findById(id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            await Payment.delete(id);

            res.json({
                success: true,
                message: 'Payment deleted successfully'
            });
        } catch (error) {
            console.error('Delete payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete payment',
                error: error.message
            });
        }
    }

    // Get payment statistics
    static async getPaymentStatistics(req, res) {
        try {
            const { date_from, date_to } = req.query;

            const stats = await Payment.getStatistics(date_from, date_to);

            res.json({
                success: true,
                message: 'Payment statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            console.error('Get payment statistics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment statistics',
                error: error.message
            });
        }
    }

    // Get daily revenue
    static async getDailyRevenue(req, res) {
        try {
            const { date } = req.params;

            if (!date || isNaN(Date.parse(date))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid date is required (YYYY-MM-DD format)'
                });
            }

            const revenue = await Payment.getDailyRevenue(date);

            res.json({
                success: true,
                message: 'Daily revenue retrieved successfully',
                data: revenue
            });
        } catch (error) {
            console.error('Get daily revenue error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get daily revenue',
                error: error.message
            });
        }
    }

    // Generate invoice/receipt
    static async generateInvoice(req, res) {
        try {
            const { id } = req.params;
            const payment = await Payment.findById(id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Calculate duration in hours and minutes
            const entryTime = new Date(payment.entry_time);
            const exitTime = new Date(payment.exit_time);
            const durationMs = exitTime - entryTime;
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

            const invoice = {
                company: {
                    name: process.env.COMPANY_NAME || 'SmartPark Rwanda',
                    location: process.env.LOCATION || 'Rubavu District, West Province, Rwanda'
                },
                payment: {
                    receipt_number: payment.receipt_number,
                    payment_date: payment.payment_date,
                    amount_paid: payment.amount_paid,
                    payment_method: payment.payment_method
                },
                parking: {
                    plate_number: payment.plate_number,
                    driver_name: payment.driver_name,
                    phone_number: payment.phone_number,
                    slot_number: payment.slot_number,
                    slot_type: payment.slot_type,
                    entry_time: payment.entry_time,
                    exit_time: payment.exit_time,
                    duration: `${hours}h ${minutes}m`,
                    total_amount: payment.total_amount
                },
                processed_by: payment.created_by_name,
                generated_at: new Date().toISOString()
            };

            res.json({
                success: true,
                message: 'Invoice generated successfully',
                data: invoice
            });
        } catch (error) {
            console.error('Generate invoice error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate invoice',
                error: error.message
            });
        }
    }
}

module.exports = PaymentController;
