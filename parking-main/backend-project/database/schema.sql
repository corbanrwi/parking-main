-- SmartPark Database Schema
-- Entity Relationship Diagram Implementation

USE smartpark_db;

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
