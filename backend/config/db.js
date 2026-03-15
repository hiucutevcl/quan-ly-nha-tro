const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Nạp đúng .env ở thư mục backend

// Tạo Connection Pool để tối ưu hiệu suất kết nối CSDL (thay vì connection đơn lẻ)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nha_tro_db',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud') ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Chuyển sang dạng Promise để dùng chung với async/await thay vì call-backs
module.exports = pool.promise();
