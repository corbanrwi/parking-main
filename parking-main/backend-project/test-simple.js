// Simple test to check if basic modules work
console.log('Testing basic modules...');

try {
    const express = require('express');
    console.log('✅ Express loaded successfully');
    
    const mysql = require('mysql2');
    console.log('✅ MySQL2 loaded successfully');
    
    const bcrypt = require('bcryptjs');
    console.log('✅ bcryptjs loaded successfully');
    
    const cors = require('cors');
    console.log('✅ CORS loaded successfully');
    
    require('dotenv').config();
    console.log('✅ dotenv loaded successfully');
    
    console.log('🎉 All basic modules loaded successfully!');
    
    // Test basic Express app
    const app = express();
    app.get('/', (req, res) => {
        res.json({ message: 'SmartPark API Test - Working!' });
    });
    
    const PORT = 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Test server running on port ${PORT}`);
        console.log('✅ Basic Express server is working!');
        process.exit(0);
    });
    
} catch (error) {
    console.error('❌ Error loading modules:', error.message);
    process.exit(1);
}
