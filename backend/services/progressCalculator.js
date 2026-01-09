/**
 * Progress Calculator Service
 * Implements: Business logic for automatic progress calculation
 * This is the core service that determines module status based on events
 * 
 * Rules:
 * - Video: ≥90% = Completed, >0 = In Progress
 * - Reading: ≥90% = Completed, >10% = In Progress
 * - Quiz: submitted = Completed
 */

const Progress = require('../models/Progress');
const Event = require('../models/Event');
const Course = require('../models/Course');

/**
 * Calculate status for a content item based on events
 * Implements: Status determination logic for different content types
 */
const calculateContentStatus = (contentType, percentage, isSubmitted) => {
  // Quiz: If submitted, it's completed
  if (contentType === 'quiz') {
    return isSubmitted ? 'Completed' : 'Not Started';
  }

  // Video: ≥90% = Completed, >0 = In Progress
  if (contentType === 'video') {
    if (percentage >= 90) return 'Completed';
    if (percentage > 0) return 'In Progress';
    return 'Not Started';
  }

  // Reading: ≥90% = Completed, >10% = In Progress
  if (contentType === 'reading') {
    if (percentage >= 90) return 'Completed';
    if (percentage > 10) return 'In Progress';
    return 'Not Started';
  }

  return 'Not Started';
};

/**
 * Update progress for a user-course combination
 * Implements: Event-driven progress calculation
 * This function is called automatically when events are created
 */
const updateProgress = async (userId, courseId) => {
  try {
    // Get all events for this user-course combination
    // Implements: Data aggregation from events
    const events = await Event.find({ userId, courseId })
      .sort({ timestamp: -1 });

    // Get course structure to understand modules and contents
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Initialize progress structure
    const moduleProgressMap = {};

    // Process each module in the course
    course.modules.forEach((module) => {
      moduleProgressMap[module._id.toString()] = {
        moduleId: module._id.toString(),
        contents: []
      };

      // Process each content item in the module
      module.contents.forEach((content) => {
        const contentId = content._id.toString();
        
        // Filter events for this specific content
        // Note: moduleId and contentId are stored as strings in events
        const contentEvents = events.filter(
          e => String(e.moduleId) === String(module._id) && 
               String(e.contentId) === String(contentId) &&
               e.contentType === content.type
        );

        // Calculate aggregated data from events
        let maxPercentage = 0;
        let totalTimeSpent = 0;
        let isSubmitted = false;
        let revisitCount = new Set();

        contentEvents.forEach(event => {
          // Track maximum percentage reached
          if (event.percentage > maxPercentage) {
            maxPercentage = event.percentage;
          }
          
          // Sum up time spent
          totalTimeSpent += event.timeSpent || 0;
          
          // Check if quiz was submitted
          if (content.type === 'quiz' && event.eventType === 'submit') {
            isSubmitted = true;
          }
          
          // Count unique revisit sessions (by date)
          const dateKey = new Date(event.timestamp).toDateString();
          revisitCount.add(dateKey);
        });

        // Calculate status based on business rules
        const status = calculateContentStatus(
          content.type,
          maxPercentage,
          isSubmitted
        );

        // Store progress for this content
        moduleProgressMap[module._id.toString()].contents.push({
          contentType: content.type,
          contentId: contentId,
          status: status,
          percentage: maxPercentage,
          lastUpdated: contentEvents.length > 0 
            ? contentEvents[0].timestamp 
            : new Date(),
          timeSpent: totalTimeSpent,
          revisitCount: revisitCount.size
        });
      });
    });

    // Calculate module-level progress
    const modules = Object.values(moduleProgressMap).map(moduleData => {
      const totalContents = moduleData.contents.length;
      const completedContents = moduleData.contents.filter(
        c => c.status === 'Completed'
      ).length;
      
      const completionPercentage = totalContents > 0
        ? Math.round((completedContents / totalContents) * 100)
        : 0;

      // Determine overall module status
      let overallStatus = 'Not Started';
      if (completionPercentage === 100) {
        overallStatus = 'Completed';
      } else if (completionPercentage > 0) {
        overallStatus = 'In Progress';
      }

      return {
        ...moduleData,
        overallStatus,
        completionPercentage
      };
    });

    // Calculate course-level overall progress
    // Use average of module completion percentages instead of counting completed modules
    // This gives a more accurate representation of student progress
    const totalModules = modules.length;
    const overallProgress = totalModules > 0
      ? Math.round(
          modules.reduce((sum, m) => sum + (m.completionPercentage || 0), 0) / totalModules
        )
      : 0;

    // Calculate total time spent across all modules
    const totalTimeSpent = modules.reduce((total, module) => {
      return total + module.contents.reduce((sum, content) => {
        return sum + (content.timeSpent || 0);
      }, 0);
    }, 0);

    // Find last activity timestamp
    const lastActivity = events.length > 0 
      ? events[0].timestamp 
      : new Date();

    // Update or create progress document
    // Implements: Upsert pattern (update if exists, insert if not)
    await Progress.findOneAndUpdate(
      { userId, courseId },
      {
        userId,
        courseId,
        modules,
        overallProgress,
        totalTimeSpent,
        lastActivity
      },
      { upsert: true, new: true }
    );

    return {
      success: true,
      message: 'Progress updated successfully'
    };
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

/**
 * Get progress data for dashboard
 * Implements: Data retrieval and formatting for frontend consumption
 */
const getProgressData = async (userId, courseId) => {
  try {
    // Get progress document
    let progress = await Progress.findOne({ userId, courseId })
      .populate('courseId', 'title description')
      .populate('userId', 'name email');

    // If no progress exists, initialize it with empty structure
    if (!progress) {
      // Get course structure first
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Initialize empty progress structure
      const modules = course.modules.map((module) => {
        const contents = module.contents.map((content) => ({
          contentType: content.type,
          contentId: content._id.toString(),
          status: 'Not Started',
          percentage: 0,
          lastUpdated: new Date(),
          timeSpent: 0,
          revisitCount: 0
        }));

        return {
          moduleId: module._id.toString(),
          contents,
          overallStatus: 'Not Started',
          completionPercentage: 0
        };
      });

      progress = new Progress({
        userId,
        courseId,
        modules,
        overallProgress: 0,
        totalTimeSpent: 0,
        lastActivity: new Date()
      });

      await progress.save();
      await progress.populate('courseId', 'title description');
      await progress.populate('userId', 'name email');
    }

    // Get recent events for activity timeline
    const recentEvents = await Event.find({ userId, courseId })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('eventType contentType percentage timestamp');

    return {
      progress,
      recentEvents
    };
  } catch (error) {
    console.error('Error getting progress data:', error);
    throw error;
  }
};

module.exports = {
  updateProgress,
  getProgressData,
  calculateContentStatus
};

