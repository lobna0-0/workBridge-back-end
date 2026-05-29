const socketIO = require('socket.io');
const supabase = require('./config/supabase');
const { verifyToken } = require('./utils/auth');

let io;

function initSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // AUTH
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));

      const decoded = verifyToken(token);
      socket.user = decoded;

      return next();
    } catch (e) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id;

    console.log('User connected:', socket.id, userId);

    // ======================
    // AUTO JOIN USER ROOM (ONLY ONCE)
    // ======================
    if (userId) {
      const room = `user_${userId}`;
      socket.join(room);

      console.log('[socket] joined room:', room);
    }

    // ======================
    // PROJECT ROOM
    // ======================
    socket.on('join_project', (projectId) => {
      if (!projectId) return;
      socket.join(`project_${projectId}`);
    });

    // ======================
    // TYPING
    // ======================
    socket.on('typing', (data) => {
      if (!data?.project_id) return;

      socket.to(`project_${data.project_id}`).emit('user_typing', {
        user_id: userId,
        project_id: data.project_id
      });
    });

    // ======================
    // MESSAGE SEEN
    // ======================
    socket.on('message_seen', async (data) => {
      try {
        if (!data?.message_id || !data?.project_id) return;

        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('id', data.message_id);

        io.to(`project_${data.project_id}`).emit('message_seen', {
          message_id: data.message_id,
          user_id: userId
        });

      } catch (e) {
        console.error(e);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket not initialized');
  return io;
}

module.exports = { initSocket, getIO };