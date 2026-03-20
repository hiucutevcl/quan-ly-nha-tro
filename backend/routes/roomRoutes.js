const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');
const { uploadCloud } = require('../config/cloudinary');
const db = require('../config/db');

// Các đường dẫn API công khai
router.get('/public', roomController.getPublicRooms);

// === MIGRATION: Thêm cột area và floor vào bảng Rooms (chạy 1 lần) ===
router.get('/migrate-area-floor', verifyToken, checkAdmin, async (req, res) => {
    try {
        // Kiểm tra xem cột đã tồn tại chưa
        const [columns] = await db.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Rooms'
            AND COLUMN_NAME IN ('area', 'floor')
        `);
        const existingCols = columns.map(c => c.COLUMN_NAME);
        const results = [];

        if (!existingCols.includes('area')) {
            await db.query(`ALTER TABLE Rooms ADD COLUMN area DECIMAL(7,2) NULL COMMENT 'Diện tích phòng (m²)'`);
            results.push('✅ Đã thêm cột area (m²)');
        } else {
            results.push('ℹ️ Cột area đã tồn tại, bỏ qua');
        }

        if (!existingCols.includes('floor')) {
            await db.query(`ALTER TABLE Rooms ADD COLUMN floor VARCHAR(50) NULL COMMENT 'Tầng / Vị trí phòng'`);
            results.push('✅ Đã thêm cột floor (tầng)');
        } else {
            results.push('ℹ️ Cột floor đã tồn tại, bỏ qua');
        }

        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === MIGRATION: Thêm cột building_name và room_address vào bảng Rooms ===
router.get('/migrate-building', verifyToken, checkAdmin, async (req, res) => {
    try {
        const [columns] = await db.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Rooms'
            AND COLUMN_NAME IN ('building_name', 'room_address')
        `);
        const existingCols = columns.map(c => c.COLUMN_NAME);
        const results = [];

        if (!existingCols.includes('building_name')) {
            await db.query(`ALTER TABLE Rooms ADD COLUMN building_name VARCHAR(255) DEFAULT ''`);
            results.push('✅ Đã thêm cột building_name');
        } else {
            results.push('ℹ️ Cột building_name đã tồn tại');
        }

        if (!existingCols.includes('room_address')) {
            await db.query(`ALTER TABLE Rooms ADD COLUMN room_address VARCHAR(500) DEFAULT ''`);
            results.push('✅ Đã thêm cột room_address');
        } else {
            results.push('ℹ️ Cột room_address đã tồn tại');
        }

        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Các đường dẫn API bảo mật (Admin)
router.get('/all', verifyToken, checkAdmin, roomController.getAllRooms);
router.post('/add', verifyToken, checkAdmin, roomController.createRoom);
router.put('/update/:id', verifyToken, checkAdmin, roomController.updateRoomPrice);
router.delete('/delete/:id', verifyToken, checkAdmin, roomController.deleteRoom);

// Gán / Trả phòng
router.post('/assign/:id', verifyToken, checkAdmin, roomController.assignTenant);

// Cập nhật chỉ số đồng hồ điện/nước
router.put('/meter/:id', verifyToken, checkAdmin, roomController.updateMeterReadings);

// Upload ảnh phòng (tối đa 5 ảnh) với xử lý lỗi Multer/Cloudinary
router.post('/upload-image/:id', verifyToken, checkAdmin, (req, res, next) => {
    const upload = uploadCloud.array('images', 5);
    upload(req, res, function (err) {
        if (err) {
            console.error('Multer/Cloudinary upload error:', err);
            return res.status(400).json({ 
                message: 'Không thể upload ảnh. Đảm bảo ảnh hợp lệ, là định dạng JPG/PNG/WEBP và nhỏ hơn 10MB. Chi tiết lỗi: ' + err.message 
            });
        }
        next();
    });
}, roomController.uploadRoomImage);

// Xoá 1 ảnh lẻ của phòng
router.delete('/delete-image/:id', verifyToken, checkAdmin, roomController.deleteRoomImage);

module.exports = router;
