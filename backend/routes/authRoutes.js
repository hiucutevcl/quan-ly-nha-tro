const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);

// API Dành cho quản lý khách thuê
router.get('/users', verifyToken, checkAdmin, authController.getAllUsers);
router.put('/users/:id', verifyToken, checkAdmin, authController.updateUser);
router.put('/users/:id/reset-password', verifyToken, checkAdmin, authController.resetPassword);
router.delete('/users/:id', verifyToken, checkAdmin, authController.deleteUser);

module.exports = router;
