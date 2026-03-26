const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');

// ======= TÀI SẢN/ĐỒ ĐẠC PHÒNG (RoomAssets) =======

// Lấy danh sách tài sản của 1 phòng
router.get('/assets/:roomId', verifyToken, checkAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM RoomAssets WHERE room_id = ? ORDER BY created_at DESC',
            [req.params.roomId]
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Lấy tất cả tài sản (có thể lọc theo phòng)
router.get('/assets', verifyToken, checkAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, r.room_name
            FROM RoomAssets a
            JOIN Rooms r ON a.room_id = r.id
            ORDER BY r.room_name ASC, a.created_at DESC
        `);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Thêm tài sản mới vào phòng
router.post('/assets', verifyToken, checkAdmin, async (req, res) => {
    const { room_id, asset_name, description, condition_status, quantity } = req.body;
    if (!room_id || !asset_name) {
        return res.status(400).json({ message: 'Thiếu room_id hoặc tên tài sản!' });
    }
    try {
        await db.query(
            `INSERT INTO RoomAssets (room_id, asset_name, description, condition_status, quantity)
             VALUES (?, ?, ?, ?, ?)`,
            [room_id, asset_name, description || '', condition_status || 'Tốt', quantity || 1]
        );
        res.status(201).json({ message: 'Đã thêm tài sản thành công!' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Thêm nhiều tài sản cùng lúc (Bulk Insert dùng cho tiện nghi chọn sẵn)
router.post('/assets/bulk', verifyToken, checkAdmin, async (req, res) => {
    const { room_id, assets } = req.body; // assets: [{asset_name, condition_status, quantity, description}]
    if (!room_id || !Array.isArray(assets) || assets.length === 0) {
        return res.status(400).json({ message: 'Thiếu room_id hoặc danh sách tiện nghi/tài sản trống!' });
    }
    try {
        const values = assets.map(a => [
            room_id, a.asset_name, a.description || '', a.condition_status || 'Tốt', a.quantity || 1
        ]);
        await db.query(`INSERT INTO RoomAssets (room_id, asset_name, description, condition_status, quantity) VALUES ?`, [values]);
        res.status(201).json({ message: `Đã thêm ${assets.length} tài sản/tiện nghi!` });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Cập nhật tình trạng tài sản
router.put('/assets/:id', verifyToken, checkAdmin, async (req, res) => {
    const { asset_name, description, condition_status, quantity } = req.body;
    try {
        await db.query(
            `UPDATE RoomAssets SET asset_name=?, description=?, condition_status=?, quantity=? WHERE id=?`,
            [asset_name, description || '', condition_status, quantity || 1, req.params.id]
        );
        res.json({ message: 'Cập nhật tài sản thành công!' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Xóa tài sản
router.delete('/assets/:id', verifyToken, checkAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM RoomAssets WHERE id = ?', [req.params.id]);
        res.json({ message: 'Đã xóa tài sản!' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ======= SỰ CỐ/INCIDENT (RoomIncidents) =======

// Lấy danh sách sự cố (có thể lọc theo phòng)
router.get('/incidents', verifyToken, checkAdmin, async (req, res) => {
    try {
        const { room_id } = req.query;
        let sql = `
            SELECT inc.*, r.room_name
            FROM RoomIncidents inc
            JOIN Rooms r ON inc.room_id = r.id
        `;
        const params = [];
        if (room_id) {
            sql += ' WHERE inc.room_id = ?';
            params.push(room_id);
        }
        sql += ' ORDER BY inc.reported_at DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Ghi nhận sự cố mới
router.post('/incidents', verifyToken, checkAdmin, async (req, res) => {
    const { room_id, title, description, severity } = req.body;
    if (!room_id || !title) {
        return res.status(400).json({ message: 'Thiếu room_id hoặc tiêu đề sự cố!' });
    }
    try {
        await db.query(
            `INSERT INTO RoomIncidents (room_id, title, description, severity, status)
             VALUES (?, ?, ?, ?, 'Mới')`,
            [room_id, title, description || '', severity || 'Trung bình']
        );
        res.status(201).json({ message: 'Đã ghi nhận sự cố!' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Cập nhật trạng thái sự cố
router.put('/incidents/:id', verifyToken, checkAdmin, async (req, res) => {
    const { title, description, severity, status, resolved_at, resolve_note } = req.body;
    try {
        await db.query(
            `UPDATE RoomIncidents SET title=?, description=?, severity=?, status=?, resolved_at=?, resolve_note=? WHERE id=?`,
            [title, description || '', severity, status, resolved_at || null, resolve_note || '', req.params.id]
        );
        res.json({ message: 'Cập nhật sự cố thành công!' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Xóa sự cố
router.delete('/incidents/:id', verifyToken, checkAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM RoomIncidents WHERE id = ?', [req.params.id]);
        res.json({ message: 'Đã xóa sự cố!' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ==============================================================
// ======= API DÀNH RIÊNG CHO NGƯỜI THUÊ (TENANTS) ==============
// ==============================================================

// Lấy danh sách tài sản trong phòng của người thuê
router.get('/tenant/assets', verifyToken, async (req, res) => {
    try {
        // Tìm phòng của người dùng hiện tại
        const [rooms] = await db.query('SELECT id FROM Rooms WHERE tenant_id = ? LIMIT 1', [req.user.id]);
        if (rooms.length === 0) return res.json([]);
        
        const [assets] = await db.query(
            'SELECT * FROM RoomAssets WHERE room_id = ? ORDER BY created_at DESC',
            [rooms[0].id]
        );
        res.json(assets);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Lấy danh sách sự cố người thuê đã báo cáo
router.get('/tenant/incidents', verifyToken, async (req, res) => {
    try {
        const [rooms] = await db.query('SELECT id FROM Rooms WHERE tenant_id = ? LIMIT 1', [req.user.id]);
        if (rooms.length === 0) return res.json([]);
        
        const [incidents] = await db.query(
            'SELECT * FROM RoomIncidents WHERE room_id = ? ORDER BY reported_at DESC',
            [rooms[0].id]
        );
        res.json(incidents);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Người thuê gửi báo cáo sự cố mới
router.post('/tenant/incidents', verifyToken, async (req, res) => {
    const { title, description, severity } = req.body;
    if (!title) return res.status(400).json({ message: 'Vui lòng nhập tiêu đề sự cố!' });
    
    try {
        const [rooms] = await db.query('SELECT id FROM Rooms WHERE tenant_id = ? LIMIT 1', [req.user.id]);
        if (rooms.length === 0) return res.status(400).json({ message: 'Bạn chưa được xếp vào phòng nào!' });
        
        await db.query(
            `INSERT INTO RoomIncidents (room_id, title, description, severity, status)
             VALUES (?, ?, ?, ?, 'Mới')`,
            [rooms[0].id, title, description || '', severity || 'Trung bình']
        );
        res.status(201).json({ message: 'Đã gửi báo cáo sự cố thành công! Quản lý sẽ sớm xử lý.' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Người thuê báo cáo tình trạng tài sản (Cập nhật condition_status)
router.put('/tenant/assets/:id', verifyToken, async (req, res) => {
    const { condition_status, note } = req.body;
    try {
        const [rooms] = await db.query('SELECT id FROM Rooms WHERE tenant_id = ? LIMIT 1', [req.user.id]);
        if (rooms.length === 0) return res.status(403).json({ message: 'Không có quyền truy cập.' });
        
        const roomId = rooms[0].id;
        
        // Lấy tên tài sản để tự động báo sự cố
        const [assets] = await db.query('SELECT asset_name FROM RoomAssets WHERE id = ? AND room_id = ?', [req.params.id, roomId]);
        if (assets.length === 0) return res.status(404).json({ message: 'Không tìm thấy tài sản trong phòng của bạn.' });
        
        const assetName = assets[0].asset_name;

        // Cập nhật trạng thái và tự động ghi đè description (tuỳ chọn)
        await db.query(
            `UPDATE RoomAssets SET condition_status = ? 
             WHERE id = ? AND room_id = ?`,
            [condition_status, req.params.id, roomId]
        );

        // Tự động tạo Ticket Sự cố nếu báo hỏng/cần sửa
        if (condition_status === 'Hỏng' || condition_status === 'Cần sửa') {
            const severity = condition_status === 'Hỏng' ? 'Cao' : 'Trung bình';
            const title = `[Tự động] Cư dân báo: ${assetName} bị ${condition_status}`;
            const description = `Hệ thống tự động ghi nhận tài sản "${assetName}" được chuyển trạng thái thành "${condition_status}" bởi cư dân báo cáo từ bảng theo dõi.`;
            
            await db.query(
                `INSERT INTO RoomIncidents (room_id, title, description, severity, status)
                 VALUES (?, ?, ?, ?, 'Mới')`,
                [roomId, title, description, severity]
            );
        }

        res.json({ message: 'Đã cập nhật tình trạng tài sản thành công!' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;
