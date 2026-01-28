import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  readTime: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['farming', 'video', 'lifestyle', 'sustainability', 'technology']
  },
  image: {
    type: String,
    default: ''
  },
  video: {
    type: String // YouTube URL
  },
  videoFile: {
    type: String // Uploaded video file path
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  trending: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, {
  timestamps: true
});

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;