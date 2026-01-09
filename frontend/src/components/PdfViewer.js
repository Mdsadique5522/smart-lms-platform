import React, { useState, useRef } from 'react';
import axios from 'axios';
import './media.css';

const PdfViewer = ({ content, courseId, moduleId, onProgressUpdate }) => {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasTracked90Percent, setHasTracked90Percent] = useState(false);
  const [lastEventPercentage, setLastEventPercentage] = useState(0);

  const handleScroll = (e) => {
    const element = e.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;

    let percentage = 0;
    if (scrollHeight > 0) {
      percentage = Math.round((scrollTop / scrollHeight) * 100);
    }

    setScrollProgress(percentage);

    if (percentage > lastEventPercentage && percentage % 10 === 0) {
      sendScrollEvent(percentage);
      setLastEventPercentage(percentage);
    }

    if (percentage >= 90 && !hasTracked90Percent) {
      setHasTracked90Percent(true);
      sendScrollEvent(90);
    }
  };

  const sendScrollEvent = async (percentage) => {
    try {
      await axios.post('/api/events', {
        courseId,
        moduleId,
        contentType: 'reading',
        contentId: content._id,
        eventType: 'scroll',
        percentage,
        timeSpent: 0,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to send scroll event:', error);
    }
  };

  return (
    <div className="pdf-viewer-container">
      {content.pdfFile && content.pdfFile.filePath ? (
        <>
          <div className="pdf-header">
            <h3>{content.title}</h3>
            <a
              href={content.pdfFile.filePath}
              download
              className="btn btn-secondary"
              style={{ marginLeft: '10px' }}
            >
              📥 Download PDF
            </a>
          </div>

          <div
            ref={containerRef}
            className="pdf-viewer"
            onScroll={handleScroll}
            style={{
              height: '600px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f5f5f5',
              padding: '20px'
            }}
          >
            <iframe
              src={`${content.pdfFile.filePath}#toolbar=0`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '4px'
              }}
              title={content.title}
            />
          </div>

          <div className="pdf-info" style={{ marginTop: '15px' }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${scrollProgress}%` }}></div>
            </div>
            <div className="pdf-controls-info">
              <span className="progress-info">
                Scroll Progress: {scrollProgress}%
              </span>
              <span className="status" style={{ marginLeft: '20px' }}>
                Status: {scrollProgress >= 90
                  ? '✅ Completed'
                  : scrollProgress > 10
                  ? '⏳ In Progress'
                  : '⏸️ Not Started'}
              </span>
            </div>
          </div>

          <p className="auto-tracking-info">
            <strong>Auto-tracking:</strong> Your scroll progress is automatically saved as you scroll through the PDF.
            ≥90% = Completed, &gt;10% = In Progress
          </p>
        </>
      ) : (
        <div className="pdf-placeholder">
          <p>📄 PDF Viewer</p>
          <p>No PDF file available. Please upload a PDF to view content.</p>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
