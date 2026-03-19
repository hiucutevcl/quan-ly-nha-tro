const db = require('../config/db');

// Lấy danh sách cài đặt
const getSettings = async (req, res) => {
    try {
        const [settings] = await db.query('SELECT setting_key, setting_value FROM AppSettings');
        const settingsObj = {};
        settings.forEach(i => {
            settingsObj[i.setting_key] = i.setting_value;
        });
        res.status(200).json(settingsObj);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// Cập nhật cài đặt
const updateSettings = async (req, res) => {
    try {
        const settings = req.body;
        
        // Loop qua object keys và update từng cái
        const promises = Object.keys(settings).map(key => {
            return db.query(
                'INSERT INTO AppSettings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, settings[key], settings[key]]
            );
        });

        await Promise.all(promises);
        res.status(200).json({ message: 'Cập nhật cài đặt thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// Lấy thông tin công khai (Tên nhà trọ, địa chỉ, SĐT, nội quy)
const getPublicSettings = async (req, res) => {
    try {
        // Chỉ trả về những trường không nhạy cảm
        const publicKeys = ['nha_tro_name', 'address', 'phone', 'note', 'owner', 'elec_price', 'water_price', 'quick_replies', 'ads_config', 'custom_quick_replies', 'buildings_list'];
        const publicSettings = {};
        const [settings] = await db.query(
            'SELECT setting_key, setting_value FROM AppSettings WHERE setting_key IN (?)',
            [publicKeys]
        );
        const settingsObj = {};
        settings.forEach(i => {
            settingsObj[i.setting_key] = i.setting_value;
        });
        res.status(200).json(settingsObj);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// Upload ảnh banner
const uploadBannerImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn ảnh để upload.' });
        }
        res.status(200).json({ 
            message: 'Upload thành công!', 
            imageUrl: req.file.path // URL trả về trực tiếp từ Cloudinary Storage
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi upload: ' + error.message });
    }
};

module.exports = { getSettings, updateSettings, getPublicSettings, uploadBannerImage };
