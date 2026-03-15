const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');
const { uploadCloud } = require('../config/cloudinary');

// Các đường dẫn API
router.get('/all', verifyToken, checkAdmin, roomController.getAllRooms);
router.post('/add', verifyToken, checkAdmin, roomController.createRoom);
router.put('/update/:id', verifyToken, checkAdmin, roomController.updateRoomPrice);
router.delete('/delete/:id', verifyToken, checkAdmin, roomController.deleteRoom);

// Gán / Trả phòng
router.post('/assign/:id', verifyToken, checkAdmin, roomController.assignTenant);

// Cập nhật chỉ số đồng hồ điện/nước
router.put('/meter/:id', verifyToken, checkAdmin, roomController.updateMeterReadings);

// Upload ảnh phòng (tối đa 5 ảnh)
router.post('/upload-image/:id', verifyToken, checkAdmin, uploadCloud.array('images', 5), roomController.uploadRoomImage);

module.exports = router;
