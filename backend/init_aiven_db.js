const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false },
            multipleStatements: true
        });

        console.log("Connected to Aiven DB!");

        const schemaPath = path.join(__dirname, '../db/schema.sql');
        let sql = fs.readFileSync(schemaPath, 'utf8');
        
        // Remove CREATE DATABASE and USE statements to avoid permission errors on Aiven
        sql = sql.replace(/CREATE DATABASE IF NOT EXISTS [^;]+;/gi, '');
        sql = sql.replace(/USE [^;]+;/gi, '');

        console.log("Executing schema...");
        await connection.query(sql);

        const updatePath = path.join(__dirname, '../db/update_db.sql');
        if (fs.existsSync(updatePath)) {
            let updateSql = fs.readFileSync(updatePath, 'utf8');
            updateSql = updateSql.replace(/USE [^;]+;/gi, '');
            console.log("Executing updates...");
            await connection.query(updateSql);
        }

        console.log("Database initialized successfully!");
        await connection.end();
    } catch (err) {
        console.error("Error initializing DB:", err);
    }
}

initDB();
