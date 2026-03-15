const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updatePasswords() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });

        const salt = await bcrypt.genSalt(10);
        const correctHash = await bcrypt.hash('123456', salt);
        console.log("New hash for 123456:", correctHash);

        await connection.query('UPDATE Users SET password = ?', [correctHash]);
        console.log("Updated all users' passwords to 123456");

        await connection.end();
    } catch (err) {
        console.error("Error updating passwords:", err);
    }
}

updatePasswords();
