const express = require('express');
const router = express.Router();
const { getRevenue, getDebtList } = require('../controllers/statisticController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');

// Chỉ có quyền Admin mới được lấy Báo cáo Thống kê
router.get('/revenue', verifyToken, checkAdmin, getRevenue);
router.get('/debts', verifyToken, checkAdmin, getDebtList);

module.exports = router;
