const db = require('../config/db');

// Lấy danh sách tất cả phòng
const getAllRooms = async (req, res) => {
    try {
        const [rooms] = await db.query(`
            SELECT r.*, u.full_name as tenant_name 
            FROM rooms r 
            LEFT JOIN users u ON r.tenant_id = u.id
            ORDER BY r.room_name ASC
        `);
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// Thêm phòng mới
const createRoom = async (req, res) => {
    const { room_name, price, amenities } = req.body;
    try {
        await db.query('INSERT INTO rooms (room_name, price, amenities, status) VALUES (?, ?, ?, ?)', [room_name, price, amenities || '', 'Available']);
        res.status(201).json({ message: 'Tạo phòng mới thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// Sửa thông tin phòng (Giá, Tiện ích)
const updateRoomPrice = async (req, res) => {
    const { id } = req.params;
    const { price, amenities } = req.body;
    try {
        await db.query('UPDATE rooms SET price = ?, amenities = ? WHERE id = ?', [price, amenities || '', id]);
        res.status(200).json({ message: 'Cập nhật thông tin phòng thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// Xóa phòng
const deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM rooms WHERE id = ?', [id]);
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
            await db.query('UPDATE rooms SET status = ?, tenant_id = NULL, start_date = NULL, end_date = NULL WHERE id = ?', ['Available', id]);
        } else {
            // Trường hợp có khách mới đến thuê
            await db.query('UPDATE rooms SET status = ?, tenant_id = ?, start_date = ?, end_date = ? WHERE id = ?', 
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
        await db.query('UPDATE rooms SET current_elec = ?, current_water = ? WHERE id = ?', [current_elec, current_water, id]);
        res.status(200).json({ message: 'Cập nhật chỉ số đồng hồ thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// Upload ảnh phòng
const uploadRoomImage = async (req, res) => {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'Không có file ảnh!' });
    // multer-storage-cloudinary sẽ trả về URL của ảnh trên Cloudinary trong req.file.path
    const image_url = req.file.path;
    try {
        await db.query('UPDATE rooms SET image_url = ? WHERE id = ?', [image_url, id]);
        res.status(200).json({ message: 'Upload ảnh thành công!', image_url });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

module.exports = { getAllRooms, createRoom, updateRoomPrice, deleteRoom, assignTenant, updateMeterReadings, uploadRoomImage };
