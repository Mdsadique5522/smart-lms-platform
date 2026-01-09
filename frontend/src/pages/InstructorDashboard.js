/**
 * Instructor Dashboard Component
 * Implements: Analytics visualization, course performance metrics
 * Provides instructors with insights into student progress and engagement
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'manage'

  // Fetch instructor dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/api/dashboard/instructor');
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch detailed analytics for selected course
  useEffect(() => {
    if (selectedCourse) {
      const fetchCourseAnalytics = async () => {
        try {
          const response = await axios.get(`/api/dashboard/instructor/course/${selectedCourse}`);
          setCourseAnalytics(response.data);
        } catch (error) {
          console.error('Failed to fetch course analytics:', error);
        }
      };

      fetchCourseAnalytics();
    }
  }, [selectedCourse]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Instructor Dashboard</h1>
          <p>Analytics and course management</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Courses
          </button>
        </div>

        {activeTab === 'manage' ? (
          <div className="card">
            <h2>Course Management</h2>
            <p>Create, edit, and delete your courses here.</p>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => navigate('/manage-courses')}
                className="btn btn-primary"
              >
                Go to Course Management
              </button>
            </div>
          </div>
        ) : (
          <>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p className="stat-value">{dashboardData?.statistics?.totalCourses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Students</h3>
            <p className="stat-value">{dashboardData?.statistics?.totalStudents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Enrollments</h3>
            <p className="stat-value">{dashboardData?.statistics?.totalEnrollments || 0}</p>
          </div>
        </div>

        {/* Course Analytics Overview */}
        <div className="card">
          <h2>Course Performance Overview</h2>
          {dashboardData?.courseAnalytics && dashboardData.courseAnalytics.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dashboardData.courseAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="courseTitle" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="enrolledStudents" fill="#8884d8" name="Enrolled Students" />
                <Bar dataKey="completedStudents" fill="#82ca9d" name="Completed Students" />
                <Bar dataKey="averageProgress" fill="#ffc658" name="Avg Progress %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No course data available</p>
          )}
        </div>

        {/* Course List with Analytics */}
        <div className="card">
          <h2>Course Analytics</h2>
          <div className="course-analytics-list">
            {dashboardData?.courseAnalytics?.map((course) => (
              <div key={course.courseId} className="course-analytics-item">
                <div className="course-header">
                  <h3>{course.courseTitle}</h3>
                  <button
                    onClick={() => setSelectedCourse(course.courseId)}
                    className="btn btn-primary"
                  >
                    View Details
                  </button>
                </div>
                <div className="analytics-metrics">
                  <div className="metric">
                    <span className="metric-label">Enrolled Students:</span>
                    <span className="metric-value">{course.enrolledStudents}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Completed:</span>
                    <span className="metric-value">{course.completedStudents}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Completion Rate:</span>
                    <span className="metric-value">{course.completionRate}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Average Progress:</span>
                    <span className="metric-value">{course.averageProgress}%</span>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${course.completionRate}%` }}
                  >
                    {course.completionRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Course Analytics */}
        {courseAnalytics && (
          <div className="card">
            <h2>Detailed Analytics: {courseAnalytics.course.title}</h2>
            
            <div className="course-stats">
              <div className="stat-item">
                <span className="stat-label">Total Students:</span>
                <span className="stat-value">{courseAnalytics.statistics.totalStudents || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed:</span>
                <span className="stat-value">{courseAnalytics.statistics.completedStudents || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completion Rate:</span>
                <span className="stat-value">{courseAnalytics.statistics.completionRate || 0}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average Progress:</span>
                <span className="stat-value">{courseAnalytics.statistics.averageProgress || 0}%</span>
              </div>
            </div>

            <h3>Module Performance</h3>
            {courseAnalytics.moduleAnalytics && courseAnalytics.moduleAnalytics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseAnalytics.moduleAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="moduleTitle" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalStudents" fill="#8884d8" name="Total Students" />
                  <Bar dataKey="completedStudents" fill="#82ca9d" name="Completed" />
                  <Bar dataKey="completionRate" fill="#ffc658" name="Completion Rate %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No module data available</p>
            )}

            <div className="module-analytics-list">
              {courseAnalytics.moduleAnalytics?.map((module, index) => (
                <div key={index} className="module-analytics-item">
                  <h4>{module.moduleTitle}</h4>
                  <div className="analytics-metrics">
                    <div className="metric">
                      <span className="metric-label">Total Students:</span>
                      <span className="metric-value">{module.totalStudents}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Completed:</span>
                      <span className="metric-value">{module.completedStudents}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Completion Rate:</span>
                      <span className="metric-value">{module.completionRate}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Average Progress:</span>
                      <span className="metric-value">{module.averageProgress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
          <div className="card">
            <h2>Recent Student Activity</h2>
            <div className="activity-list">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-user">{activity.userId?.name}</span>
                  <span className="activity-type">{activity.contentType}</span>
                  <span className="activity-details">
                    {activity.eventType} - {activity.percentage}%
                  </span>
                  <span className="activity-course">{activity.courseId?.title}</span>
                  <span className="activity-time">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;

