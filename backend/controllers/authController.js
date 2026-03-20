const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// API 1: Đăng ký tài khoản (Register)
const register = async (req, res) => {
    try {
        const { username, password, role, full_name, phone, id_card, hometown } = req.body;

        // B1: Kiểm tra username đã tồn tại trong CSDL chưa
        const [existingUsers] = await db.query('SELECT id FROM Users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
        }

        // B2: Mã hóa mật khẩu (dùng bcrypt với salt round = 10 cho an toàn)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // B3: Lưu user mới vào CSDL
        const userRole = role || 'Tenant';
        await db.query(
            'INSERT INTO Users (username, password, role, full_name, phone, id_card, hometown) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, userRole, full_name, phone || '', id_card || '', hometown || '']
        );

        res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi đăng ký!' });
    }
};

// API 2: Đăng nhập (Login)
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // B1: Tìm user theo username CSDL
        const [users] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Tên đăng nhập không tồn tại!' });
        }
        const user = users[0];

        // B2: So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Mật khẩu không đúng!' });
        }

        // B3: Tạo chữ ký điện tử (JWT Token) chứa id và role của user
        const payload = {
            id: user.id,
            role: user.role
        };
        // Ký token với mật khẩu bí mật (JWT_SECRET), thời hạn 1 ngày
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' }); 

        // B4: Trả về token cho người dùng (Frontend sẽ lưu trữ cái này để gọi API khác)
        res.status(200).json({
            message: 'Đăng nhập thành công',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi Database: ' + error.message });
    }
};

// API 3: Lấy danh sách Khách thuê (Admin) - Kèm theo phòng hiện tại
const getAllUsers = async (req, res) => {
    try {
        const sql = `
            SELECT u.id, u.username, u.full_name, u.phone, u.id_card, u.hometown,
                   r.room_name, r.id as room_id
            FROM Users u
            LEFT JOIN Rooms r ON r.tenant_id = u.id
            WHERE u.role = 'Tenant'
            ORDER BY u.id DESC
        `;
        const [users] = await db.query(sql);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// API 5: Cập nhật thông tin Khách thuê
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, phone, id_card, hometown } = req.body;
    try {
        await db.query(
            'UPDATE Users SET full_name = ?, phone = ?, id_card = ?, hometown = ? WHERE id = ?',
            [full_name, phone || '', id_card || '', hometown || '', id]
        );
        res.status(200).json({ message: 'Cập nhật thông tin thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// API 4: Xóa Khách thuê (Admin)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM Users WHERE id = ?', [id]);
        res.status(200).json({ message: 'Xóa user thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'User đang thuê phòng hoặc có hóa đơn nên không thể xóa ngay. ' + error.message });
    }
};

// API 6: Đặt lại mật khẩu cho khách thuê (Admin)
const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { new_password } = req.body;
    if (!new_password || new_password.length < 4) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 4 ký tự!' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);
        await db.query('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, id]);
        res.status(200).json({ message: 'Đặt lại mật khẩu thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// API 7: Lấy thông tin cá nhân của người đang đăng nhập (Tenant)
const getMe = async (req, res) => {
    try {
        const tenant_id = req.user.id;
        const sql = `
            SELECT u.id, u.username, u.full_name, u.phone, u.id_card, u.hometown,
                   r.id as room_id, r.room_name, r.price, r.amenities, r.start_date, r.end_date, r.current_elec, r.current_water
            FROM Users u
            LEFT JOIN Rooms r ON r.tenant_id = u.id
            WHERE u.id = ?
        `;
        const [users] = await db.query(sql, [tenant_id]);
        if (users.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        res.status(200).json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// API: Đổi mật khẩu cá nhân
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password || new_password.length < 4) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ và mật khẩu mới phải từ 4 ký tự trở lên!' });
        }

        const [users] = await db.query('SELECT password FROM Users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        
        const validPassword = await bcrypt.compare(old_password, users[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);
        await db.query('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

module.exports = { register, login, getAllUsers, deleteUser, updateUser, resetPassword, getMe, changePassword };
