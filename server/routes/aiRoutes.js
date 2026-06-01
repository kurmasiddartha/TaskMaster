const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Protected API route for AI Assistant chat
router.post('/chat', protect, chat);

module.exports = router;
