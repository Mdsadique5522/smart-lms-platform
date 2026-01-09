const mongoose = require('mongoose');

const moduleContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['video', 'reading', 'quiz'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  content: {
    type: String,
    default: ''
  },
  videoFile: {
    fileName: String,
    fileSize: Number,
    filePath: String,
    uploadedAt: Date,
    mimeType: String
  },
  pdfFile: {
    fileName: String,
    fileSize: Number,
    filePath: String,
    uploadedAt: Date,
    mimeType: String,
    totalPages: Number
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number
  }]
}, { _id: true });

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true
  },
  contents: [moduleContentSchema]
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required']
  },
  description: {
    type: String,
    default: ''
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modules: [moduleSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);

