require('dotenv').config();
const http = require('http');
const app = require('./app');
const socketModule = require('./socket');
const connectDB = require('./config/db');
const { startReminderScheduler } = require('./services/reminderScheduler');

const PORT = process.env.PORT || 5000;

// Wrap Express in an HTTP server so Socket.io can share the same port
const httpServer = http.createServer(app);

// Initialise Socket.io (must happen before any controller imports getIO)
socketModule.init(httpServer);

// Connect to MongoDB
connectDB();

// Start cron jobs
startReminderScheduler();

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (HTTP + WebSocket)`);
});
