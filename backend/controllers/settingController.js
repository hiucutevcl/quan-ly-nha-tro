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

module.exports = { getSettings, updateSettings };
