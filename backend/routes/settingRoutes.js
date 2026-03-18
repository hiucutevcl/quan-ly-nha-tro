const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');

// Route tải cài đặt công khai (Cho Landing Page)
router.get('/public', settingController.getPublicSettings);

// Route tải cài đặt (Cho User/Admin)
router.get('/', verifyToken, settingController.getSettings);

// Route cập nhật cài đặt (Chỉ Admin)
router.put('/', verifyToken, checkAdmin, settingController.updateSettings);

module.exports = router;
