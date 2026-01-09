/**
 * Courses Routes
 * Implements: Course CRUD operations, course listing, file uploads
 * Handles course creation, retrieval, and media file uploads
 */

const express = require('express');
const Course = require('../models/Course');
const { authenticate, isInstructor } = require('../middleware/auth');
const { saveVideoFile, savePdfFile, deleteVideoFile, deletePdfFile } = require('../services/mediaUploadService');
const router = express.Router();

// Middleware to handle file uploads
const handleFileUpload = (req, res, next) => {
  const uploadMiddleware = req.upload.single('file');
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: 'File upload error',
        message: err.message
      });
    }
    next();
  });
};

// POST /api/courses/upload-video
// Upload a video file
router.post('/upload-video', authenticate, isInstructor, handleFileUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please upload a video file'
      });
    }

    const videoFileData = saveVideoFile(req.file);

    res.status(200).json({
      message: 'Video uploaded successfully',
      videoFile: videoFileData
    });
  } catch (error) {
    res.status(400).json({
      error: 'Video upload failed',
      message: error.message
    });
  }
});

// POST /api/courses/upload-pdf
// Upload a PDF file
router.post('/upload-pdf', authenticate, isInstructor, handleFileUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please upload a PDF file'
      });
    }

    const pdfFileData = savePdfFile(req.file);

    res.status(200).json({
      message: 'PDF uploaded successfully',
      pdfFile: pdfFileData
    });
  } catch (error) {
    res.status(400).json({
      error: 'PDF upload failed',
      message: error.message
    });
  }
});

// GET /api/courses
// Get all courses (students see enrolled, instructors see their courses)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};
    
    // Instructors see only their courses
    if (req.user.role === 'instructor') {
      query.instructor = req.user._id;
    }
    // Students see all courses (in a real app, you'd have enrollment logic)
    // For this demo, students can see all courses

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      courses,
      count: courses.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch courses',
      message: error.message
    });
  }
});

// GET /api/courses/:id
// Get a specific course with full details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course does not exist'
      });
    }

    res.json({
      course
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch course',
      message: error.message
    });
  }
});

// POST /api/courses
// Create a new course (instructors only)
router.post('/', authenticate, isInstructor, async (req, res) => {
  try {
    const { title, description, modules } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Course title is required'
      });
    }

    const course = new Course({
      title,
      description: description || '',
      instructor: req.user._id,
      modules: modules || []
    });

    await course.save();
    await course.populate('instructor', 'name email');

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create course',
      message: error.message
    });
  }
});

// PUT /api/courses/:id
// Update a course (instructors only, own courses)
router.put('/:id', authenticate, isInstructor, async (req, res) => {
  try {
    const { title, description, modules } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course does not exist'
      });
    }

    // Verify instructor owns this course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only edit your own courses'
      });
    }

    course.title = title || course.title;
    course.description = description !== undefined ? description : course.description;
    if (modules) course.modules = modules;

    await course.save();
    await course.populate('instructor', 'name email');

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update course',
      message: error.message
    });
  }
});

// DELETE /api/courses/:id
// Delete a course (instructors only, own courses)
router.delete('/:id', authenticate, isInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course does not exist'
      });
    }

    // Verify instructor owns this course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own courses'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete course',
      message: error.message
    });
  }
});

module.exports = router;

