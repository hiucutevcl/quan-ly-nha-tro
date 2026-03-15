const express = require('express');
const router = express.Router();
const { createInvoice, getMyInvoices, getRooms, payInvoice, getAllInvoices, getMeterHistory } = require('../controllers/invoiceController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');

// Các quyền của Admin
router.post('/create', verifyToken, checkAdmin, createInvoice);
router.get('/rooms', verifyToken, checkAdmin, getRooms);
router.get('/all', verifyToken, checkAdmin, getAllInvoices);
router.put('/pay/:id', verifyToken, checkAdmin, payInvoice);
router.get('/meter-history/:room_id', verifyToken, checkAdmin, getMeterHistory);

// Bất kỳ ai đăng nhập (Tenant) cũng có quyền xem lịch sử hóa đơn của chính mình
router.get('/my-invoices', verifyToken, getMyInvoices);

module.exports = router;
