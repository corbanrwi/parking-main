const { pool } = require('../config/database');

class ParkingRecord {
    constructor(data) {
        this.record_id = data.record_id;
        this.plate_number = data.plate_number;
        this.slot_number = data.slot_number;
        this.entry_time = data.entry_time;
        this.exit_time = data.exit_time;
        this.duration_minutes = data.duration_minutes;
        this.total_amount = data.total_amount;
        this.status = data.status;
        this.created_by = data.created_by;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Get all parking records
    static async getAll() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    pr.*,
                    c.driver_name,
                    c.phone_number,
                    ps.slot_type,
                    ps.hourly_rate,
                    u.full_name as created_by_name
                FROM parking_records pr
                LEFT JOIN cars c ON pr.plate_number = c.plate_number
                LEFT JOIN parking_slots ps ON pr.slot_number = ps.slot_number
                LEFT JOIN users u ON pr.created_by = u.user_id
                ORDER BY pr.entry_time DESC
            `);
            
            return rows;
        } catch (error) {
            throw new Error(`Error getting parking records: ${error.message}`);
        }
    }

    // Get active parking records
    static async getActive() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    pr.*,
                    c.driver_name,
                    c.phone_number,
                    ps.slot_type,
                    ps.hourly_rate,
                    u.full_name as created_by_name
                FROM parking_records pr
                LEFT JOIN cars c ON pr.plate_number = c.plate_number
                LEFT JOIN parking_slots ps ON pr.slot_number = ps.slot_number
                LEFT JOIN users u ON pr.created_by = u.user_id
                WHERE pr.status = 'active'
                ORDER BY pr.entry_time DESC
            `);
            
            return rows;
        } catch (error) {
            throw new Error(`Error getting active records: ${error.message}`);
        }
    }

    // Find record by ID
    static async findById(recordId) {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    pr.*,
                    c.driver_name,
                    c.phone_number,
                    c.car_model,
                    c.car_color,
                    ps.slot_type,
                    ps.hourly_rate,
                    u.full_name as created_by_name
                FROM parking_records pr
                LEFT JOIN cars c ON pr.plate_number = c.plate_number
                LEFT JOIN parking_slots ps ON pr.slot_number = ps.slot_number
                LEFT JOIN users u ON pr.created_by = u.user_id
                WHERE pr.record_id = ?
            `, [recordId]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return rows[0];
        } catch (error) {
            throw new Error(`Error finding record: ${error.message}`);
        }
    }

    // Create new parking record (car entry)
    static async create(recordData) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const { plate_number, slot_number, created_by } = recordData;
            
            // Check if slot is available
            const [slotCheck] = await connection.execute(
                'SELECT slot_status FROM parking_slots WHERE slot_number = ?',
                [slot_number]
            );
            
            if (slotCheck.length === 0) {
                throw new Error('Slot not found');
            }
            
            if (slotCheck[0].slot_status !== 'available') {
                throw new Error('Slot is not available');
            }
            
            // Check if car is already parked
            const [carCheck] = await connection.execute(
                'SELECT COUNT(*) as count FROM parking_records WHERE plate_number = ? AND status = "active"',
                [plate_number]
            );
            
            if (carCheck[0].count > 0) {
                throw new Error('Car is already parked');
            }
            
            // Create parking record
            const [result] = await connection.execute(
                'INSERT INTO parking_records (plate_number, slot_number, created_by) VALUES (?, ?, ?)',
                [plate_number, slot_number, created_by]
            );
            
            // Update slot status to occupied
            await connection.execute(
                'UPDATE parking_slots SET slot_status = "occupied" WHERE slot_number = ?',
                [slot_number]
            );
            
            await connection.commit();
            
            return await ParkingRecord.findById(result.insertId);
        } catch (error) {
            await connection.rollback();
            throw new Error(`Error creating parking record: ${error.message}`);
        } finally {
            connection.release();
        }
    }

    // Calculate parking duration and amount
    static calculateParkingFee(entryTime, exitTime, hourlyRate) {
        const entryDate = new Date(entryTime);
        const exitDate = new Date(exitTime);
        
        const durationMs = exitDate - entryDate;
        const durationMinutes = Math.ceil(durationMs / (1000 * 60));
        const durationHours = Math.ceil(durationMinutes / 60);
        
        const totalAmount = durationHours * hourlyRate;
        
        return {
            duration_minutes: durationMinutes,
            duration_hours: durationHours,
            total_amount: totalAmount
        };
    }

    // Complete parking record (car exit)
    static async complete(recordId, exitTime = new Date()) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Get record details with slot rate
            const [recordRows] = await connection.execute(`
                SELECT pr.*, ps.hourly_rate 
                FROM parking_records pr
                JOIN parking_slots ps ON pr.slot_number = ps.slot_number
                WHERE pr.record_id = ? AND pr.status = 'active'
            `, [recordId]);
            
            if (recordRows.length === 0) {
                throw new Error('Active parking record not found');
            }
            
            const record = recordRows[0];
            
            // Calculate duration and amount
            const { duration_minutes, total_amount } = ParkingRecord.calculateParkingFee(
                record.entry_time,
                exitTime,
                record.hourly_rate
            );
            
            // Update parking record
            await connection.execute(`
                UPDATE parking_records 
                SET exit_time = ?, duration_minutes = ?, total_amount = ?, status = 'completed', updated_at = CURRENT_TIMESTAMP
                WHERE record_id = ?
            `, [exitTime, duration_minutes, total_amount, recordId]);
            
            // Update slot status to available
            await connection.execute(
                'UPDATE parking_slots SET slot_status = "available" WHERE slot_number = ?',
                [record.slot_number]
            );
            
            await connection.commit();
            
            return await ParkingRecord.findById(recordId);
        } catch (error) {
            await connection.rollback();
            throw new Error(`Error completing parking record: ${error.message}`);
        } finally {
            connection.release();
        }
    }

    // Get parking statistics
    static async getStatistics(dateFrom, dateTo) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_records,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_records,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_records,
                    SUM(total_amount) as total_revenue,
                    AVG(duration_minutes) as avg_duration_minutes
                FROM parking_records
                WHERE 1=1
            `;
            
            const params = [];
            
            if (dateFrom) {
                query += ' AND entry_time >= ?';
                params.push(dateFrom);
            }
            
            if (dateTo) {
                query += ' AND entry_time <= ?';
                params.push(dateTo);
            }
            
            const [stats] = await pool.execute(query, params);
            
            return stats[0];
        } catch (error) {
            throw new Error(`Error getting statistics: ${error.message}`);
        }
    }

    // Get daily revenue report
    static async getDailyRevenue(date) {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    DATE(entry_time) as date,
                    COUNT(*) as total_parkings,
                    SUM(total_amount) as total_revenue,
                    AVG(duration_minutes) as avg_duration
                FROM parking_records
                WHERE DATE(entry_time) = ?
                GROUP BY DATE(entry_time)
            `, [date]);
            
            return rows[0] || {
                date,
                total_parkings: 0,
                total_revenue: 0,
                avg_duration: 0
            };
        } catch (error) {
            throw new Error(`Error getting daily revenue: ${error.message}`);
        }
    }
}

module.exports = ParkingRecord;
