/**
 * Course Management Component
 * Implements: Course creation and management for instructors
 * Allows instructors to add modules with videos, readings, and quizzes
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CourseManagement.css';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    modules: []
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data.courses);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setLoading(false);
    }
  };

  // Add a new module
  const addModule = () => {
    const newModule = {
      title: '',
      description: '',
      order: formData.modules.length + 1,
      contents: []
    };
    setFormData({
      ...formData,
      modules: [...formData.modules, newModule]
    });
  };

  // Update module
  const updateModule = (index, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setFormData({ ...formData, modules: updatedModules });
  };

  // Delete module
  const deleteModule = (index) => {
    const updatedModules = formData.modules.filter((_, i) => i !== index);
    // Reorder modules
    updatedModules.forEach((module, i) => {
      module.order = i + 1;
    });
    setFormData({ ...formData, modules: updatedModules });
  };

  // Add content to module
  const addContent = (moduleIndex, contentType) => {
    const updatedModules = [...formData.modules];
    const newContent = {
      type: contentType,
      title: '',
      duration: contentType === 'video' ? 300 : 0,
      content: contentType === 'reading' ? '<p>Enter your reading content here...</p>' : '',
      questions: contentType === 'quiz' ? [] : undefined
    };
    updatedModules[moduleIndex].contents = [...updatedModules[moduleIndex].contents, newContent];
    setFormData({ ...formData, modules: updatedModules });
  };

  // Update content
  const updateContent = (moduleIndex, contentIndex, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].contents[contentIndex] = {
      ...updatedModules[moduleIndex].contents[contentIndex],
      [field]: value
    };
    setFormData({ ...formData, modules: updatedModules });
  };

  // Delete content
  const deleteContent = (moduleIndex, contentIndex) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].contents = updatedModules[moduleIndex].contents.filter(
      (_, i) => i !== contentIndex
    );
    setFormData({ ...formData, modules: updatedModules });
  };

  // Add question to quiz
  const addQuestion = (moduleIndex, contentIndex) => {
    const updatedModules = [...formData.modules];
    const newQuestion = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    updatedModules[moduleIndex].contents[contentIndex].questions = [
      ...updatedModules[moduleIndex].contents[contentIndex].questions,
      newQuestion
    ];
    setFormData({ ...formData, modules: updatedModules });
  };

  // Update question
  const updateQuestion = (moduleIndex, contentIndex, questionIndex, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].contents[contentIndex].questions[questionIndex] = {
      ...updatedModules[moduleIndex].contents[contentIndex].questions[questionIndex],
      [field]: value
    };
    setFormData({ ...formData, modules: updatedModules });
  };

  // Delete question
  const deleteQuestion = (moduleIndex, contentIndex, questionIndex) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].contents[contentIndex].questions = 
      updatedModules[moduleIndex].contents[contentIndex].questions.filter(
        (_, i) => i !== questionIndex
      );
    setFormData({ ...formData, modules: updatedModules });
  };

  // Handle video file upload
  const handleVideoUpload = async (moduleIndex, contentIndex, file) => {
    if (!file) return;

    setUploading(true);
    const uploadKey = `${moduleIndex}-${contentIndex}-video`;
    setUploadProgress({ ...uploadProgress, [uploadKey]: 0 });

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/courses/upload-video', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({ ...uploadProgress, [uploadKey]: percentCompleted });
        }
      });

      // Update content with video file data
      const updatedModules = [...formData.modules];
      updatedModules[moduleIndex].contents[contentIndex].videoFile = response.data.videoFile;
      updatedModules[moduleIndex].contents[contentIndex].duration = Math.round(
        file.size / (1024 * 1024) // Rough estimate
      );
      setFormData({ ...formData, modules: updatedModules });

      setUploadProgress(prev => {
        delete prev[uploadKey];
        return prev;
      });
      alert('Video uploaded successfully!');
    } catch (error) {
      alert(`Video upload failed: ${error.response?.data?.message || error.message}`);
      setUploadProgress(prev => {
        delete prev[uploadKey];
        return prev;
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle PDF file upload
  const handlePdfUpload = async (moduleIndex, contentIndex, file) => {
    if (!file) return;

    setUploading(true);
    const uploadKey = `${moduleIndex}-${contentIndex}-pdf`;
    setUploadProgress({ ...uploadProgress, [uploadKey]: 0 });

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/courses/upload-pdf', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({ ...uploadProgress, [uploadKey]: percentCompleted });
        }
      });

      // Update content with PDF file data
      const updatedModules = [...formData.modules];
      updatedModules[moduleIndex].contents[contentIndex].pdfFile = response.data.pdfFile;
      // Clear text content when PDF is uploaded
      updatedModules[moduleIndex].contents[contentIndex].content = '';
      setFormData({ ...formData, modules: updatedModules });

      setUploadProgress(prev => {
        delete prev[uploadKey];
        return prev;
      });
      alert('PDF uploaded successfully!');
    } catch (error) {
      alert(`PDF upload failed: ${error.response?.data?.message || error.message}`);
      setUploadProgress(prev => {
        delete prev[uploadKey];
        return prev;
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one module exists
    if (formData.modules.length === 0) {
      alert('Please add at least one module to the course.');
      return;
    }

    // Validate modules have content
    for (let i = 0; i < formData.modules.length; i++) {
      if (!formData.modules[i].title) {
        alert(`Module ${i + 1} must have a title.`);
        return;
      }
      if (formData.modules[i].contents.length === 0) {
        alert(`Module "${formData.modules[i].title || i + 1}" must have at least one content item (video, reading, or quiz).`);
        return;
      }
    }

    try {
      // Ensure Authorization header is set from localStorage token
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse._id}`, formData, config);
      } else {
        await axios.post('/api/courses', formData, config);
      }
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ title: '', description: '', modules: [] });
      fetchCourses();
      alert('Course saved successfully!');
    } catch (error) {
      console.error('Failed to save course:', error, error.response?.data);
      alert(`Failed to save course: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/courses/${courseId}`);
        fetchCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      modules: course.modules || []
    });
    setShowForm(true);
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="course-management-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Course Management</h1>
          <p>Create, edit, and manage your courses with modules, videos, readings, and quizzes</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>My Courses</h2>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingCourse(null);
                setFormData({ title: '', description: '', modules: [] });
              }}
              className="btn btn-primary"
            >
              {showForm ? 'Cancel' : '+ Add New Course'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                  placeholder="e.g., Introduction to Web Development"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Brief description of the course"
                />
              </div>

              {/* Modules Section */}
              <div className="modules-section">
                <div className="section-header">
                  <h3>Modules *</h3>
                  <button type="button" onClick={addModule} className="btn btn-secondary">
                    + Add Module
                  </button>
                </div>

                {formData.modules.length === 0 && (
                  <div className="empty-state">
                    <p>No modules added yet. Click "Add Module" to get started.</p>
                  </div>
                )}

                {formData.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="module-card">
                    <div className="module-header">
                      <h4>Module {moduleIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => deleteModule(moduleIndex)}
                        className="btn btn-danger btn-small"
                      >
                        Delete Module
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Module Title *</label>
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                        className="input"
                        required
                        placeholder="e.g., HTML Basics"
                      />
                    </div>

                    <div className="form-group">
                      <label>Module Description</label>
                      <textarea
                        value={module.description || ''}
                        onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                        className="input"
                        rows="2"
                        placeholder="Brief description of this module"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="contents-section">
                      <div className="section-header">
                        <h5>Content Items</h5>
                        <div className="content-buttons">
                          <button
                            type="button"
                            onClick={() => addContent(moduleIndex, 'video')}
                            className="btn btn-secondary btn-small"
                          >
                            + Video
                          </button>
                          <button
                            type="button"
                            onClick={() => addContent(moduleIndex, 'reading')}
                            className="btn btn-secondary btn-small"
                          >
                            + Reading
                          </button>
                          <button
                            type="button"
                            onClick={() => addContent(moduleIndex, 'quiz')}
                            className="btn btn-secondary btn-small"
                          >
                            + Quiz
                          </button>
                        </div>
                      </div>

                      {module.contents.length === 0 && (
                        <div className="empty-state">
                          <p>No content added. Add a video, reading, or quiz.</p>
                        </div>
                      )}

                      {module.contents.map((content, contentIndex) => (
                        <div key={contentIndex} className="content-card">
                          <div className="content-header">
                            <span className="content-type-badge">{content.type.toUpperCase()}</span>
                            <button
                              type="button"
                              onClick={() => deleteContent(moduleIndex, contentIndex)}
                              className="btn btn-danger btn-small"
                            >
                              Delete
                            </button>
                          </div>

                          <div className="form-group">
                            <label>{content.type === 'video' ? 'Video' : content.type === 'reading' ? 'Reading' : 'Quiz'} Title *</label>
                            <input
                              type="text"
                              value={content.title}
                              onChange={(e) => updateContent(moduleIndex, contentIndex, 'title', e.target.value)}
                              className="input"
                              required
                              placeholder={`Enter ${content.type} title`}
                            />
                          </div>

                          {content.type === 'video' && (
                            <>
                              <div className="form-group">
                                <label>Video File Upload *</label>
                                <div className="file-upload-area">
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                      if (e.target.files[0]) {
                                        handleVideoUpload(moduleIndex, contentIndex, e.target.files[0]);
                                      }
                                    }}
                                    className="file-input"
                                    disabled={uploading}
                                  />
                                  <p>Supported formats: MP4, WebM, OGG (Max 500MB)</p>
                                </div>
                                {uploadProgress[`${moduleIndex}-${contentIndex}-video`] > 0 && (
                                  <div className="upload-progress">
                                    <div className="progress-bar">
                                      <div
                                        className="progress-fill"
                                        style={{
                                          width: `${uploadProgress[`${moduleIndex}-${contentIndex}-video`]}%`
                                        }}
                                      />
                                    </div>
                                    <p>{uploadProgress[`${moduleIndex}-${contentIndex}-video`]}% uploaded</p>
                                  </div>
                                )}
                                {content.videoFile && (
                                  <div className="file-info">
                                    <p>✅ Video uploaded: {content.videoFile.fileName}</p>
                                    {content.videoFile.fileSize ? (
                                      <small>Size: {(content.videoFile.fileSize / 1024 / 1024).toFixed(2)}MB</small>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                              <div className="form-group">
                                <label>Duration (seconds) - Auto-filled if not set</label>
                                <input
                                  type="number"
                                  value={content.duration || 0}
                                  onChange={(e) => updateContent(moduleIndex, contentIndex, 'duration', parseInt(e.target.value) || 0)}
                                  className="input"
                                  min="0"
                                  placeholder="e.g., 600 (10 minutes)"
                                />
                              </div>
                            </>
                          )}

                          {content.type === 'reading' && (
                            <>
                              <div className="form-group">
                                <h4>Reading Content Options</h4>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                  <label style={{ flex: 1 }}>
                                    <input
                                      type="radio"
                                      name={`reading-type-${moduleIndex}-${contentIndex}`}
                                      value="text"
                                      checked={!content.pdfFile}
                                      onChange={() => {
                                        updateContent(moduleIndex, contentIndex, 'pdfFile', null);
                                      }}
                                    />
                                    {' '}Text Content
                                  </label>
                                  <label style={{ flex: 1 }}>
                                    <input
                                      type="radio"
                                      name={`reading-type-${moduleIndex}-${contentIndex}`}
                                      value="pdf"
                                      checked={!!content.pdfFile}
                                      onChange={() => {
                                        // Mark this reading content as PDF-based so upload field appears
                                        const updatedPdf = content.pdfFile || { fileName: null };
                                        updateContent(moduleIndex, contentIndex, 'pdfFile', updatedPdf);
                                        // clear text content
                                        updateContent(moduleIndex, contentIndex, 'content', '');
                                      }}
                                    />
                                    {' '}PDF File
                                  </label>
                                </div>
                              </div>

                              {!content.pdfFile ? (
                                <div className="form-group">
                                  <label>Reading Content (HTML) *</label>
                                  <textarea
                                    value={content.content || ''}
                                    onChange={(e) => updateContent(moduleIndex, contentIndex, 'content', e.target.value)}
                                    className="input"
                                    rows="8"
                                    required
                                    placeholder="Enter HTML content for the reading material"
                                  />
                                  <small>You can use HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, etc.</small>
                                </div>
                              ) : (
                                <div className="form-group">
                                  <label>PDF File Upload *</label>
                                  <div className="file-upload-area">
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      onChange={(e) => {
                                        if (e.target.files[0]) {
                                          handlePdfUpload(moduleIndex, contentIndex, e.target.files[0]);
                                        }
                                      }}
                                      className="file-input"
                                      disabled={uploading}
                                    />
                                    <p>Supported format: PDF (Max 50MB)</p>
                                  </div>
                                  {uploadProgress[`${moduleIndex}-${contentIndex}-pdf`] > 0 && (
                                    <div className="upload-progress">
                                      <div className="progress-bar">
                                        <div
                                          className="progress-fill"
                                          style={{
                                            width: `${uploadProgress[`${moduleIndex}-${contentIndex}-pdf`]}%`
                                          }}
                                        />
                                      </div>
                                      <p>{uploadProgress[`${moduleIndex}-${contentIndex}-pdf`]}% uploaded</p>
                                    </div>
                                  )}
                                  {content.pdfFile && (
                                    <div className="file-info">
                                      <p>✅ PDF uploaded: {content.pdfFile.fileName}</p>
                                      {content.pdfFile.fileSize ? (
                                        <small>Size: {(content.pdfFile.fileSize / 1024 / 1024).toFixed(2)}MB</small>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}

                          {content.type === 'quiz' && (
                            <div className="quiz-section">
                              <div className="section-header">
                                <h6>Questions</h6>
                                <button
                                  type="button"
                                  onClick={() => addQuestion(moduleIndex, contentIndex)}
                                  className="btn btn-secondary btn-small"
                                >
                                  + Add Question
                                </button>
                              </div>

                              {(!content.questions || content.questions.length === 0) && (
                                <div className="empty-state">
                                  <p>No questions added. Add at least one question.</p>
                                </div>
                              )}

                              {content.questions && content.questions.map((question, questionIndex) => (
                                <div key={questionIndex} className="question-card">
                                  <div className="question-header">
                                    <strong>Question {questionIndex + 1}</strong>
                                    <button
                                      type="button"
                                      onClick={() => deleteQuestion(moduleIndex, contentIndex, questionIndex)}
                                      className="btn btn-danger btn-small"
                                    >
                                      Delete
                                    </button>
                                  </div>

                                  <div className="form-group">
                                    <label>Question Text *</label>
                                    <input
                                      type="text"
                                      value={question.question}
                                      onChange={(e) => updateQuestion(moduleIndex, contentIndex, questionIndex, 'question', e.target.value)}
                                      className="input"
                                      required
                                      placeholder="Enter the question"
                                    />
                                  </div>

                                  <div className="form-group">
                                    <label>Options *</label>
                                    {question.options.map((option, optionIndex) => (
                                      <div key={optionIndex} className="option-row">
                                        <input
                                          type="radio"
                                          name={`correct-${moduleIndex}-${contentIndex}-${questionIndex}`}
                                          checked={question.correctAnswer === optionIndex}
                                          onChange={() => updateQuestion(moduleIndex, contentIndex, questionIndex, 'correctAnswer', optionIndex)}
                                        />
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [...question.options];
                                            newOptions[optionIndex] = e.target.value;
                                            updateQuestion(moduleIndex, contentIndex, questionIndex, 'options', newOptions);
                                          }}
                                          className="input"
                                          required
                                          placeholder={`Option ${optionIndex + 1}`}
                                        />
                                      </div>
                                    ))}
                                    <small>Select the radio button next to the correct answer.</small>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-large">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          )}

          <div className="courses-list">
            {courses.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                No courses yet. Create your first course!
              </p>
            ) : (
              courses.map((course) => (
                <div key={course._id} className="course-item">
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p>{course.description || 'No description'}</p>
                    <div className="course-meta">
                      <span>Modules: {course.modules?.length || 0}</span>
                      <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="course-actions">
                    <button
                      onClick={() => handleEdit(course)}
                      className="btn btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
