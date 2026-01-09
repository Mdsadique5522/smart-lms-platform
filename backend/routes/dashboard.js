/**
 * Dashboard Routes
 * Implements: Analytics and aggregated data for dashboards
 * Provides data for both student and instructor dashboards
 */

const express = require('express');
const { authenticate, isInstructor } = require('../middleware/auth');
const Progress = require('../models/Progress');
const Event = require('../models/Event');
const Course = require('../models/Course');
const User = require('../models/User');
const router = express.Router();

// GET /api/dashboard/student
// Student dashboard data
router.get('/student', authenticate, async (req, res) => {
  try {
    // Get all available courses (students can see all courses)
    const allCourses = await Course.find({})
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    // Get all progress for this student
    const progressDocs = await Progress.find({ userId: req.user._id })
      .populate('courseId', 'title description')
      .sort({ lastActivity: -1 });

    // Create a map of courseId to progress for quick lookup
    const progressMap = {};
    progressDocs.forEach(p => {
      progressMap[p.courseId._id.toString()] = p;
    });

    // Combine courses with their progress (or create default progress)
    const coursesWithProgress = allCourses.map(course => {
      const progress = progressMap[course._id.toString()];
      if (progress) {
        return {
          courseId: course,
          overallProgress: progress.overallProgress,
          totalTimeSpent: progress.totalTimeSpent || 0,
          lastActivity: progress.lastActivity
        };
      } else {
        // No progress yet - show as not started
        return {
          courseId: course,
          overallProgress: 0,
          totalTimeSpent: 0,
          lastActivity: null
        };
      }
    });

    // Calculate statistics based on all courses
    const totalCourses = coursesWithProgress.length;
    const completedCourses = coursesWithProgress.filter(
      c => c.overallProgress === 100
    ).length;
    const inProgressCourses = coursesWithProgress.filter(
      c => c.overallProgress > 0 && c.overallProgress < 100
    ).length;
    
    const totalTimeSpent = coursesWithProgress.reduce(
      (sum, c) => sum + (c.totalTimeSpent || 0), 
      0
    );

    // Get recent activity
    const recentEvents = await Event.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('courseId', 'title');

    res.json({
      success: true,
      courses: coursesWithProgress,
      statistics: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalTimeSpent,
        averageProgress: totalCourses > 0
          ? Math.round(
              coursesWithProgress.reduce((sum, c) => sum + c.overallProgress, 0) / totalCourses
            )
          : 0
      },
      recentActivity: recentEvents
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

// GET /api/dashboard/instructor
// Instructor dashboard analytics
router.get('/instructor', authenticate, isInstructor, async (req, res) => {
  try {
    // Get all courses by this instructor
    const courses = await Course.find({ instructor: req.user._id });

    // Get all progress for these courses
    const courseIds = courses.map(c => c._id);
    const allProgress = await Progress.find({ courseId: { $in: courseIds } })
      .populate('userId', 'name email')
      .populate('courseId', 'title');

    // Calculate analytics
    const totalStudents = new Set(allProgress.map(p => p.userId._id.toString())).size;
    const totalCourses = courses.length;
    
    // Course-wise statistics
    const courseStats = courses.map(course => {
      const courseProgress = allProgress.filter(
        p => p.courseId._id.toString() === course._id.toString()
      );
      
      const enrolledStudents = courseProgress.length;
      const completedStudents = courseProgress.filter(p => {
        // A course is completed if all modules are completed
        if (!p.modules || p.modules.length === 0) return false;
        return p.modules.every(m => m.overallStatus === 'Completed');
      }).length;
      
      // Calculate average progress from module completion percentages
      const averageProgress = enrolledStudents > 0
        ? Math.round(
            courseProgress.reduce((sum, p) => {
              if (!p.modules || p.modules.length === 0) return sum;
              const courseProgressValue = p.modules.reduce((moduleSum, m) => 
                moduleSum + (m.completionPercentage || 0), 0) / p.modules.length;
              return sum + courseProgressValue;
            }, 0) / enrolledStudents
          )
        : 0;

      return {
        courseId: course._id,
        courseTitle: course.title,
        enrolledStudents,
        completedStudents,
        averageProgress,
        completionRate: enrolledStudents > 0
          ? Math.round((completedStudents / enrolledStudents) * 100)
          : 0
      };
    });

    // Get recent events across all courses
    const recentEvents = await Event.find({ courseId: { $in: courseIds } })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('userId', 'name')
      .populate('courseId', 'title');

    res.json({
      success: true,
      statistics: {
        totalCourses,
        totalStudents,
        totalEnrollments: allProgress.length
      },
      courseAnalytics: courseStats,
      recentActivity: recentEvents
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch instructor dashboard',
      message: error.message
    });
  }
});

// GET /api/dashboard/instructor/course/:courseId
// Detailed analytics for a specific course
router.get('/instructor/course/:courseId', authenticate, isInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify instructor owns this course
    const course = await Course.findOne({
      _id: courseId,
      instructor: req.user._id
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course does not exist or you do not have access'
      });
    }

    // Get all student progress for this course
    const allProgress = await Progress.find({ courseId })
      .populate('userId', 'name email');

    // Calculate course-level statistics
    // Recalculate overallProgress from module data for accuracy
    const totalStudents = allProgress.length;
    const completedStudents = allProgress.filter(p => {
      // A course is completed if all modules are completed
      if (!p.modules || p.modules.length === 0) return false;
      return p.modules.every(m => m.overallStatus === 'Completed');
    }).length;
    
    // Calculate average progress from module completion percentages
    const averageProgress = totalStudents > 0
      ? Math.round(
          allProgress.reduce((sum, p) => {
            if (!p.modules || p.modules.length === 0) return sum;
            const courseProgress = p.modules.reduce((moduleSum, m) => 
              moduleSum + (m.completionPercentage || 0), 0) / p.modules.length;
            return sum + courseProgress;
          }, 0) / totalStudents
        )
      : 0;
    
    const completionRate = totalStudents > 0
      ? Math.round((completedStudents / totalStudents) * 100)
      : 0;

    // Module-wise analytics
    const moduleAnalytics = course.modules.map(module => {
      const moduleProgress = allProgress.map(p => {
        const moduleData = p.modules.find(m => m.moduleId === module._id.toString());
        return moduleData || null;
      }).filter(Boolean);

      const moduleTotalStudents = moduleProgress.length;
      const moduleCompletedStudents = moduleProgress.filter(
        m => m.overallStatus === 'Completed'
      ).length;

      return {
        moduleId: module._id,
        moduleTitle: module.title,
        totalStudents: moduleTotalStudents,
        completedStudents: moduleCompletedStudents,
        completionRate: moduleTotalStudents > 0
          ? Math.round((moduleCompletedStudents / moduleTotalStudents) * 100)
          : 0,
        averageProgress: moduleTotalStudents > 0
          ? Math.round(
              moduleProgress.reduce((sum, m) => sum + (m.completionPercentage || 0), 0) / moduleTotalStudents
            )
          : 0
      };
    });

    res.json({
      success: true,
      course: {
        id: course._id,
        title: course.title,
        description: course.description
      },
      statistics: {
        totalStudents,
        completedStudents,
        averageProgress,
        completionRate
      },
      moduleAnalytics
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch course analytics',
      message: error.message
    });
  }
});

module.exports = router;

