import React, { useState, useRef } from 'react';
import axios from 'axios';
import './media.css';

const VideoPlayer = ({ content, courseId, moduleId, onProgressUpdate }) => {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasTracked90Percent, setHasTracked90Percent] = useState(false);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      const newProgress = Math.round((current / total) * 100);

      setCurrentTime(current);
      setProgress(newProgress);

      if (newProgress > 0 && newProgress % 10 === 0) {
        sendProgressEvent(newProgress, current);
      }

      if (newProgress >= 90 && !hasTracked90Percent) {
        setHasTracked90Percent(true);
        sendProgressEvent(90, current);
      }
    }
  };

  const sendProgressEvent = async (percentage, timeSpent) => {
    try {
      await axios.post('/api/events', {
        courseId,
        moduleId,
        contentType: 'video',
        contentId: content._id,
        eventType: 'watch',
        percentage,
        timeSpent,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to send video progress event:', error);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        {content.videoFile && content.videoFile.filePath ? (
          <video
            ref={videoRef}
            className="video-element"
            controls
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            style={{ width: '100%', height: 'auto', backgroundColor: '#000' }}
          >
            <source src={content.videoFile.filePath} type={content.videoFile.mimeType || 'video/mp4'} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="video-placeholder">
            <p>📹 Video Player</p>
            <p>No video file available</p>
          </div>
        )}
      </div>

      <div className="video-info">
        <div className="video-progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="video-controls-info">
          <span className="time-info">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <span className="progress-info">
            Progress: {progress}%
          </span>
          <span className="status">
            {progress >= 90
              ? '✅ Completed'
              : progress > 0
              ? '⏳ In Progress'
              : '⏸️ Not Started'}
          </span>
        </div>
      </div>

      <p className="auto-tracking-info">
        <strong>Auto-tracking:</strong> Your video progress is automatically saved as you watch.
        ≥90% = Completed, &gt;0% = In Progress
      </p>
    </div>
  );
};

export default VideoPlayer;
