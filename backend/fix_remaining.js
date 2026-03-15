const mysql = require('mysql2/promise');
require('dotenv').config();

async function runRemainingUpdates() {
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

        console.log("Connected. Running remaining schema updates...");

        const sql = `
            -- Bảng lưu trữ Cấu hình Giá Dịch Vụ cố định (Rác, Wifi, Gửi xe)
            CREATE TABLE IF NOT EXISTS Services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                service_name VARCHAR(100) NOT NULL COMMENT 'Tên dịch vụ (Rác, Wifi, Gửi xe, v.v.)',
                price DECIMAL(10, 2) NOT NULL COMMENT 'Giá tiền mặc định',
                unit VARCHAR(50) NOT NULL COMMENT 'Đơn vị tính (Tháng, Chiếc, Khối...)',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Chỉnh sửa Hóa đơn (Invoices) để chèn thêm Phí dịch vụ phụ
            ALTER TABLE Invoices
            ADD COLUMN trash_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'Tiền rác',
            ADD COLUMN wifi_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'Tiền mạng',
            ADD COLUMN parking_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'Tiền gửi xe (số lượng * đơn giá)',
            ADD COLUMN parking_count INT DEFAULT 0 COMMENT 'Số lượng xe gửi';
        `;

        await connection.query(sql);

        const insertSql = `
            INSERT INTO Services (service_name, price, unit) VALUES
            ('Rác thải', 30000, 'Tháng'),
            ('Internet Wifi', 100000, 'Tháng'),
            ('Gửi xe máy', 150000, 'Chiếc');
        `;
        
        try {
             await connection.query(insertSql);
        } catch(e) {
             console.log("Services may already exist or insert failed.");
        }

        console.log("Successfully ran remaining updates.");
        await connection.end();
    } catch (err) {
        console.error("Error updating schema:", err);
    }
}

runRemainingUpdates();
