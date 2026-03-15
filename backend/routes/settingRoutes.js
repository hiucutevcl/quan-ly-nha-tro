const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');

// Route tải cài đặt (Public, ai đăng nhập cũng xem đc)
router.get('/', verifyToken, settingController.getSettings);

// Route cập nhật cài đặt (Chỉ Admin)
router.put('/', verifyToken, checkAdmin, settingController.updateSettings);

module.exports = router;
