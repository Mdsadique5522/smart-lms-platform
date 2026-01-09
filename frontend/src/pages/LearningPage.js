/**
 * Learning Page Component
 * Implements: Event tracking, real-time progress updates
 * This is where students interact with course content and events are automatically tracked
 * Now supports video playback and PDF viewing with automatic progress tracking
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';
import PdfViewer from '../components/PdfViewer';
import './LearningPage.css';

const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch course data and initialize progress
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}`);
        setCourse(response.data.course);
        if (response.data.course.modules.length > 0) {
          setSelectedModule(response.data.course.modules[0]);
        }
        
        // Initialize progress for this course if it doesn't exist
        try {
          await axios.get(`/api/progress/user/${courseId}`);
        } catch (progressError) {
          // Progress will be initialized automatically when first event is created
          console.log('Progress will be initialized on first event');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load course');
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Send event to backend
  // Implements: Event-driven architecture - sends learning events automatically
  const sendEvent = async (contentType, eventType, percentage, timeSpent = 0) => {
    try {
      await axios.post('/api/events', {
        courseId,
        moduleId: selectedModule._id,
        contentType,
        contentId: selectedContent._id,
        eventType,
        percentage,
        timeSpent,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Failed to send event:', err);
    }
  };

  // Handle reading scroll tracking
  // Implements: Automatic reading scroll percentage tracking
  const handleReadingScroll = (e) => {
    const element = e.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const percentage = Math.round((scrollTop / scrollHeight) * 100);
    setReadingProgress(percentage);

    // Send event at key milestones
    if (percentage % 10 === 0 || percentage >= 90) {
      sendEvent('reading', 'scroll', percentage, 0);
    }
  };

  // Handle quiz submission
  // Implements: Quiz completion tracking
  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const answers = {};
    
    for (let [key, value] of formData.entries()) {
      answers[key] = value;
    }

    // Send quiz submission event
    await sendEvent('quiz', 'submit', 100, 0);
    
    alert('Quiz submitted successfully! Progress updated automatically.');
  };

  // Select content to view
  const handleContentSelect = (content) => {
    setSelectedContent(content);
    setVideoProgress(0);
    setReadingProgress(0);
  };

  if (loading) {
    return <div className="loading">Loading course...</div>;
  }

  if (error || !course) {
    return <div className="error-message">{error || 'Course not found'}</div>;
  }

  return (
    <div className="learning-page">
      <div className="learning-container">
        <div className="learning-sidebar">
          <h2>{course.title}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            ← Back to Dashboard
          </button>

          <div className="modules-list">
            <h3>Modules</h3>
            {course.modules.map((module) => (
              <div
                key={module._id}
                className={`module-item ${
                  selectedModule?._id === module._id ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedModule(module);
                  setSelectedContent(null);
                }}
              >
                <strong>{module.title}</strong>
                <span className="module-order">Module {module.order}</span>
              </div>
            ))}
          </div>

          {selectedModule && (
            <div className="contents-list">
              <h3>Contents</h3>
              {selectedModule.contents.map((content) => (
                <div
                  key={content._id}
                  className={`content-item ${
                    selectedContent?._id === content._id ? 'active' : ''
                  }`}
                  onClick={() => handleContentSelect(content)}
                >
                  <span className="content-type">{content.type}</span>
                  <span>{content.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="learning-content">
          {selectedContent ? (
            <div className="content-viewer">
              <h2>{selectedContent.title}</h2>

              {selectedContent.type === 'video' && (
                <div className="video-container">
                  <VideoPlayer
                    content={selectedContent}
                    courseId={courseId}
                    moduleId={selectedModule._id}
                    onProgressUpdate={(progress) => setVideoProgress(progress)}
                  />
                </div>
              )}

              {selectedContent.type === 'reading' && (
                <div className="reading-container">
                  {selectedContent.pdfFile ? (
                    <PdfViewer
                      content={selectedContent}
                      courseId={courseId}
                      moduleId={selectedModule._id}
                      onProgressUpdate={(progress) => setReadingProgress(progress)}
                    />
                  ) : (
                    <div
                      className="reading-content"
                      onScroll={handleReadingScroll}
                      style={{
                        height: '600px',
                        overflowY: 'auto',
                        padding: '30px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        lineHeight: '1.8',
                        fontSize: '16px'
                      }}
                    >
                      <h3 style={{ marginBottom: '20px', color: '#333' }}>{selectedContent.title}</h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedContent.content || `
                            <h2>Introduction</h2>
                            <p>This is comprehensive reading content. Scroll down to track your progress automatically.</p>
                            
                            <h3>Section 1: Fundamentals</h3>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                            
                            <h3>Section 2: Advanced Concepts</h3>
                            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
                            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
                            
                            <h3>Section 3: Practical Applications</h3>
                            <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
                            <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.</p>
                            
                            <h3>Section 4: Best Practices</h3>
                            <p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.</p>
                            <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
                            
                            <h3>Section 5: Conclusion</h3>
                            <p>Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.</p>
                            <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.</p>
                            
                            <h3>Additional Resources</h3>
                            <p>Omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>
                            <p>Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
                          `
                        }}
                      />
                    </div>
                  )}
                  <div className="progress-info" style={{ marginTop: '15px' }}>
                    <span style={{ fontWeight: '600' }}>Scroll Progress: {readingProgress}%</span>
                    <span style={{ marginLeft: '20px' }}>
                      Status: {readingProgress >= 90
                        ? '✅ Completed'
                        : readingProgress > 10
                        ? '⏳ In Progress'
                        : '⏸️ Not Started'}
                    </span>
                  </div>
                  <p className="info-text">
                    <strong>Auto-tracking:</strong> Your scroll progress is automatically saved as you scroll.
                    ≥90% = Completed, &gt;10% = In Progress
                  </p>
                </div>
              )}

              {selectedContent.type === 'quiz' && (
                <div className="quiz-container">
                  <form onSubmit={handleQuizSubmit}>
                    <h3>{selectedContent.title}</h3>
                    {selectedContent.questions?.map((question, index) => (
                      <div key={index} className="question-item">
                        <p><strong>Q{index + 1}:</strong> {question.question}</p>
                        {question.options.map((option, optIndex) => (
                          <label key={optIndex} className="option-label">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={optIndex}
                              required
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    ))}
                    <button type="submit" className="btn btn-primary">
                      Submit Quiz
                    </button>
                  </form>
                  <p className="info-text">
                    <strong>Auto-tracking:</strong> Submitting the quiz automatically marks it as Completed.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="no-content-selected">
              <p>Select a content item from the sidebar to start learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPage;

