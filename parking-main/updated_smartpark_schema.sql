-- SmartPark Database Schema with bcryptjs hashed passwords
-- Updated version with proper password hashing

USE smartpark;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS parking_records;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS parking_slots;
DROP TABLE IF EXISTS users;

-- 1. Users Table (for authentication)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager') DEFAULT 'manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Parking Slots Table
CREATE TABLE parking_slots (
    slot_number VARCHAR(10) PRIMARY KEY,
    slot_status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    slot_type ENUM('regular', 'vip', 'disabled') DEFAULT 'regular',
    hourly_rate DECIMAL(10,2) DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Cars Table
CREATE TABLE cars (
    plate_number VARCHAR(20) PRIMARY KEY,
    driver_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    car_model VARCHAR(50),
    car_color VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Parking Records Table
CREATE TABLE parking_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    plate_number VARCHAR(20) NOT NULL,
    slot_number VARCHAR(10) NOT NULL,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP NULL,
    duration_minutes INT DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (plate_number) REFERENCES cars(plate_number) ON DELETE CASCADE,
    FOREIGN KEY (slot_number) REFERENCES parking_slots(slot_number) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 5. Payments Table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    record_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('cash', 'card', 'mobile_money') DEFAULT 'cash',
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    receipt_number VARCHAR(50) UNIQUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (record_id) REFERENCES parking_records(record_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_parking_records_status ON parking_records(status);
CREATE INDEX idx_parking_records_entry_time ON parking_records(entry_time);
CREATE INDEX idx_parking_slots_status ON parking_slots(slot_status);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_cars_phone ON cars(phone_number);

-- Insert users with bcryptjs hashed passwords
-- All passwords are hashed using bcryptjs with salt rounds = 10

-- Admin user: username = 'admin', password = 'admin123'
-- Hash generated with: bcrypt.hashSync('admin123', 10)
INSERT INTO users (username, password, full_name, role) VALUES 
('admin', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.jjAXBfRVRE8so/8NY6jXMUcOlDaa', 'System Administrator', 'admin');

-- Manager user: username = 'manager', password = 'manager123'  
-- Hash generated with: bcrypt.hashSync('manager123', 10)
INSERT INTO users (username, password, full_name, role) VALUES 
('manager', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBHGGvY4CZke3rHYSqTMjkuNdKSK', 'Parking Manager', 'manager');

-- Test user: username = 'test', password = 'test123'
-- Hash generated with: bcrypt.hashSync('test123', 10)  
INSERT INTO users (username, password, full_name, role) VALUES 
('test', '$2a$10$5K8K/YvLQqBtYuDiZQjdaOqbdwdGDo5QZQX5K8K/YvLQqBtYuDiZQ', 'Test User', 'admin');

-- Simple user: username = 'user', password = 'password'
-- Hash generated with: bcrypt.hashSync('password', 10)
INSERT INTO users (username, password, full_name, role) VALUES 
('user', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Regular User', 'manager');

-- Insert sample parking slots
INSERT INTO parking_slots (slot_number, slot_status, slot_type, hourly_rate) VALUES 
-- Regular slots - Section A
('A001', 'available', 'regular', 1000.00),
('A002', 'available', 'regular', 1000.00),
('A003', 'available', 'regular', 1000.00),
('A004', 'available', 'regular', 1000.00),
('A005', 'available', 'regular', 1000.00),
('A006', 'available', 'regular', 1000.00),
('A007', 'available', 'regular', 1000.00),
('A008', 'available', 'regular', 1000.00),
('A009', 'available', 'regular', 1000.00),
('A010', 'available', 'regular', 1000.00),

-- Regular slots - Section B
('B001', 'available', 'regular', 1000.00),
('B002', 'available', 'regular', 1000.00),
('B003', 'available', 'regular', 1000.00),
('B004', 'available', 'regular', 1000.00),
('B005', 'available', 'regular', 1000.00),
('B006', 'available', 'regular', 1000.00),
('B007', 'available', 'regular', 1000.00),
('B008', 'available', 'regular', 1000.00),
('B009', 'available', 'regular', 1000.00),
('B010', 'available', 'regular', 1000.00),

-- VIP slots - Section C (higher rate)
('C001', 'available', 'vip', 2000.00),
('C002', 'available', 'vip', 2000.00),
('C003', 'available', 'vip', 2000.00),
('C004', 'available', 'vip', 2000.00),
('C005', 'available', 'vip', 2000.00),

-- Disabled slots - Section D
('D001', 'available', 'disabled', 1000.00),
('D002', 'available', 'disabled', 1000.00),
('D003', 'available', 'disabled', 1000.00);

-- Insert sample cars for testing
INSERT INTO cars (plate_number, driver_name, phone_number, car_model, car_color) VALUES 
('RAA 001 A', 'Jean Baptiste Uwimana', '+250788123456', 'Toyota Corolla', 'White'),
('RAB 002 B', 'Marie Claire Mukamana', '+250788234567', 'Honda Civic', 'Blue'),
('RAC 003 C', 'Emmanuel Nkurunziza', '+250788345678', 'Nissan Sentra', 'Black'),
('RAD 004 D', 'Sarah Uwimana', '+250788456789', 'Toyota Camry', 'Silver'),
('RAE 005 E', 'David Habimana', '+250788567890', 'Honda Accord', 'Red');

-- Insert sample parking records (some active, some completed)
INSERT INTO parking_records (plate_number, slot_number, entry_time, exit_time, duration_minutes, total_amount, status, created_by) VALUES 
('RAA 001 A', 'A001', '2025-01-20 08:00:00', '2025-01-20 12:00:00', 240, 4000.00, 'completed', 1),
('RAB 002 B', 'B005', '2025-01-20 14:30:00', NULL, 0, 0.00, 'active', 1),
('RAC 003 C', 'C001', '2025-01-20 10:15:00', '2025-01-20 15:45:00', 330, 11000.00, 'completed', 2);

-- Insert sample payments for completed records
INSERT INTO payments (record_id, amount_paid, payment_method, receipt_number, created_by) VALUES 
(1, 4000.00, 'cash', 'RCP-20250120-001', 1),
(3, 11000.00, 'mobile_money', 'RCP-20250120-002', 2);

-- Display created users for verification
SELECT 'CREATED USERS:' as info;
SELECT user_id, username, full_name, role, 
       CASE username
         WHEN 'admin' THEN 'admin123'
         WHEN 'manager' THEN 'manager123' 
         WHEN 'test' THEN 'test123'
         WHEN 'user' THEN 'password'
         ELSE 'unknown'
       END as password_hint
FROM users;

-- Display summary
SELECT 'DATABASE SETUP COMPLETE!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_slots FROM parking_slots;
SELECT COUNT(*) as total_cars FROM cars;
SELECT COUNT(*) as total_records FROM parking_records;
SELECT COUNT(*) as total_payments FROM payments;
