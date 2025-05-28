-- SmartPark Initial Data
USE smartpark_db;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, full_name, role) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin'),
('manager1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Parking Manager', 'manager');

-- Insert parking slots (A1-A10, B1-B10, C1-C5 VIP, D1-D3 Disabled)
INSERT INTO parking_slots (slot_number, slot_status, slot_type, hourly_rate) VALUES 
-- Regular slots - Section A
('A1', 'available', 'regular', 1000.00),
('A2', 'available', 'regular', 1000.00),
('A3', 'available', 'regular', 1000.00),
('A4', 'available', 'regular', 1000.00),
('A5', 'available', 'regular', 1000.00),
('A6', 'available', 'regular', 1000.00),
('A7', 'available', 'regular', 1000.00),
('A8', 'available', 'regular', 1000.00),
('A9', 'available', 'regular', 1000.00),
('A10', 'available', 'regular', 1000.00),

-- Regular slots - Section B
('B1', 'available', 'regular', 1000.00),
('B2', 'available', 'regular', 1000.00),
('B3', 'available', 'regular', 1000.00),
('B4', 'available', 'regular', 1000.00),
('B5', 'available', 'regular', 1000.00),
('B6', 'available', 'regular', 1000.00),
('B7', 'available', 'regular', 1000.00),
('B8', 'available', 'regular', 1000.00),
('B9', 'available', 'regular', 1000.00),
('B10', 'available', 'regular', 1000.00),

-- VIP slots - Section C (higher rate)
('C1', 'available', 'vip', 2000.00),
('C2', 'available', 'vip', 2000.00),
('C3', 'available', 'vip', 2000.00),
('C4', 'available', 'vip', 2000.00),
('C5', 'available', 'vip', 2000.00),

-- Disabled slots - Section D (same rate as regular)
('D1', 'available', 'disabled', 1000.00),
('D2', 'available', 'disabled', 1000.00),
('D3', 'available', 'disabled', 1000.00);

-- Sample cars for testing
INSERT INTO cars (plate_number, driver_name, phone_number, car_model, car_color) VALUES 
('RAA 001 A', 'Jean Baptiste', '+250788123456', 'Toyota Corolla', 'White'),
('RAB 002 B', 'Marie Claire', '+250788234567', 'Honda Civic', 'Blue'),
('RAC 003 C', 'Emmanuel Nkusi', '+250788345678', 'Nissan Sentra', 'Black');

-- Sample parking records for testing (some active, some completed)
INSERT INTO parking_records (plate_number, slot_number, entry_time, exit_time, duration_minutes, total_amount, status, created_by) VALUES 
('RAA 001 A', 'A1', '2025-01-20 08:00:00', '2025-01-20 12:00:00', 240, 4000.00, 'completed', 1),
('RAB 002 B', 'B5', '2025-01-20 14:30:00', NULL, 0, 0.00, 'active', 1);

-- Sample payments for completed records
INSERT INTO payments (record_id, amount_paid, payment_method, receipt_number, created_by) VALUES 
(1, 4000.00, 'cash', 'RCP-20250120-001', 1);
