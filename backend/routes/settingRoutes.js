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

// Route upload ảnh banner (Chỉ Admin)
const { uploadCloud } = require('../config/cloudinary');
router.post('/upload-banner', verifyToken, checkAdmin, (req, res, next) => {
    const upload = uploadCloud.single('image');
    upload(req, res, function (err) {
        if (err) {
            console.error('Lỗi upload banner:', err);
            return res.status(400).json({ 
                message: 'Không thể upload ảnh báo. Lỗi: ' + err.message 
            });
        }
        next();
    });
}, settingController.uploadBannerImage);

module.exports = router;
