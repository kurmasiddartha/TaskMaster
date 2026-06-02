# TaskMaster - AI-Powered Task Management Platform

TaskMaster is a full-stack MERN platform designed for students and teams to manage projects and tasks efficiently. Users can register with OTP verification, create projects, invite team members, assign and track tasks with priorities and deadlines, upload file attachments, submit tasks for review, receive notifications, view analytics, and get AI-powered assistance through an integrated chat assistant using the Hugging Face API.

## Features

- JWT-based authentication with email OTP verification
- Secure password hashing with bcrypt
- User profile management with avatar upload and password change
- Project creation with team member management (add and remove members)
- Task CRUD with priority levels, due dates, status tracking, and drag-and-drop reorder
- File attachment upload and download on tasks
- Task review workflow with submit, approve, and reject actions
- In-app notification system with mark as read
- Dashboard analytics with task statistics
- Activity timeline per project
- AI-powered chat assistant using Hugging Face API
- Email notifications via Nodemailer
- Reminder scheduler for upcoming deadlines
- User settings and preferences
- Responsive React frontend with vanilla CSS
- Production-ready with static file serving

## Tech Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Vanilla CSS

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- Multer (file uploads)
- Nodemailer
- dotenv
- CORS

### AI

- Hugging Face Inference API
- Model: mistralai/Mistral-7B-Instruct-v0.2

## Folder Structure

```
TaskMaster/
  server/
    config/
      db.js
    controllers/
      activityController.js
      aiController.js
      analyticsController.js
      authController.js
      notificationController.js
      projectController.js
      settingController.js
      taskController.js
      userController.js
    middleware/
      authMiddleware.js
      uploadMiddleware.js
    models/
      ActivityLog.js
      Notification.js
      Project.js
      Reminder.js
      Task.js
      User.js
    routes/
      activityRoutes.js
      aiRoutes.js
      analyticsRoutes.js
      authRoutes.js
      notificationRoutes.js
      projectRoutes.js
      settingRoutes.js
      taskRoutes.js
      userRoutes.js
    services/
      aiService.js
      emailService.js
      otpService.js
      reminderScheduler.js
    uploads/
    app.js
    server.js
    package.json
    .env

  client/
    src/
      api/
        axios.js
      components/
        ai/
          AIAssistant.jsx
          ChatMessage.jsx
          TypingIndicator.jsx
        ActivityTimeline.jsx
        CreateProjectModal.jsx
        CreateTaskModal.jsx
        DashboardLayout.jsx
        ManageMembersModal.jsx
        NotificationDropdown.jsx
        ProtectedRoute.jsx
      context/
        AuthContext.jsx
      hooks/
        useAIChat.js
      pages/
        Dashboard.jsx
        Login.jsx
        MyTasks.jsx
        Profile.jsx
        ProjectDetails.jsx
        Projects.jsx
        Register.jsx
        Settings.jsx
        VerifyOTP.jsx
        Welcome.jsx
      services/
        activityService.js
        analyticsService.js
        aiApi.js
        axios.js
        notificationService.js
        projectService.js
        taskService.js
      styles/
        aiAssistant.css
        welcome.css
      App.jsx
      main.jsx
      index.css
    package.json
```

## Backend Setup

```bash
cd server
npm install
npm run dev
```

The backend runs on:

http://localhost:5000

Health check:

```
GET http://localhost:5000/api/health
```

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend runs on:

http://localhost:5173

## Environment Variables

Create a `.env` file inside the `server` folder.

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
HF_API_KEY=your_hugging_face_api_key
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
```

## API Endpoints

### Auth

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/resend-otp
GET  /api/auth/me
```

### Projects

```
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
DELETE /api/projects/:id/members/:userId
```

### Tasks

```
POST /api/tasks
GET  /api/tasks/my
GET  /api/tasks/project/:projectId
PUT  /api/tasks/:id
DELETE /api/tasks/:id
PUT  /api/tasks/reorder
POST /api/tasks/:id/submit-review
POST /api/tasks/:id/approve
POST /api/tasks/:id/reject
GET  /api/tasks/:id/download
```

### Notifications

```
GET /api/notifications
PUT /api/notifications/:id/read
PUT /api/notifications/read-all
```

### Analytics

```
GET /api/analytics/dashboard
```

### Activities

```
GET /api/activities/project/:projectId
```

### Users

```
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/change-password
```

### Settings

```
GET /api/settings
PUT /api/settings
```

### AI

```
POST /api/ai/chat
```

## AI Integration

TaskMaster uses the Hugging Face Inference API from the backend. The AI assistant helps students with coding questions, debugging, project guidance, and academic support. Users can chat with the assistant directly from the dashboard sidebar.

The backend sends the user message to Hugging Face and returns the AI response. If the Hugging Face API is unavailable, the backend returns a fallback error message so the app remains functional.

## Task Review Workflow

Tasks follow a review workflow:

1. A team member creates a task and works on it.
2. The member submits the task for review.
3. The project owner or reviewer approves or rejects the task.
4. Approved tasks are marked as completed.
5. Rejected tasks are sent back for rework.

Notifications are generated at each step to keep all team members informed.
