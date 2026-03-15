const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixRoomsColumns() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });

        console.log("Connected to Aiven DB. Adding missing columns to Rooms...");

        const sql = `
            ALTER TABLE Rooms
            ADD COLUMN amenities VARCHAR(255) DEFAULT '' COMMENT 'Các tiện nghi trong phòng',
            ADD COLUMN current_elec INT DEFAULT 0 COMMENT 'Số điện hiện tại',
            ADD COLUMN current_water INT DEFAULT 0 COMMENT 'Số nước hiện tại';
        `;

        await connection.query(sql);
        console.log("Successfully added amenities, current_elec, current_water to Rooms table.");

        await connection.end();
    } catch (err) {
        console.error("Error fixing Rooms table:", err);
    }
}

fixRoomsColumns();
