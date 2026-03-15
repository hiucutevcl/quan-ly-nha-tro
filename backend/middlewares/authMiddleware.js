const jwt = require('jsonwebtoken');

// Middleware 1: Kiểm tra xem user đã đăng nhập chưa (Kiểm tra JWT Token)
const verifyToken = (req, res, next) => {
    // Lấy token từ header (Định dạng chuẩn: "Bearer <token>")
    const bearerHeader = req.headers['authorization'];
    
    if (!bearerHeader) {
        return res.status(403).json({ message: 'Không tìm thấy Token. Vui lòng đăng nhập!' });
    }

    const token = bearerHeader.split(' ')[1]; // Tách chữ "Bearer" và lấy phần token đằng sau
    if (!token) {
        return res.status(403).json({ message: 'Token không hợp lệ!' });
    }

    try {
        // Giải mã token (lấy payload gồm id và role)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = decoded; // Lưu thông tin giải mã vào req (thường là req.user) để các hàm khác sử dụng
        next(); // Token hợp lệ, cho phép đi tiếp vào route bảo vệ
    } catch (err) {
        return res.status(401).json({ message: 'Token đã hết hạn hoặc không đúng!' });
    }
};

// Middleware 2: Kiểm tra xem user có phải là Admin (Chủ trọ) không
const checkAdmin = (req, res, next) => {
    // Yêu cầu phải gọi verifyToken trước middleware này để req.user đã có dữ liệu
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Từ chối truy cập! Chỉ Chủ trọ (Admin) mới có quyền này.' });
    }
    next(); // Là Admin, cho phép đi tiếp
};

module.exports = { verifyToken, checkAdmin };
