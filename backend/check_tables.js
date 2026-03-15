const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });

        const [tables] = await connection.query("SHOW TABLES");
        console.log("Tables:", tables);

        await connection.end();
    } catch (err) {
        console.error("Error checking tables:", err);
    }
}

checkTables();
