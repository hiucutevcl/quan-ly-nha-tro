-- Tạo Database
CREATE DATABASE IF NOT EXISTS nha_tro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nha_tro_db;

-- 1. Bảng Users (Người dùng: Admin hoặc Người thuê)
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Sẽ lưu mật khẩu đã mã hóa (bcrypt hash)
    role ENUM('Admin', 'Tenant') NOT NULL DEFAULT 'Tenant',
    full_name VARCHAR(100) NOT NULL
);

-- 2. Bảng Rooms (Phòng trọ)
CREATE TABLE Rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- Tiền phòng cơ bản
    status ENUM('Available', 'Occupied') NOT NULL DEFAULT 'Available',
    tenant_id INT NULL, -- ID của người đang thuê phòng
    FOREIGN KEY (tenant_id) REFERENCES Users(id) ON DELETE SET NULL
);

-- 3. Bảng Invoices (Hóa đơn - Bảng quan trọng nhất)
CREATE TABLE Invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    month_year VARCHAR(10) NOT NULL, -- Ví dụ: '10-2023'
    old_elec INT NOT NULL DEFAULT 0,
    new_elec INT NOT NULL,
    old_water INT NOT NULL DEFAULT 0,
    new_water INT NOT NULL,
    room_fee DECIMAL(10,2) NOT NULL,
    elec_fee DECIMAL(10,2) NOT NULL,
    water_fee DECIMAL(10,2) NOT NULL,
    old_debt DECIMAL(10,2) NOT NULL DEFAULT 0, -- Tiền nợ cũ cộng dồn
    total_amount DECIMAL(10,2) NOT NULL, -- Tổng tiền phải thanh toán tháng này
    is_paid BOOLEAN NOT NULL DEFAULT FALSE, -- Trạng thái: 0(Chưa đóng), 1(Đã đóng)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
);

-- ==========================================
-- DỮ LIỆU MẪU (Mock Data) ĐỂ TEST
-- Mật khẩu mặt định cho cả 2 account là: 123456
-- (Đã được mã hoá bằng bcrypt: $2b$10$x... hash của '123456')
-- ==========================================

INSERT INTO Users (username, password, role, full_name) VALUES
('admin', '$2b$10$w4C36A5SMyIfXOfc8JcPxOWeJbU/9a6N22z.T8gOTpQpL.oE8q8Pq', 'Admin', 'Chủ Trọ Nguyễn Văn A'),
('tenant1', '$2b$10$w4C36A5SMyIfXOfc8JcPxOWeJbU/9a6N22z.T8gOTpQpL.oE8q8Pq', 'Tenant', 'Người Thuê Trần Văn B');

INSERT INTO Rooms (room_name, price, status, tenant_id) VALUES
('Phòng 101', 2000000, 'Occupied', 2),
('Phòng 102', 2500000, 'Available', NULL);

-- Hóa đơn mẫu: Tháng 09-2023 phòng 101 chưa thanh toán
INSERT INTO Invoices (room_id, month_year, old_elec, new_elec, old_water, new_water, room_fee, elec_fee, water_fee, old_debt, total_amount, is_paid) VALUES
(1, '09-2023', 0, 100, 0, 10, 2000000, 350000, 200000, 0, 2550000, FALSE);
