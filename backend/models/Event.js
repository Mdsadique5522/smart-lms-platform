/**
 * Event Model
 * Implements: Event-driven architecture pattern
 * Stores all learning events (video watch, reading scroll, quiz submission)
 * This is the core of the automated tracking system
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster queries
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  moduleId: {
    type: String, // Module ID within the course
    required: true
  },
  contentType: {
    type: String,
    enum: ['video', 'reading', 'quiz'],
    required: true
  },
  contentId: {
    type: String, // Content ID within the module
    required: true
  },
  // Event-specific data
  eventType: {
    type: String,
    enum: ['watch', 'scroll', 'submit'],
    required: true
  },
  // Percentage data for video/reading
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Additional metadata
  timestamp: {
    type: Date,
    default: Date.now
  },
  timeSpent: { // Time spent in seconds
    type: Number,
    default: 0
  },
  metadata: { // Flexible field for additional data
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound Index for efficient queries
// Implements: Database indexing for performance optimization
eventSchema.index({ userId: 1, courseId: 1, moduleId: 1, contentType: 1 });

module.exports = mongoose.model('Event', eventSchema);

