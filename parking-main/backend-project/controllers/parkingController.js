const ParkingRecord = require('../models/ParkingRecord');
const Car = require('../models/Car');
const ParkingSlot = require('../models/ParkingSlot');

class ParkingController {
    // Get all parking records
    static async getAllRecords(req, res) {
        try {
            const records = await ParkingRecord.getAll();
            
            res.json({
                success: true,
                message: 'Parking records retrieved successfully',
                data: records
            });
        } catch (error) {
            console.error('Get all records error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get parking records',
                error: error.message
            });
        }
    }

    // Get active parking records
    static async getActiveRecords(req, res) {
        try {
            const records = await ParkingRecord.getActive();
            
            res.json({
                success: true,
                message: 'Active parking records retrieved successfully',
                data: records
            });
        } catch (error) {
            console.error('Get active records error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get active parking records',
                error: error.message
            });
        }
    }

    // Get parking record by ID
    static async getRecordById(req, res) {
        try {
            const { id } = req.params;
            const record = await ParkingRecord.findById(id);
            
            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Parking record not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Parking record retrieved successfully',
                data: record
            });
        } catch (error) {
            console.error('Get record by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get parking record',
                error: error.message
            });
        }
    }

    // Car entry (create parking record)
    static async carEntry(req, res) {
        try {
            const { plate_number, slot_number, driver_name, phone_number, car_model, car_color } = req.body;
            
            // Check if car exists, if not create it
            let car = await Car.findByPlateNumber(plate_number);
            
            if (!car) {
                if (!driver_name || !phone_number) {
                    return res.status(400).json({
                        success: false,
                        message: 'Driver name and phone number are required for new cars'
                    });
                }
                
                car = await Car.create({
                    plate_number,
                    driver_name,
                    phone_number,
                    car_model,
                    car_color
                });
            }
            
            // Create parking record
            const record = await ParkingRecord.create({
                plate_number,
                slot_number,
                created_by: req.user.user_id
            });
            
            res.status(201).json({
                success: true,
                message: 'Car entry recorded successfully',
                data: record
            });
            
        } catch (error) {
            console.error('Car entry error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to record car entry',
                error: error.message
            });
        }
    }

    // Car exit (complete parking record)
    static async carExit(req, res) {
        try {
            const { id } = req.params;
            const { exit_time } = req.body;
            
            const exitDateTime = exit_time ? new Date(exit_time) : new Date();
            
            const record = await ParkingRecord.complete(id, exitDateTime);
            
            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Active parking record not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Car exit recorded successfully',
                data: record
            });
            
        } catch (error) {
            console.error('Car exit error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to record car exit',
                error: error.message
            });
        }
    }

    // Get parking statistics
    static async getStatistics(req, res) {
        try {
            const { date_from, date_to } = req.query;
            
            const stats = await ParkingRecord.getStatistics(date_from, date_to);
            
            res.json({
                success: true,
                message: 'Parking statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get parking statistics',
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
            
            const revenue = await ParkingRecord.getDailyRevenue(date);
            
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

    // Search parking records
    static async searchRecords(req, res) {
        try {
            const { plate_number, slot_number, status, date_from, date_to } = req.query;
            
            let query = `
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
                WHERE 1=1
            `;
            
            const params = [];
            
            if (plate_number) {
                query += ' AND pr.plate_number LIKE ?';
                params.push(`%${plate_number}%`);
            }
            
            if (slot_number) {
                query += ' AND pr.slot_number = ?';
                params.push(slot_number);
            }
            
            if (status) {
                query += ' AND pr.status = ?';
                params.push(status);
            }
            
            if (date_from) {
                query += ' AND DATE(pr.entry_time) >= ?';
                params.push(date_from);
            }
            
            if (date_to) {
                query += ' AND DATE(pr.entry_time) <= ?';
                params.push(date_to);
            }
            
            query += ' ORDER BY pr.entry_time DESC';
            
            const { pool } = require('../config/database');
            const [rows] = await pool.execute(query, params);
            
            res.json({
                success: true,
                message: 'Search results retrieved successfully',
                data: rows
            });
            
        } catch (error) {
            console.error('Search records error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search parking records',
                error: error.message
            });
        }
    }

    // Get dashboard data
    static async getDashboard(req, res) {
        try {
            // Get current statistics
            const today = new Date().toISOString().split('T')[0];
            
            const [
                todayStats,
                slotStats,
                activeRecords,
                recentRecords
            ] = await Promise.all([
                ParkingRecord.getDailyRevenue(today),
                ParkingSlot.getStatistics(),
                ParkingRecord.getActive(),
                ParkingRecord.getAll()
            ]);
            
            // Get recent records (last 10)
            const recent = recentRecords.slice(0, 10);
            
            res.json({
                success: true,
                message: 'Dashboard data retrieved successfully',
                data: {
                    today_revenue: todayStats,
                    slot_statistics: slotStats,
                    active_parkings: activeRecords.length,
                    recent_records: recent,
                    active_records: activeRecords
                }
            });
            
        } catch (error) {
            console.error('Get dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get dashboard data',
                error: error.message
            });
        }
    }
}

module.exports = ParkingController;
