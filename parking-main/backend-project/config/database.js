const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartpark',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log(' Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error(' Database connection failed:', error.message);
        return false;
    }
};

// Initialize database (create database if not exists)
const initializeDatabase = async () => {
    try {
        // Create connection without database selection
        const tempConfig = { ...dbConfig };
        delete tempConfig.database;
        const tempPool = mysql.createPool(tempConfig);

        const connection = await tempPool.getConnection();

        // Create database if it doesn't exist
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log(` Database '${dbConfig.database}' created/verified`);

        connection.release();
        await tempPool.end();

        return true;
    } catch (error) {
        console.error(' Database initialization failed:', error.message);
        return false;
    }
};

module.exports = {
    pool,
    testConnection,
    initializeDatabase,
    dbConfig
};
