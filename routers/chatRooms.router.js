const express = require('express');
const router = express.Router();
const ChatRoomController = require('../controllers/chatRooms.controller');
const { authMW } = require('../middleWare/auth.middleware');

// POST /api/chat-rooms
router.post('/', authMW, ChatRoomController.createOrGetRoom);

// GET /api/chat-rooms/project/:projectId
router.get('/project/:projectId', authMW, ChatRoomController.getRoomByProject);

module.exports = router;

