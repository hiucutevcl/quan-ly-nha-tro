const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Route xử lý tin nhắn kết nối với AI (Công khai để khách dùng)
router.post('/public', chatController.handleChatRequest);

module.exports = router;
