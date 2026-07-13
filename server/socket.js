// Socket.io singleton
// Usage: require('./socket').getIO() anywhere on the server after init
let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: [
          'http://localhost:5173',
          'http://localhost:5174',
          process.env.CLIENT_URL,
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      // Client joins a project room to receive project-specific events
      socket.on('join-project', (projectId) => {
        socket.join(`project:${projectId}`);
        console.log(`   ↳ joined room project:${projectId}`);
      });

      socket.on('leave-project', (projectId) => {
        socket.leave(`project:${projectId}`);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error('Socket.io not initialised yet');
    return io;
  },
};
