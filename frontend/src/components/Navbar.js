/**
 * Navigation Bar Component
 * Implements: Reusable navigation component, role-based menu items
 * Provides navigation and logout functionality
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          📚 SETU 2.0 Learning Platform
        </Link>

        {user ? (
          <div className="navbar-menu">
            {user.role === 'student' ? (
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/instructor-dashboard" className="navbar-link">
                  Instructor Dashboard
                </Link>
                <Link to="/manage-courses" className="navbar-link">
                  Manage Courses
                </Link>
              </>
            )}
            <span className="navbar-user">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-menu">
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="navbar-link">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

