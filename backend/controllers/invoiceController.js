const db = require('../config/db');

// ==========================================
// 1. API: TẠO HÓA ĐƠN MỚI (CHỈ ADMIN) - BƯỚC 3
// ==========================================
const createInvoice = async (req, res) => {
    try {
        const { room_id, new_elec, new_water, month_year, parking_count = 0, is_wifi = true, is_trash = true } = req.body;

        // B1: Lấy thông tin phòng để biết tiền phòng và chỉ số đồng hồ
        const [rooms] = await db.query('SELECT price, current_elec, current_water FROM rooms WHERE id = ?', [room_id]);
        if (rooms.length === 0) return res.status(404).json({ message: 'Không tìm thấy phòng!' });
        const { price: room_fee, current_elec: room_elec, current_water: room_water } = rooms[0];

        // B2: Truy vấn hóa đơn tháng trước
        const [lastInvoices] = await db.query(
            'SELECT new_elec, new_water, total_amount, is_paid FROM invoices WHERE room_id = ? ORDER BY id DESC LIMIT 1',
            [room_id]
        );

        let old_elec = Number(room_elec) || 0;
        let old_water = Number(room_water) || 0;
        let old_debt = 0;

        if (lastInvoices.length > 0) {
            const lastInvoice = lastInvoices[0];
            old_elec = lastInvoice.new_elec;   // Ưu tiên lấy từ hóa đơn trước
            old_water = lastInvoice.new_water;
            if (!lastInvoice.is_paid) old_debt = lastInvoice.total_amount;
        }

        if (new_elec < old_elec || new_water < old_water) {
            return res.status(400).json({ message: 'Số mới không được nhỏ hơn số cũ!' });
        }

        // B3: Lấy giá dịch vụ mặc định
        const [services] = await db.query('SELECT * FROM Services');
        let trash_price = 30000, wifi_price = 100000, parking_price = 150000;
        services.forEach(s => {
            if(s.service_name.includes('Rác')) trash_price = Number(s.price);
            if(s.service_name.includes('Wifi')) wifi_price = Number(s.price);
            if(s.service_name.includes('xe')) parking_price = Number(s.price);
        });

        // Đơn giá Điện & Nước (4.000đ/kWh, 30.000đ/m³)
        const ELEC_UNIT_PRICE = 4000;
        const WATER_UNIT_PRICE = 30000;

        // Tính tiền Phí Dịch vụ
        const trash_fee = is_trash ? trash_price : 0;
        const wifi_fee = is_wifi ? wifi_price : 0;
        const parking_fee = parking_count * parking_price;

        const elec_fee = (new_elec - old_elec) * ELEC_UNIT_PRICE;
        const water_fee = (new_water - old_water) * WATER_UNIT_PRICE;

        // B4: Tổng tiền
        const total_amount = parseFloat(room_fee) + elec_fee + water_fee + trash_fee + wifi_fee + parking_fee + parseFloat(old_debt);

        // B5: Lưu Database hóa đơn
        await db.query(
            `INSERT INTO invoices 
            (room_id, month_year, old_elec, new_elec, old_water, new_water, room_fee, elec_fee, water_fee, trash_fee, wifi_fee, parking_count, parking_fee, old_debt, total_amount, is_paid) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [room_id, month_year, old_elec, new_elec, old_water, new_water, room_fee, elec_fee, water_fee, trash_fee, wifi_fee, parking_count, parking_fee, old_debt, total_amount, false]
        );

        // B6: Cập nhật lại chỉ số đồng hồ mới vào phòng
        await db.query('UPDATE rooms SET current_elec = ?, current_water = ? WHERE id = ?', [new_elec, new_water, room_id]);

        res.status(201).json({ 
            message: 'Tạo hóa đơn thành công!', 
            total_amount, 
            elec_unit: ELEC_UNIT_PRICE,
            water_unit: WATER_UNIT_PRICE
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi Database: ' + error.message });
    }
};

// API MỚI: Đánh dấu đã thanh toán (Thu tiền)
const payInvoice = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE invoices SET is_paid = true WHERE id = ?', [id]);
        res.status(200).json({ message: 'Thu tiền hóa đơn thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// ==========================================
// 2. API: LẤY LỊCH SỬ HÓA ĐƠN (CỦA TENANT) - BƯỚC 6 
// ==========================================
const getMyInvoices = async (req, res) => {
    try {
        const tenant_id = req.user.id; // Lấy ID người dùng từ Token thông qua middleware

        // Truy vấn Join 2 bảng invoices và rooms để trả về thêm Tên phòng
        const sql = `
            SELECT i.*, r.room_name 
            FROM invoices i
            JOIN rooms r ON i.room_id = r.id
            WHERE r.tenant_id = ?
            ORDER BY i.id DESC
        `;
        const [invoices] = await db.query(sql, [tenant_id]);

        res.status(200).json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy lịch sử hóa đơn!' });
    }
};

// ==========================================
// 3. API BỔ SUNG: LẤY DANH SÁCH TẤT CẢ CÁC PHÒNG (CHO ADMIN) - BƯỚC 5
// ==========================================
const getRooms = async (req, res) => {
    try {
        // Lấy danh sách phòng kèm theo thông tin username của người thuê (nếu có)
        const sql = `
            SELECT r.*, u.username as tenant_username, u.full_name as tenant_name 
            FROM rooms r 
            LEFT JOIN users u ON r.tenant_id = u.id 
            ORDER BY r.room_name ASC
        `;
        const [rooms] = await db.query(sql);
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách phòng!' });
    }
};

// API MỚI: Lấy tất cả hóa đơn (Cho Admin)
const getAllInvoices = async (req, res) => {
    try {
        const sql = `
            SELECT i.*, r.room_name, u.full_name as tenant_name 
            FROM invoices i
            JOIN rooms r ON i.room_id = r.id
            LEFT JOIN users u ON r.tenant_id = u.id
            ORDER BY i.id DESC
        `;
        const [invoices] = await db.query(sql);
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// API: Lấy lịch sử chỉ số điện nước theo phòng
const getMeterHistory = async (req, res) => {
    const { room_id } = req.params;
    try {
        const sql = `
            SELECT month_year, old_elec, new_elec, (new_elec - old_elec) as elec_used,
                   old_water, new_water, (new_water - old_water) as water_used,
                   elec_fee, water_fee, is_paid
            FROM invoices
            WHERE room_id = ?
            ORDER BY month_year ASC
        `;
        const [history] = await db.query(sql, [room_id]);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

module.exports = { createInvoice, getMyInvoices, getRooms, payInvoice, getAllInvoices, getMeterHistory };
