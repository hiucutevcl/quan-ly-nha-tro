require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const roomRoutes = require('./routes/roomRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const settingRoutes = require('./routes/settingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const assetIncidentRoutes = require('./routes/assetIncidentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ ảnh đã upload qua URL tĩnh
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// === AUTO-MIGRATION: Tự động tạo cột mới nếu chưa tồn tại ===
async function runMigrations() {
    const migrations = [
        { column: 'building_name', sql: `ALTER TABLE Rooms ADD COLUMN building_name VARCHAR(255) DEFAULT ''` },
        { column: 'room_address',  sql: `ALTER TABLE Rooms ADD COLUMN room_address VARCHAR(500) DEFAULT ''` },
    ];
    for (const m of migrations) {
        try {
            await db.query(m.sql);
            console.log(`✅ Migration: Đã thêm cột ${m.column}`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log(`ℹ️  Migration: Cột ${m.column} đã tồn tại`);
            } else {
                console.error(`❌ Migration lỗi ${m.column}:`, e.message);
            }
        }
    }

    // Tạo bảng RoomAssets nếu chưa có
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS RoomAssets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id INT NOT NULL,
                asset_name VARCHAR(255) NOT NULL COMMENT 'Tên đồ đạc/tài sản',
                description TEXT DEFAULT '' COMMENT 'Mô tả chi tiết',
                condition_status VARCHAR(100) DEFAULT 'Tốt' COMMENT 'Tình trạng: Tốt, Hỏng, Cần sửa',
                quantity INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Migration: Bảng RoomAssets sẵn sàng');
    } catch (e) {
        console.error('❌ Migration RoomAssets:', e.message);
    }

    // Tạo bảng RoomIncidents nếu chưa có
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS RoomIncidents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id INT NOT NULL,
                title VARCHAR(255) NOT NULL COMMENT 'Tiêu đề sự cố',
                description TEXT DEFAULT '' COMMENT 'Mô tả chi tiết sự cố',
                severity VARCHAR(50) DEFAULT 'Trung bình' COMMENT 'Mức độ: Thấp, Trung bình, Cao, Khẩn cấp',
                status VARCHAR(50) DEFAULT 'Mới' COMMENT 'Trạng thái: Mới, Đang xử lý, Đã xử lý',
                reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at DATETIME NULL,
                resolve_note TEXT DEFAULT '' COMMENT 'Ghi chú xử lý',
                FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Migration: Bảng RoomIncidents sẵn sàng');
    } catch (e) {
        console.error('❌ Migration RoomIncidents:', e.message);
    }
}

// Khai báo các Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/room-management', assetIncidentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`🚀 Server đang chạy trên port ${PORT}`);
    await runMigrations();
});
