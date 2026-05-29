const ChatRoom = require('../models/chat_rooms.model');
const { authMW } = require('../middleWare/auth.middleware');

// Create or get chat room
exports.createOrGetRoom = async (req, res) => {
  try {
    const { project_id, client_id, freelancer_id } = req.body;
    
    let room = await ChatRoom.getByUsers(client_id || req.user.id, freelancer_id);
    if (!room) {
      room = await ChatRoom.createChatRoom({
        project_id,
        client_id: client_id || req.user.id,
        freelancer_id
      });
    }

    res.json({
      message: 'Chat room ready',
      data: room
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room by project
exports.getRoomByProject = async (req, res) => {
  try {
    const room = await ChatRoom.getByProject(req.params.projectId);
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

