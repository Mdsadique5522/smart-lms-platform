# Student Progress Tracking System

A complete MERN stack application for automated student progress tracking. This system solves the problem of unreliable progress data by automatically tracking learning events without requiring manual student input.

## 🎯 Problem Statement

Traditional EdTech platforms rely on students to manually update their learning status, leading to:
- Students marked as completed without finishing content
- Students who complete everything but forget to update progress
- Unreliable and misleading progress data

## ✅ Solution

This system implements **event-driven architecture** to automatically track:
- Video watch percentage
- Reading material engagement (scroll percentage)
- Quiz or assignment completion
- Time spent and revisits
- Module-wise completion status

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Event-Driven Architecture**: All learning activities are tracked as events
- **Automatic Progress Calculation**: Progress is calculated automatically based on events
- **JWT Authentication**: Secure user authentication
- **MongoDB**: Document-based database for flexible data storage

### Frontend (React)
- **Learning Page**: Interactive content with automatic event tracking
- **Student Dashboard**: Visual progress tracking with charts
- **Instructor Dashboard**: Analytics and insights

## 📋 Features

### Automatic Progress Calculation Rules
- **Video**: ≥90% = Completed, >0% = In Progress
- **Reading**: ≥90% = Completed, >10% = In Progress
- **Quiz**: Submitted = Completed

### Collections
- `users`: User accounts (students and instructors)
- `courses`: Course structure with modules and content
- `events`: All learning events (video watch, reading scroll, quiz submission)
- `progress`: Aggregated progress data (automatically calculated)

### APIs
- `POST /api/events` → Save event and auto-trigger progress calculation
- `GET /api/progress/:userId/:courseId` → Return dashboard data
- `GET /api/dashboard/student` → Student dashboard data
- `GET /api/dashboard/instructor` → Instructor analytics

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (run setup script):
```bash
npm run setup
```
 

3. Make sure MongoDB is running (local or MongoDB Atlas)

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React app:
```bash
npm start
```
or
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Running Both Together

From the root directory:
```bash
npm run devall
```

## 📁 Project Structure

```
setu_project/
├── backend/
│   ├── models/          # MongoDB schemas (User, Course, Event, Progress)
│   ├── routes/          # API routes (auth, events, progress, courses, dashboard)
│   ├── middleware/      # Authentication middleware
│   ├── services/        # Business logic (progress calculation)
│   └── server.js        # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components (Login, Dashboard, Learning)
│   │   ├── context/     # React Context (Auth)
│   │   └── App.js       # Main app component
│   └── public/          # Static files
└── package.json         # Root package.json
```

## 🔐 Authentication

- **Registration**: Create account with name, email, password, and role (student/instructor)
- **Login**: JWT token-based authentication
- **Protected Routes**: Student and instructor dashboards require authentication

## 📊 Key Concepts Implemented

### Event-Driven Architecture
- All learning activities are stored as events
- Progress is automatically calculated from events
- No manual intervention required

### Automatic Progress Calculation
- Video progress: Tracks watch percentage automatically
- Reading progress: Tracks scroll percentage automatically
- Quiz progress: Marks complete on submission

### Real-time Updates
- Events trigger immediate progress recalculation
- Dashboard reflects current status without refresh

## 🎨 Frontend Pages

1. **Login/Register**: User authentication
2. **Learning Page**: Interactive content with automatic event tracking
3. **Student Dashboard**: 
   - Course progress overview
   - Module status visualization
   - Progress charts
   - Recent activity timeline
4. **Instructor Dashboard**:
   - Course analytics
   - Student performance metrics
   - Module completion rates
   - Recent student activity

## 🧪 Testing the System

### Quick Start with Sample Data

1. **Seed the database** with sample courses and users:
   ```bash
   npm run seed
   ```
   This will create:
   - 1 instructor account (instructor@example.com / instructor123)
   - 3 student accounts (alice@example.com, bob@example.com, charlie@example.com / student123)
   - 3 sample courses with modules, videos, readings, and quizzes
   - Sample progress data for demonstration

2. **Login as Student**:
   - Email: `alice@example.com`
   - Password: `student123`
   - You'll see all available courses in the dashboard

3. **Login as Instructor**:
   - Email: `instructor@example.com`
   - Password: `instructor123`
   - View analytics and student progress

4. **Access Learning Page**: Click on a course and interact with content to see automatic progress tracking

5. **View Dashboard**: See automatic progress updates and charts

### Manual Testing

1. **Register as Instructor**: Create an instructor account
2. **Create Course**: Use the API or seed data to create a course with modules
3. **Register as Student**: Create a student account
4. **Access Learning Page**: Navigate to a course and interact with content
5. **View Dashboard**: See automatic progress updates
6. **Instructor View**: Check analytics and student performance

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events
- `POST /api/events` - Create learning event (auto-triggers progress update)
- `GET /api/events` - Get user events

### Progress
- `GET /api/progress/:userId/:courseId` - Get progress data
- `GET /api/progress/user/:courseId` - Get current user's progress

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor only)

### Dashboard
- `GET /api/dashboard/student` - Student dashboard data
- `GET /api/dashboard/instructor` - Instructor dashboard data
- `GET /api/dashboard/instructor/course/:courseId` - Course analytics

## 🔧 Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- **Frontend**: React, React Router, Axios, Recharts
- **Database**: MongoDB

## 📌 Notes

- All progress calculations happen automatically - no manual updates needed
- Events are stored for audit trail and analytics
- Progress is recalculated on every event to ensure accuracy
- JWT tokens expire after 7 days

## 🎯 Expected Outcomes (From PDF)

✅ Video watch percentage tracking  
✅ Reading material engagement tracking  
✅ Quiz completion tracking  
✅ Time spent and revisits tracking  
✅ Module-wise completion status  
✅ Automatic status updates (Not Started → In Progress → Completed)  
✅ Dashboard with clear visualization  
✅ Edge case handling  
✅ Clean code structure with comments

## 📄 License

This project is created for educational purposes.

