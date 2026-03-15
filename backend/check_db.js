const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });

        const [users] = await connection.query("SELECT id, username, role FROM Users");
        console.log("Users:", users);

        const [rooms] = await connection.query("SELECT * FROM Rooms");
        console.log("Rooms:", rooms);

        await connection.end();
    } catch (err) {
        console.error("Error checking DB:", err);
    }
}

checkDB();
