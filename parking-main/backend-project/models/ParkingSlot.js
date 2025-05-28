const { pool } = require('../config/database');

class ParkingSlot {
    constructor(data) {
        this.slot_number = data.slot_number;
        this.slot_status = data.slot_status;
        this.slot_type = data.slot_type;
        this.hourly_rate = data.hourly_rate;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Get all parking slots
    static async getAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM parking_slots ORDER BY slot_number'
            );
            
            return rows.map(row => new ParkingSlot(row));
        } catch (error) {
            throw new Error(`Error getting parking slots: ${error.message}`);
        }
    }

    // Get available slots
    static async getAvailable() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM parking_slots WHERE slot_status = "available" ORDER BY slot_number'
            );
            
            return rows.map(row => new ParkingSlot(row));
        } catch (error) {
            throw new Error(`Error getting available slots: ${error.message}`);
        }
    }

    // Get slots by type
    static async getByType(slotType) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM parking_slots WHERE slot_type = ? ORDER BY slot_number',
                [slotType]
            );
            
            return rows.map(row => new ParkingSlot(row));
        } catch (error) {
            throw new Error(`Error getting slots by type: ${error.message}`);
        }
    }

    // Find slot by number
    static async findByNumber(slotNumber) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM parking_slots WHERE slot_number = ?',
                [slotNumber]
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            return new ParkingSlot(rows[0]);
        } catch (error) {
            throw new Error(`Error finding slot: ${error.message}`);
        }
    }

    // Update slot status
    static async updateStatus(slotNumber, status) {
        try {
            const [result] = await pool.execute(
                'UPDATE parking_slots SET slot_status = ?, updated_at = CURRENT_TIMESTAMP WHERE slot_number = ?',
                [status, slotNumber]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('Slot not found');
            }
            
            return await ParkingSlot.findByNumber(slotNumber);
        } catch (error) {
            throw new Error(`Error updating slot status: ${error.message}`);
        }
    }

    // Create new parking slot
    static async create(slotData) {
        try {
            const { slot_number, slot_type = 'regular', hourly_rate = 1000.00 } = slotData;
            
            await pool.execute(
                'INSERT INTO parking_slots (slot_number, slot_type, hourly_rate) VALUES (?, ?, ?)',
                [slot_number, slot_type, hourly_rate]
            );
            
            return await ParkingSlot.findByNumber(slot_number);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Slot number already exists');
            }
            throw new Error(`Error creating slot: ${error.message}`);
        }
    }

    // Update slot details
    async update(updateData) {
        try {
            const { slot_type, hourly_rate } = updateData;
            
            await pool.execute(
                'UPDATE parking_slots SET slot_type = ?, hourly_rate = ?, updated_at = CURRENT_TIMESTAMP WHERE slot_number = ?',
                [slot_type, hourly_rate, this.slot_number]
            );
            
            return await ParkingSlot.findByNumber(this.slot_number);
        } catch (error) {
            throw new Error(`Error updating slot: ${error.message}`);
        }
    }

    // Delete slot
    async delete() {
        try {
            // Check if slot is currently occupied
            const [activeRecords] = await pool.execute(
                'SELECT COUNT(*) as count FROM parking_records WHERE slot_number = ? AND status = "active"',
                [this.slot_number]
            );
            
            if (activeRecords[0].count > 0) {
                throw new Error('Cannot delete slot with active parking records');
            }
            
            await pool.execute(
                'DELETE FROM parking_slots WHERE slot_number = ?',
                [this.slot_number]
            );
            
            return true;
        } catch (error) {
            throw new Error(`Error deleting slot: ${error.message}`);
        }
    }

    // Get slot statistics
    static async getStatistics() {
        try {
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_slots,
                    SUM(CASE WHEN slot_status = 'available' THEN 1 ELSE 0 END) as available_slots,
                    SUM(CASE WHEN slot_status = 'occupied' THEN 1 ELSE 0 END) as occupied_slots,
                    SUM(CASE WHEN slot_status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_slots,
                    SUM(CASE WHEN slot_type = 'regular' THEN 1 ELSE 0 END) as regular_slots,
                    SUM(CASE WHEN slot_type = 'vip' THEN 1 ELSE 0 END) as vip_slots,
                    SUM(CASE WHEN slot_type = 'disabled' THEN 1 ELSE 0 END) as disabled_slots
                FROM parking_slots
            `);
            
            return stats[0];
        } catch (error) {
            throw new Error(`Error getting slot statistics: ${error.message}`);
        }
    }
}

module.exports = ParkingSlot;
