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
    const { room_name, price, area, floor, amenities, building_name, room_address } = req.body;
    
    // Đảm bảo cột tồn tại trước khi INSERT (migration tự động)
    const ensureCols = [
        `ALTER TABLE Rooms ADD COLUMN IF NOT EXISTS building_name VARCHAR(255) DEFAULT ''`,
        `ALTER TABLE Rooms ADD COLUMN IF NOT EXISTS room_address VARCHAR(500) DEFAULT ''`,
    ];
    for (const sql of ensureCols) {
        try { await db.query(sql); } catch(e) { /* ignore */ }
    }

    try {
        await db.query(
            'INSERT INTO Rooms (room_name, price, area, floor, amenities, building_name, room_address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [room_name, price, area || null, floor || null, amenities || '', building_name || '', room_address || '', 'Available']
        );
        res.status(201).json({ message: 'Tạo phòng mới thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// Sửa thông tin phòng (Giá, Diện tích, Tầng, Tiện ích, Khu nhà, Địa chỉ)
const updateRoomPrice = async (req, res) => {
    const { id } = req.params;
    const { price, area, floor, amenities, building_name, room_address } = req.body;
    try {
        await db.query(
            'UPDATE Rooms SET price = ?, area = ?, floor = ?, amenities = ?, building_name = ?, room_address = ? WHERE id = ?',
            [price, area || null, floor || null, amenities || '', building_name || '', room_address || '', id]
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

// Upload ảnh phòng (Mở rộng/cộng dồn)
const uploadRoomImage = async (req, res) => {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Không có file ảnh nào được chọn!' });
    }

    try {
        // 1. Lấy mảng ảnh hiện tại của phòng
        const [rows] = await db.query('SELECT image_url FROM Rooms WHERE id = ?', [id]);
        let existingImages = [];
        if (rows.length > 0 && rows[0].image_url) {
            try {
                existingImages = JSON.parse(rows[0].image_url);
                if (!Array.isArray(existingImages)) existingImages = [];
            } catch (e) {
                // Nếu dữ liệu cũ là chuỗi không phải mảng, ép thành mảng
                existingImages = [rows[0].image_url];
            }
        }

        // 2. Map qua danh sách files mới
        const newUrls = req.files.map(file => file.path);
        
        // 3. Hợp nhất mảng cũ & mới
        let mergedImages = [...existingImages, ...newUrls];
        if (mergedImages.length > 5) {
            // Giữ lại 5 ảnh mới nhất bằng cách cắt bớt phần tử đầu (tuỳ chọn)
            // Hoặc chặn luôn từ frontend là hợp lý nhất, ở đây backend có thể truncate để bảo vệ db.
            mergedImages = mergedImages.slice(mergedImages.length - 5);
        }

        const imageUrlsString = JSON.stringify(mergedImages);

        await db.query('UPDATE Rooms SET image_url = ? WHERE id = ?', [imageUrlsString, id]);
        res.status(200).json({ message: 'Upload thêm ảnh thành công!', image_url: imageUrlsString });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Database: ' + error.message });
    }
};

// Xóa 1 ảnh cụ thể khỏi phòng
const deleteRoomImage = async (req, res) => {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ message: 'Vui lòng cung cấp URL ảnh cần xóa' });
    }

    try {
        const [rows] = await db.query('SELECT image_url FROM Rooms WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy phòng' });
        
        let existingImages = [];
        if (rows[0].image_url) {
            try { existingImages = JSON.parse(rows[0].image_url); } 
            catch (e) { existingImages = [rows[0].image_url]; }
        }

        // Lọc bỏ URL được yêu cầu xóa
        const updatedImages = existingImages.filter(img => img !== imageUrl);
        const imageUrlsString = JSON.stringify(updatedImages);

        await db.query('UPDATE Rooms SET image_url = ? WHERE id = ?', [imageUrlsString, id]);
        res.status(200).json({ message: 'Xóa ảnh thành công!', image_url: imageUrlsString });
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

module.exports = { getAllRooms, createRoom, updateRoomPrice, deleteRoom, assignTenant, updateMeterReadings, uploadRoomImage, deleteRoomImage, getPublicRooms };
