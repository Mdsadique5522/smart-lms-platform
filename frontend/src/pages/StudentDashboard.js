/**
 * Student Dashboard Component
 * Implements: Progress visualization, module status display, charts
 * Shows automated progress tracking data - solves the PDF problem of unreliable progress
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/api/dashboard/student');
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data.courses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, []);

  // Fetch progress for selected course
  useEffect(() => {
    if (selectedCourse) {
      const fetchProgress = async () => {
        try {
          // First, ensure progress is initialized by accessing the course
          // This will trigger progress initialization if it doesn't exist
          await axios.get(`/api/courses/${selectedCourse}`);
          
          // Then fetch progress
          const response = await axios.get(`/api/progress/user/${selectedCourse}`);
          setProgressData(response.data);
        } catch (error) {
          console.error('Failed to fetch progress:', error);
          // If progress doesn't exist, initialize it
          try {
            const response = await axios.get(`/api/progress/user/${selectedCourse}`);
            setProgressData(response.data);
          } catch (retryError) {
            console.error('Failed to initialize progress:', retryError);
          }
        }
      };

      fetchProgress();
    }
  }, [selectedCourse]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  // Prepare chart data
  const statusData = dashboardData?.courses?.reduce((acc, course) => {
    const status = course.overallProgress === 100 ? 'Completed' : 
                   course.overallProgress > 0 ? 'In Progress' : 'Not Started';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  const chartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = {
    'Completed': '#28a745',
    'In Progress': '#ffc107',
    'Not Started': '#6c757d'
  };

  // Format time spent
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="dashboard-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Student Dashboard</h1>
          <p>Automated progress tracking - no manual updates needed!</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p className="stat-value">{dashboardData?.statistics?.totalCourses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-value">{dashboardData?.statistics?.completedCourses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <p className="stat-value">{dashboardData?.statistics?.inProgressCourses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Time</h3>
            <p className="stat-value">
              {formatTime(dashboardData?.statistics?.totalTimeSpent || 0)}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <div className="chart-container">
            <h3 className="chart-title">Course Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Course Progress Overview</h3>
            {dashboardData?.courses && dashboardData.courses.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.courses.map(course => ({
                  name: course.courseId?.title || 'Unknown',
                  progress: course.overallProgress || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                No courses available. Run the seed script to populate courses.
              </p>
            )}
          </div>
        </div>

        {/* Course List */}
        <div className="card">
          <h2>Available Courses</h2>
          {dashboardData?.courses && dashboardData.courses.length > 0 ? (
            <div className="courses-grid">
              {dashboardData.courses.map((course, index) => (
                <div key={course.courseId?._id || index} className="course-card">
                  <h3>{course.courseId?.title}</h3>
                  <p className="course-description">{course.courseId?.description}</p>
                  <div className="course-progress-info">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${course.overallProgress || 0}%` }}
                      >
                        {course.overallProgress || 0}%
                      </div>
                    </div>
                    <div className="course-stats">
                      <span className="stat-item">
                        Progress: {course.overallProgress || 0}%
                      </span>
                      {course.totalTimeSpent > 0 && (
                        <span className="stat-item">
                          Time: {formatTime(course.totalTimeSpent)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="course-actions">
                    <button
                      onClick={() => navigate(`/learn/${course.courseId?._id}`)}
                      className="btn btn-primary"
                    >
                      {course.overallProgress > 0 ? 'Continue Learning' : 'Start Learning'}
                    </button>
                    <button
                      onClick={() => setSelectedCourse(course.courseId?._id)}
                      className="btn btn-secondary"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '4px' }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>
                <strong>No courses available yet.</strong>
              </p>
              <p style={{ color: '#666', fontSize: '14px' }}>
                To populate the database with sample courses, run: <code>npm run seed</code>
              </p>
            </div>
          )}
        </div>

        {/* Course Selection for Detailed Progress */}
        {dashboardData?.courses && dashboardData.courses.length > 0 && (
          <div className="card">
            <h2>View Detailed Progress</h2>
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input"
            >
              <option value="">-- Select Course --</option>
              {dashboardData.courses.map(course => (
                <option key={course.courseId?._id} value={course.courseId?._id}>
                  {course.courseId?.title} ({course.overallProgress || 0}% complete)
                </option>
              ))}
            </select>

            {progressData && progressData.progress && (
              <div className="course-progress-detail">
                <h3>{progressData.progress.courseId?.title}</h3>
                <div className="overall-progress">
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${progressData.progress.overallProgress}%` }}
                    >
                      {progressData.progress.overallProgress}%
                    </div>
                  </div>
                </div>

                <div className="modules-progress">
                  <h4>Module Progress</h4>
                  {progressData.progress.modules.map((module, index) => (
                    <div key={index} className="module-progress-item">
                      <div className="module-header">
                        <span className="module-title">Module {index + 1}</span>
                        <span className={`status-badge status-${module.overallStatus.toLowerCase().replace(' ', '-')}`}>
                          {module.overallStatus}
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${module.completionPercentage}%` }}
                        >
                          {module.completionPercentage}%
                        </div>
                      </div>
                      <div className="content-items">
                        {module.contents.map((content, contentIndex) => (
                          <div key={contentIndex} className="content-progress-item">
                            <span className="content-type-badge">{content.contentType}</span>
                            <span className="content-status">
                              {content.status} ({content.percentage}%)
                            </span>
                            {content.timeSpent > 0 && (
                              <span className="time-spent">
                                Time: {formatTime(content.timeSpent)}
                              </span>
                            )}
                            {content.revisitCount > 0 && (
                              <span className="revisit-count">
                                Revisits: {content.revisitCount}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/learn/${selectedCourse}`)}
                  className="btn btn-primary"
                  style={{ marginTop: '20px' }}
                >
                  Continue Learning
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
          <div className="card">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-type">{activity.contentType}</span>
                  <span className="activity-details">
                    {activity.eventType} - {activity.percentage}%
                  </span>
                  <span className="activity-time">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

