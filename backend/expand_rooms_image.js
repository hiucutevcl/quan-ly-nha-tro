const mysql = require('mysql2/promise');
require('dotenv').config();

async function expandImageUrl() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });

        console.log("Connected to Aiven DB. Expanding image_url column in Rooms...");

        const sql = `
            ALTER TABLE Rooms
            MODIFY COLUMN image_url TEXT COMMENT 'Đường dẫn ảnh phòng (JSON array)';
        `;

        await connection.query(sql);
        console.log("Successfully altered image_url to TEXT.");

        await connection.end();
    } catch (err) {
        console.error("Error fixing Rooms table:", err);
    }
}

expandImageUrl();
