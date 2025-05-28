const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.user_id = data.user_id;
        this.username = data.username;
        this.password = data.password;
        this.full_name = data.full_name;
        this.role = data.role;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Find user by username
    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            return new User(rows[0]);
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    // Find user by ID
    static async findById(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE user_id = ?',
                [userId]
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            return new User(rows[0]);
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    // Verify password
    async verifyPassword(password) {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (error) {
            throw new Error(`Error verifying password: ${error.message}`);
        }
    }

    // Get all users
    static async getAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT user_id, username, full_name, role, created_at FROM users ORDER BY created_at DESC'
            );
            
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error(`Error getting users: ${error.message}`);
        }
    }

    // Create new user
    static async create(userData) {
        try {
            const { username, password, full_name, role = 'manager' } = userData;
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await pool.execute(
                'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, full_name, role]
            );
            
            return await User.findById(result.insertId);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Username already exists');
            }
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // Update user
    async update(updateData) {
        try {
            const { full_name, role } = updateData;
            
            await pool.execute(
                'UPDATE users SET full_name = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                [full_name, role, this.user_id]
            );
            
            return await User.findById(this.user_id);
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    // Delete user
    async delete() {
        try {
            await pool.execute(
                'DELETE FROM users WHERE user_id = ?',
                [this.user_id]
            );
            
            return true;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // Get user without password
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

module.exports = User;
