const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupSettingsDb() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });

        console.log("Connected to DB. Creating AppSettings table...");

        const sql = `
            CREATE TABLE IF NOT EXISTS AppSettings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(50) UNIQUE NOT NULL,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;

        await connection.query(sql);
        console.log("AppSettings table ready.");

        // Insert default bank settings if table is empty
        const initialData = [
            ['nha_tro_name', 'Nhà Trọ Gia Đình'],
            ['address', ''],
            ['phone', ''],
            ['owner', ''],
            ['elec_price', '3500'],
            ['water_price', '15000'],
            ['note', ''],
            ['bank_name', ''],
            ['bank_account', ''],
            ['bank_owner', ''],
            ['quick_replies', '🏠 Xem phòng trống\n💰 Báo giá thuê\n📍 Xin địa chỉ\n📞 Liên hệ chủ trọ\n⚡ Giá điện nước']
        ];

        for (const [key, value] of initialData) {
            await connection.query(
                'INSERT IGNORE INTO AppSettings (setting_key, setting_value) VALUES (?, ?)',
                [key, value]
            );
        }

        console.log("Default settings initialized.");
        await connection.end();
    } catch (err) {
        console.error("Error setting up AppSettings table:", err);
    }
}

setupSettingsDb();
