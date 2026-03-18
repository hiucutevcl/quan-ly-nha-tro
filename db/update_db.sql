ALTER TABLE Rooms
ADD COLUMN start_date DATE NULL COMMENT 'Ngày bắt đầu hợp đồng',
ADD COLUMN end_date DATE NULL COMMENT 'Ngày kết thúc hợp đồng';

-- Bảng lưu trữ Cấu hình Giá Dịch Vụ cố định (Rác, Wifi, Gửi xe)
CREATE TABLE IF NOT EXISTS Services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL COMMENT 'Tên dịch vụ (Rác, Wifi, Gửi xe, v.v.)',
    price DECIMAL(10, 2) NOT NULL COMMENT 'Giá tiền mặc định',
    unit VARCHAR(50) NOT NULL COMMENT 'Đơn vị tính (Tháng, Chiếc, Khối...)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sẵn 3 dịch vụ cơ bản
INSERT INTO Services (service_name, price, unit) VALUES
('Rác thải', 30000, 'Tháng'),
('Internet Wifi', 100000, 'Tháng'),
('Gửi xe máy', 150000, 'Chiếc');

-- Chỉnh sửa Hóa đơn (Invoices) để chèn thêm Phí dịch vụ phụ
ALTER TABLE Invoices
ADD COLUMN trash_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'Tiền rác',
ADD COLUMN wifi_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'Tiền mạng',
ADD COLUMN parking_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'Tiền gửi xe (số lượng * đơn giá)',
ADD COLUMN parking_count INT DEFAULT 0 COMMENT 'Số lượng xe gửi';

-- Thêm diện tích và tầng/vị trí vào bảng Rooms
ALTER TABLE Rooms
ADD COLUMN IF NOT EXISTS area DECIMAL(7,2) NULL COMMENT 'Diện tích phòng (m²)',
ADD COLUMN IF NOT EXISTS floor VARCHAR(50) NULL COMMENT 'Tầng / Vị trí phòng';
