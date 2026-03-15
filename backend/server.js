require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const roomRoutes = require('./routes/roomRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const settingRoutes = require('./routes/settingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ ảnh đã upload qua URL tĩnh
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Khai báo các Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/settings', settingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên port ${PORT}`);
});
