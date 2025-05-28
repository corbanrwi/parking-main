const { pool } = require('../config/database');

class Car {
    constructor(data) {
        this.plate_number = data.plate_number;
        this.driver_name = data.driver_name;
        this.phone_number = data.phone_number;
        this.car_model = data.car_model;
        this.car_color = data.car_color;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Get all cars
    static async getAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM cars ORDER BY created_at DESC'
            );
            
            return rows.map(row => new Car(row));
        } catch (error) {
            throw new Error(`Error getting cars: ${error.message}`);
        }
    }

    // Find car by plate number
    static async findByPlateNumber(plateNumber) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM cars WHERE plate_number = ?',
                [plateNumber]
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Car(rows[0]);
        } catch (error) {
            throw new Error(`Error finding car: ${error.message}`);
        }
    }

    // Find cars by driver name
    static async findByDriverName(driverName) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM cars WHERE driver_name LIKE ? ORDER BY driver_name',
                [`%${driverName}%`]
            );
            
            return rows.map(row => new Car(row));
        } catch (error) {
            throw new Error(`Error finding cars by driver: ${error.message}`);
        }
    }

    // Find cars by phone number
    static async findByPhoneNumber(phoneNumber) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM cars WHERE phone_number = ?',
                [phoneNumber]
            );
            
            return rows.map(row => new Car(row));
        } catch (error) {
            throw new Error(`Error finding cars by phone: ${error.message}`);
        }
    }

    // Create new car
    static async create(carData) {
        try {
            const { plate_number, driver_name, phone_number, car_model, car_color } = carData;
            
            await pool.execute(
                'INSERT INTO cars (plate_number, driver_name, phone_number, car_model, car_color) VALUES (?, ?, ?, ?, ?)',
                [plate_number, driver_name, phone_number, car_model, car_color]
            );
            
            return await Car.findByPlateNumber(plate_number);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Car with this plate number already exists');
            }
            throw new Error(`Error creating car: ${error.message}`);
        }
    }

    // Update car details
    async update(updateData) {
        try {
            const { driver_name, phone_number, car_model, car_color } = updateData;
            
            await pool.execute(
                'UPDATE cars SET driver_name = ?, phone_number = ?, car_model = ?, car_color = ?, updated_at = CURRENT_TIMESTAMP WHERE plate_number = ?',
                [driver_name, phone_number, car_model, car_color, this.plate_number]
            );
            
            return await Car.findByPlateNumber(this.plate_number);
        } catch (error) {
            throw new Error(`Error updating car: ${error.message}`);
        }
    }

    // Delete car
    async delete() {
        try {
            // Check if car has active parking records
            const [activeRecords] = await pool.execute(
                'SELECT COUNT(*) as count FROM parking_records WHERE plate_number = ? AND status = "active"',
                [this.plate_number]
            );
            
            if (activeRecords[0].count > 0) {
                throw new Error('Cannot delete car with active parking records');
            }
            
            await pool.execute(
                'DELETE FROM cars WHERE plate_number = ?',
                [this.plate_number]
            );
            
            return true;
        } catch (error) {
            throw new Error(`Error deleting car: ${error.message}`);
        }
    }

    // Get car parking history
    async getParkingHistory() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    pr.*,
                    ps.slot_type,
                    ps.hourly_rate,
                    p.amount_paid,
                    p.payment_method,
                    p.payment_date
                FROM parking_records pr
                LEFT JOIN parking_slots ps ON pr.slot_number = ps.slot_number
                LEFT JOIN payments p ON pr.record_id = p.record_id
                WHERE pr.plate_number = ?
                ORDER BY pr.entry_time DESC
            `, [this.plate_number]);
            
            return rows;
        } catch (error) {
            throw new Error(`Error getting parking history: ${error.message}`);
        }
    }

    // Check if car is currently parked
    async isCurrentlyParked() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM parking_records WHERE plate_number = ? AND status = "active"',
                [this.plate_number]
            );
            
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Error checking parking status: ${error.message}`);
        }
    }

    // Search cars with filters
    static async search(filters) {
        try {
            let query = 'SELECT * FROM cars WHERE 1=1';
            const params = [];
            
            if (filters.plate_number) {
                query += ' AND plate_number LIKE ?';
                params.push(`%${filters.plate_number}%`);
            }
            
            if (filters.driver_name) {
                query += ' AND driver_name LIKE ?';
                params.push(`%${filters.driver_name}%`);
            }
            
            if (filters.phone_number) {
                query += ' AND phone_number LIKE ?';
                params.push(`%${filters.phone_number}%`);
            }
            
            query += ' ORDER BY created_at DESC';
            
            const [rows] = await pool.execute(query, params);
            return rows.map(row => new Car(row));
        } catch (error) {
            throw new Error(`Error searching cars: ${error.message}`);
        }
    }
}

module.exports = Car;
