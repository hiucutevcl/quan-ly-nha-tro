const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function run() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    console.log('Đang kết nối tới DB...');

    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS RoomAssets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id INT NOT NULL,
                asset_name VARCHAR(255) NOT NULL,
                description TEXT,
                condition_status VARCHAR(100) DEFAULT 'Tốt',
                quantity INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✅ Đã tạo bảng RoomAssets thành công!');
    } catch (e) {
        console.error('❌ Lỗi tạo RoomAssets:', e.message);
    }

    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS RoomIncidents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                severity VARCHAR(50) DEFAULT 'Trung bình',
                status VARCHAR(50) DEFAULT 'Mới',
                reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at DATETIME NULL,
                resolve_note TEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✅ Đã tạo bảng RoomIncidents thành công!');
    } catch (e) {
        console.error('❌ Lỗi tạo RoomIncidents:', e.message);
    }

    await db.end();
}

run().catch(console.error);
