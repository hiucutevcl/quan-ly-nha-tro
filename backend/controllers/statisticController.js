const db = require('../config/db');

// API 1: Thống kê Doanh thu theo tháng
const getRevenue = async (req, res) => {
    try {
        // Query Lấy tổng doanh thu của các hóa đơn ĐÃ THANH TOÁN nhóm theo tháng
        const sql = `
            SELECT month_year, SUM(total_amount) as revenue 
            FROM Invoices 
            WHERE is_paid = true 
            GROUP BY month_year 
            ORDER BY month_year DESC 
            LIMIT 12
        `;
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// API 2: Lấy danh sách Nợ (Hóa đơn CHƯA THANH TOÁN)
const getDebtList = async (req, res) => {
    try {
        const sql = `
            SELECT i.id, i.month_year, i.total_amount, r.room_name, u.full_name as tenant_name, u.username as phone
            FROM Invoices i
            JOIN Rooms r ON i.room_id = r.id
            LEFT JOIN Users u ON r.tenant_id = u.id
            WHERE i.is_paid = false
            ORDER BY i.month_year ASC
        `;
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

module.exports = { getRevenue, getDebtList };
