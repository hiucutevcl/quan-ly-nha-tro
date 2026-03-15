const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixUsersTable() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });

        console.log("Connected to Aiven DB. Adding missing columns to Users...");

        const sql = `
            ALTER TABLE Users
            ADD COLUMN phone VARCHAR(20) DEFAULT '' COMMENT 'Số điện thoại',
            ADD COLUMN id_card VARCHAR(20) DEFAULT '' COMMENT 'CCCD/CMND',
            ADD COLUMN hometown VARCHAR(200) DEFAULT '' COMMENT 'Quê quán';
        `;

        await connection.query(sql);
        console.log("Successfully added phone, id_card, hometown to Users table.");

        await connection.end();
    } catch (err) {
        console.error("Error fixing Users table:", err);
    }
}

fixUsersTable();
