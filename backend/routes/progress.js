/**
 * Progress Routes
 * Implements: Progress data retrieval for dashboards
 * Provides aggregated progress information for students and instructors
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getProgressData } = require('../services/progressCalculator');
const Progress = require('../models/Progress');
const router = express.Router();

// GET /api/progress/:userId/:courseId
// Implements: Dashboard data retrieval
// Returns comprehensive progress data including module statuses and statistics
router.get('/:userId/:courseId', authenticate, async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Authorization check: users can only view their own progress
    // Instructors can view any student's progress
    if (req.user.role !== 'instructor' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own progress'
      });
    }

    // Get progress data using the service
    const data = await getProgressData(userId, courseId);

    if (!data.progress) {
      return res.status(404).json({
        error: 'Progress not found',
        message: 'No progress data available for this user and course'
      });
    }

    // Format response for frontend consumption
    res.json({
      success: true,
      progress: data.progress,
      recentEvents: data.recentEvents,
      summary: {
        overallProgress: data.progress.overallProgress,
        totalModules: data.progress.modules.length,
        completedModules: data.progress.modules.filter(
          m => m.overallStatus === 'Completed'
        ).length,
        totalTimeSpent: data.progress.totalTimeSpent,
        lastActivity: data.progress.lastActivity
      }
    });
  } catch (error) {
    console.error('Progress retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve progress',
      message: error.message
    });
  }
});

// GET /api/progress/user/:courseId
// Get current user's progress for a course
router.get('/user/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const data = await getProgressData(req.user._id, courseId);

    res.json({
      success: true,
      progress: data.progress,
      recentEvents: data.recentEvents
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve progress',
      message: error.message
    });
  }
});

module.exports = router;

