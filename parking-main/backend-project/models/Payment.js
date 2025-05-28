const { pool } = require('../config/database');

class Payment {
    constructor(data) {
        this.payment_id = data.payment_id;
        this.record_id = data.record_id;
        this.amount_paid = data.amount_paid;
        this.payment_date = data.payment_date;
        this.payment_method = data.payment_method;
        this.payment_status = data.payment_status;
        this.receipt_number = data.receipt_number;
        this.created_by = data.created_by;
        this.created_at = data.created_at;
    }

    // Generate receipt number
    static generateReceiptNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const timestamp = Date.now().toString().slice(-6);

        return `RCP-${year}${month}${day}-${timestamp}`;
    }

    // Get all payments
    static async getAll() {
        try {
            const [rows] = await pool.execute(`
                SELECT
                    p.*,
                    pr.plate_number,
                    pr.slot_number,
                    pr.entry_time,
                    pr.exit_time,
                    pr.total_amount,
                    c.driver_name,
                    c.phone_number,
                    u.full_name as created_by_name
                FROM payments p
                LEFT JOIN parking_records pr ON p.record_id = pr.record_id
                LEFT JOIN cars c ON pr.plate_number = c.plate_number
                LEFT JOIN users u ON p.created_by = u.user_id
                ORDER BY p.payment_date DESC
            `);

            return rows;
        } catch (error) {
            throw new Error(`Error getting payments: ${error.message}`);
        }
    }

    // Find payment by ID
    static async findById(paymentId) {
        try {
            const [rows] = await pool.execute(`
                SELECT
                    p.*,
                    pr.plate_number,
                    pr.slot_number,
                    pr.entry_time,
                    pr.exit_time,
                    pr.total_amount,
                    c.driver_name,
                    c.phone_number,
                    c.car_model,
                    c.car_color,
                    ps.slot_type,
                    u.full_name as created_by_name
                FROM payments p
                LEFT JOIN parking_records pr ON p.record_id = pr.record_id
                LEFT JOIN cars c ON pr.plate_number = c.plate_number
                LEFT JOIN parking_slots ps ON pr.slot_number = ps.slot_number
                LEFT JOIN users u ON p.created_by = u.user_id
                WHERE p.payment_id = ?
            `, [paymentId]);

            if (rows.length === 0) {
                return null;
            }

            return rows[0];
        } catch (error) {
            throw new Error(`Error finding payment: ${error.message}`);
        }
    }

    // Find payment by receipt number
    static async findByReceiptNumber(receiptNumber) {
        try {
            const [rows] = await pool.execute(`
                SELECT
                    p.*,
                    pr.plate_number,
                    pr.slot_number,
                    pr.entry_time,
                    pr.exit_time,
                    pr.total_amount,
                    c.driver_name,
                    c.phone_number
                FROM payments p
                LEFT JOIN parking_records pr ON p.record_id = pr.record_id
                LEFT JOIN cars c ON pr.plate_number = c.plate_number
                WHERE p.receipt_number = ?
            `, [receiptNumber]);

            if (rows.length === 0) {
                return null;
            }

            return rows[0];
        } catch (error) {
            throw new Error(`Error finding payment by receipt: ${error.message}`);
        }
    }

    // Create new payment
    static async create(paymentData) {
        try {
            const {
                record_id,
                amount_paid,
                payment_method = 'cash',
                created_by
            } = paymentData;

            // Generate receipt number
            const receipt_number = Payment.generateReceiptNumber();

            // Check if record exists and get total amount
            const [recordRows] = await pool.execute(
                'SELECT total_amount FROM parking_records WHERE record_id = ?',
                [record_id]
            );

            if (recordRows.length === 0) {
                throw new Error('Parking record not found');
            }

            const totalAmount = recordRows[0].total_amount;

            // Validate payment amount
            if (amount_paid < totalAmount) {
                throw new Error('Payment amount is less than total amount due');
            }

            const [result] = await pool.execute(`
                INSERT INTO payments (record_id, amount_paid, payment_method, receipt_number, created_by)
                VALUES (?, ?, ?, ?, ?)
            `, [record_id, amount_paid, payment_method, receipt_number, created_by]);

            return await Payment.findById(result.insertId);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Receipt number already exists');
            }
            throw new Error(`Error creating payment: ${error.message}`);
        }
    }

    // Get payments by record ID
    static async getByRecordId(recordId) {
        try {
            const [rows] = await pool.execute(`
                SELECT
                    p.*,
                    u.full_name as created_by_name
                FROM payments p
                LEFT JOIN users u ON p.created_by = u.user_id
                WHERE p.record_id = ?
                ORDER BY p.payment_date DESC
            `, [recordId]);

            return rows;
        } catch (error) {
            throw new Error(`Error getting payments by record: ${error.message}`);
        }
    }

    // Get payments by date range
    static async getByDateRange(dateFrom, dateTo) {
        try {
            const [rows] = await pool.execute(`
                SELECT
                    p.*,
                    pr.plate_number,
                    pr.slot_number,
                    c.driver_name,
                    u.full_name as created_by_name
                FROM payments p
                LEFT JOIN parking_records pr ON p.record_id = pr.record_id
                LEFT JOIN cars c ON pr.plate_number = c.plate_number
                LEFT JOIN users u ON p.created_by = u.user_id
                WHERE DATE(p.payment_date) BETWEEN ? AND ?
                ORDER BY p.payment_date DESC
            `, [dateFrom, dateTo]);

            return rows;
        } catch (error) {
            throw new Error(`Error getting payments by date range: ${error.message}`);
        }
    }

    // Update payment status
    static async updateStatus(paymentId, status) {
        try {
            const [result] = await pool.execute(
                'UPDATE payments SET payment_status = ? WHERE payment_id = ?',
                [status, paymentId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Payment not found');
            }

            return await Payment.findById(paymentId);
        } catch (error) {
            throw new Error(`Error updating payment status: ${error.message}`);
        }
    }

    // Delete payment
    static async delete(paymentId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM payments WHERE payment_id = ?',
                [paymentId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Payment not found');
            }

            return true;
        } catch (error) {
            throw new Error(`Error deleting payment: ${error.message}`);
        }
    }

    // Get payment statistics
    static async getStatistics(dateFrom, dateTo) {
        try {
            let query = `
                SELECT
                    COUNT(*) as total_payments,
                    SUM(amount_paid) as total_amount,
                    AVG(amount_paid) as average_amount,
                    SUM(CASE WHEN payment_method = 'cash' THEN amount_paid ELSE 0 END) as cash_payments,
                    SUM(CASE WHEN payment_method = 'card' THEN amount_paid ELSE 0 END) as card_payments,
                    SUM(CASE WHEN payment_method = 'mobile_money' THEN amount_paid ELSE 0 END) as mobile_payments
                FROM payments
                WHERE payment_status = 'completed'
            `;

            const params = [];

            if (dateFrom) {
                query += ' AND DATE(payment_date) >= ?';
                params.push(dateFrom);
            }

            if (dateTo) {
                query += ' AND DATE(payment_date) <= ?';
                params.push(dateTo);
            }

            const [stats] = await pool.execute(query, params);

            return stats[0];
        } catch (error) {
            throw new Error(`Error getting payment statistics: ${error.message}`);
        }
    }

    // Get daily revenue
    static async getDailyRevenue(date) {
        try {
            const [rows] = await pool.execute(`
                SELECT
                    DATE(payment_date) as date,
                    COUNT(*) as total_payments,
                    SUM(amount_paid) as total_revenue,
                    payment_method,
                    COUNT(*) as method_count
                FROM payments
                WHERE DATE(payment_date) = ? AND payment_status = 'completed'
                GROUP BY DATE(payment_date), payment_method
            `, [date]);

            return rows;
        } catch (error) {
            throw new Error(`Error getting daily revenue: ${error.message}`);
        }
    }
}

module.exports = Payment;
