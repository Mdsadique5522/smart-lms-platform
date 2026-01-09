/**
 * Events Routes
 * Implements: Event creation, automatic progress calculation trigger
 * This is the core API that receives learning events and updates progress
 */

const express = require('express');
const Event = require('../models/Event');
const { authenticate } = require('../middleware/auth');
const { updateProgress } = require('../services/progressCalculator');
const router = express.Router();

// POST /api/events
// Implements: Event-driven architecture, automatic progress calculation
// This endpoint receives learning events and triggers progress updates
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      courseId,
      moduleId,
      contentType, // 'video', 'reading', or 'quiz'
      contentId,
      eventType, // 'watch', 'scroll', or 'submit'
      percentage,
      timeSpent,
      metadata
    } = req.body;

    // Validation
    if (!courseId || !moduleId || !contentType || !contentId || !eventType) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Missing required fields: courseId, moduleId, contentType, contentId, eventType'
      });
    }

    // Validate contentType and eventType combination
    const validCombinations = {
      video: ['watch'],
      reading: ['scroll'],
      quiz: ['submit']
    };

    if (!validCombinations[contentType]?.includes(eventType)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Invalid eventType '${eventType}' for contentType '${contentType}'`
      });
    }

    // Create event document
    // Implements: Event sourcing pattern - all learning activities are stored as events
    const event = new Event({
      userId: req.user._id,
      courseId,
      moduleId,
      contentType,
      contentId,
      eventType,
      percentage: percentage || 0,
      timeSpent: timeSpent || 0,
      metadata: metadata || {},
      timestamp: new Date()
    });

    await event.save();

    // Automatically trigger progress calculation
    // Implements: Event-driven progress update - no manual intervention needed
    // This solves the problem mentioned in the PDF: automatic tracking without manual updates
    try {
      await updateProgress(req.user._id, courseId);
    } catch (progressError) {
      console.error('Progress calculation error:', progressError);
      // Don't fail the event creation if progress calculation fails
      // Event is still saved, progress can be recalculated later
    }

    res.status(201).json({
      message: 'Event recorded successfully',
      event: {
        id: event._id,
        contentType: event.contentType,
        eventType: event.eventType,
        percentage: event.percentage,
        timestamp: event.timestamp
      }
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({
      error: 'Failed to record event',
      message: error.message
    });
  }
});

// GET /api/events
// Get events for a user (optional filtering)
router.get('/', authenticate, async (req, res) => {
  try {
    const { courseId, contentType, limit = 50 } = req.query;
    
    const query = { userId: req.user._id };
    if (courseId) query.courseId = courseId;
    if (contentType) query.contentType = contentType;

    const events = await Event.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('courseId', 'title');

    res.json({
      events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

module.exports = router;

