const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
    let connection;
    
    try {
        console.log('🚀 Starting database setup...');
        
        // Create connection without database selection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });
        
        console.log('✅ Connected to MySQL server');
        
        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME || 'smartpark_db';
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✅ Database '${dbName}' created/verified`);
        
        // Use the database
        await connection.execute(`USE ${dbName}`);
        console.log(`✅ Using database '${dbName}'`);
        
        // Read and execute schema file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSQL = await fs.readFile(schemaPath, 'utf8');
        
        // Split SQL statements and execute them
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log('📊 Creating database schema...');
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
            }
        }
        console.log('✅ Database schema created successfully');
        
        // Read and execute seed file
        const seedPath = path.join(__dirname, '../database/seed.sql');
        const seedSQL = await fs.readFile(seedPath, 'utf8');
        
        // Split SQL statements and execute them
        const seedStatements = seedSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log('🌱 Seeding database with initial data...');
        for (const statement of seedStatements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                } catch (error) {
                    // Ignore duplicate entry errors for seed data
                    if (!error.message.includes('Duplicate entry')) {
                        throw error;
                    }
                }
            }
        }
        console.log('✅ Database seeded successfully');
        
        // Verify setup by checking tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Created tables:');
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        
        // Check if admin user exists
        const [users] = await connection.execute('SELECT username, role FROM users');
        console.log('👥 Created users:');
        users.forEach(user => {
            console.log(`   - ${user.username} (${user.role})`);
        });
        
        console.log('🎉 Database setup completed successfully!');
        console.log('');
        console.log('📝 Default login credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('');
        console.log('   Username: manager1');
        console.log('   Password: admin123');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
};

// Run setup if called directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('✅ Setup completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        });
}

module.exports = setupDatabase;
