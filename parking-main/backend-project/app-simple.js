const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();

// Basic middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'smartpark_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'SmartPark API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to SmartPark API',
        version: '1.0.0',
        company: 'SmartPark Rwanda',
        location: 'Rubavu District, West Province, Rwanda'
    });
});

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const { testConnection } = require('./config/database');
        const isConnected = await testConnection();
        
        res.json({
            success: isConnected,
            message: isConnected ? 'Database connected successfully' : 'Database connection failed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database test failed',
            error: error.message
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ SmartPark API is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Location: Rubavu District, West Province, Rwanda`);
    console.log(`🏢 Company: SmartPark Rwanda`);
});

module.exports = app;
