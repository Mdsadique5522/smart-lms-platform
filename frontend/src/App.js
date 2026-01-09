/**
 * Main App Component
 * Implements: React Router setup, authentication context, route protection
 * Handles routing and authentication state management
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import LearningPage from './pages/LearningPage';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseManagement from './pages/CourseManagement';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
// Implements: Route protection based on authentication status
const ProtectedRoute = ({ children, requireInstructor = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireInstructor && user.role !== 'instructor') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" /> : <Register />} 
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor-dashboard"
        element={
          <ProtectedRoute requireInstructor={true}>
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/learn/:courseId"
        element={
          <ProtectedRoute>
            <LearningPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-courses"
        element={
          <ProtectedRoute requireInstructor={true}>
            <CourseManagement />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

