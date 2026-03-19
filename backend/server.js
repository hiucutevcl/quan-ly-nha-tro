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
}

// Khai báo các Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`🚀 Server đang chạy trên port ${PORT}`);
    await runMigrations();
});
