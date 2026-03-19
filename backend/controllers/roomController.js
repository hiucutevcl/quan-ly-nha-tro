const db = require('../config/db');

// Lấy danh sách tất cả phòng
const getAllRooms = async (req, res) => {
    try {
        const [rooms] = await db.query(`
            SELECT r.*, u.full_name as tenant_name 
            FROM Rooms r 
            LEFT JOIN Users u ON r.tenant_id = u.id
            ORDER BY r.room_name ASC
        `);
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// Thêm phòng mới
const createRoom = async (req, res) => {
    const { room_name, price, area, floor, amenities } = req.body;
    try {
        await db.query(
            'INSERT INTO Rooms (room_name, price, area, floor, amenities, status) VALUES (?, ?, ?, ?, ?, ?)',
            [room_name, price, area || null, floor || null, amenities || '', 'Available']
        );
        res.status(201).json({ message: 'Tạo phòng mới thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// Sửa thông tin phòng (Giá, Diện tích, Tầng, Tiện ích)
const updateRoomPrice = async (req, res) => {
    const { id } = req.params;
    const { price, area, floor, amenities } = req.body;
    try {
        await db.query(
            'UPDATE Rooms SET price = ?, area = ?, floor = ?, amenities = ? WHERE id = ?',
            [price, area || null, floor || null, amenities || '', id]
        );
        res.status(200).json({ message: 'Cập nhật thông tin phòng thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// Xóa phòng
const deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Rooms WHERE id = ?', [id]);
        res.status(200).json({ message: 'Đã xóa phòng!' });
    } catch (error) {
        res.status(500).json({ message: 'Không thể xóa phòng đang có người ở hoặc đã có hóa đơn. ' + error.message });
    }
};

// Gán Khách thuê vào phòng (Làm Hợp đồng)
const assignTenant = async (req, res) => {
    const { id } = req.params; // Room ID
    const { tenant_id, start_date, end_date } = req.body;
    try {
        if (!tenant_id) {
            // Trường hợp khách trả phòng
            await db.query('UPDATE Rooms SET status = ?, tenant_id = NULL, start_date = NULL, end_date = NULL WHERE id = ?', ['Available', id]);
        } else {
            // Trường hợp có khách mới đến thuê
            await db.query('UPDATE Rooms SET status = ?, tenant_id = ?, start_date = ?, end_date = ? WHERE id = ?', 
                ['Occupied', tenant_id, start_date, end_date, id]);
        }
        res.status(200).json({ message: 'Cập nhật hợp đồng thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// Cập nhật chỉ số đồng hồ điện/nước cho phòng
const updateMeterReadings = async (req, res) => {
    const { id } = req.params;
    const { current_elec, current_water } = req.body;
    try {
        await db.query('UPDATE Rooms SET current_elec = ?, current_water = ? WHERE id = ?', [current_elec, current_water, id]);
        res.status(200).json({ message: 'Cập nhật chỉ số đồng hồ thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// Upload ảnh phòng
const uploadRoomImage = async (req, res) => {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Không có file ảnh nào được chọn!' });
    }

    // Map qua danh sách files để lấy các đường dẫn URL trên Cloudinary
    const imageUrls = req.files.map(file => file.path);
    
    // Chuyển mảng URL thành chuỗi JSON để lưu vào 1 cột image_url trong database
    const imageUrlsString = JSON.stringify(imageUrls);

    try {
        await db.query('UPDATE Rooms SET image_url = ? WHERE id = ?', [imageUrlsString, id]);
        res.status(200).json({ message: 'Upload các ảnh thành công!', image_url: imageUrlsString });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Database: ' + error.message });
    }
};

const getPublicRooms = async (req, res) => {
    try {
        const [rooms] = await db.query(`
            SELECT * FROM Rooms ORDER BY room_name ASC
        `);
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

module.exports = { getAllRooms, createRoom, updateRoomPrice, deleteRoom, assignTenant, updateMeterReadings, uploadRoomImage, getPublicRooms };
