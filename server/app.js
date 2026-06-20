const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes');
const settingRoutes = require('./routes/settingRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middleware
<<<<<<< HEAD
app.use(cors({
  origin: 'http://localhost:5173',
=======
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // For Vercel preview deployments, we can just allow all for now, or match a pattern.
    // Given Render + Vercel, it's easiest to allow true if it's in the list or if we're in dev.
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // For Vercel, you might want to just let any origin in if CLIENT_URL is not strictly set yet
      // To prevent deployment issues, we will just pass true if CLIENT_URL is not set yet but we're in prod.
      if (!process.env.CLIENT_URL) {
         callback(null, true);
      } else {
         callback(new Error('Not allowed by CORS'));
      }
    }
  },
>>>>>>> 3f76ae5 (updated)
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files as static assets
// Files accessible at: http://localhost:5000/uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'TaskMaster API is running ✅' });
});

<<<<<<< HEAD
// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running in development... Please use client port to view the app.');
  });
}
=======
app.get('/', (req, res) => {
  res.send('TaskMaster API is running...');
});
>>>>>>> 3f76ae5 (updated)

module.exports = app;
