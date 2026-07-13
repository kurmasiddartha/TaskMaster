// Socket.io singleton
// Usage: require('./socket').getIO() anywhere on the server after init
let io;

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // same-origin / mobile / server-to-server
  if (origin === 'http://localhost:5173') return true;
  if (origin === 'http://localhost:5174') return true;
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
  // Accept any Vercel preview/production deployment
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: isAllowedOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Important for Render: allow polling as fallback since some
      // reverse-proxy configs don't support WebSocket upgrades on the first try
      transports: ['polling', 'websocket'],
    });

    io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

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

