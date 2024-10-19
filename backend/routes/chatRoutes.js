// routes/agenceRoutes.js
const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat-botController');

// Route pour créer une agence
router.post('/chat', ChatController.chat);

module.exports = router;
