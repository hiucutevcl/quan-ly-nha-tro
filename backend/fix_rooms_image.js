const mysql = require('mysql2/promise');
require('dotenv').config();

async function addImageUrl() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });

        console.log("Connected to Aiven DB. Adding image_url to Rooms...");

        const sql = `
            ALTER TABLE Rooms
            ADD COLUMN image_url VARCHAR(500) DEFAULT '' COMMENT 'Đường dẫn ảnh phòng';
        `;

        await connection.query(sql);
        console.log("Successfully added image_url to Rooms table.");

        await connection.end();
    } catch (err) {
        console.error("Error fixing Rooms table:", err);
    }
}

addImageUrl();
