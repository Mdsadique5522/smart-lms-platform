/**
 * Media Upload Service
 * Handles video and PDF file uploads with proper validation
 * Stores files in public/uploads directory (can be extended to use cloud storage)
 */

const fs = require('fs');
const path = require('path');

// Configure upload directory
const UPLOAD_BASE_DIR = path.join(__dirname, '../../frontend/public/uploads');
const VIDEO_DIR = path.join(UPLOAD_BASE_DIR, 'videos');
const PDF_DIR = path.join(UPLOAD_BASE_DIR, 'pdfs');

// Create directories if they don't exist
const ensureUploadDirs = () => {
  [UPLOAD_BASE_DIR, VIDEO_DIR, PDF_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// File size limits (in bytes)
const FILE_LIMITS = {
  video: 500 * 1024 * 1024, // 500MB
  pdf: 50 * 1024 * 1024 // 50MB
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  pdf: ['application/pdf']
};

/**
 * Validate video file
 */
const validateVideoFile = (file) => {
  if (!file) {
    throw new Error('No video file provided');
  }

  if (!ALLOWED_MIME_TYPES.video.includes(file.mimetype)) {
    throw new Error(`Invalid video format. Allowed: ${ALLOWED_MIME_TYPES.video.join(', ')}`);
  }

  if (file.size > FILE_LIMITS.video) {
    throw new Error(`Video file size exceeds 500MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  return true;
};

/**
 * Validate PDF file
 */
const validatePdfFile = (file) => {
  if (!file) {
    throw new Error('No PDF file provided');
  }

  if (!ALLOWED_MIME_TYPES.pdf.includes(file.mimetype)) {
    throw new Error('Invalid PDF format');
  }

  if (file.size > FILE_LIMITS.pdf) {
    throw new Error(`PDF file size exceeds 50MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  return true;
};

/**
 * Save video file
 */
const saveVideoFile = (file) => {
  try {
    validateVideoFile(file);
    ensureUploadDirs();

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(VIDEO_DIR, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    return {
      fileName,
      fileSize: file.size,
      filePath: `/uploads/videos/${fileName}`,
      uploadedAt: new Date(),
      mimeType: file.mimetype
    };
  } catch (error) {
    throw new Error(`Failed to save video file: ${error.message}`);
  }
};

/**
 * Save PDF file
 */
const savePdfFile = (file) => {
  try {
    validatePdfFile(file);
    ensureUploadDirs();

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(PDF_DIR, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    return {
      fileName,
      fileSize: file.size,
      filePath: `/uploads/pdfs/${fileName}`,
      uploadedAt: new Date(),
      mimeType: file.mimetype,
      totalPages: null // Can be calculated from PDF if needed
    };
  } catch (error) {
    throw new Error(`Failed to save PDF file: ${error.message}`);
  }
};

/**
 * Delete video file
 */
const deleteVideoFile = (fileName) => {
  try {
    const filePath = path.join(VIDEO_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete video file: ${error.message}`);
  }
};

/**
 * Delete PDF file
 */
const deletePdfFile = (fileName) => {
  try {
    const filePath = path.join(PDF_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete PDF file: ${error.message}`);
  }
};

module.exports = {
  saveVideoFile,
  savePdfFile,
  deleteVideoFile,
  deletePdfFile,
  validateVideoFile,
  validatePdfFile,
  ensureUploadDirs,
  FILE_LIMITS,
  ALLOWED_MIME_TYPES
};
