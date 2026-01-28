import Blog from '../models/blogModel.js';
import { getFileUrl, deleteFile, extractFilenameFromUrl } from '../middleware/uploadMiddleware.js';
import path from 'path';

// Helper to check if string is a URL
const isUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }
    
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    
    // Convert file paths to URLs
    const blogsWithUrls = blogs.map(blog => ({
      ...blog.toObject(),
      image: blog.image ? 
        (isUrl(blog.image) ? blog.image : getFileUrl(blog.image, 'blogs')) 
        : 'https://images.unsplash.com/photo-1625246333195-78b9b589f346?w=800',
      videoFile: blog.videoFile ? getFileUrl(blog.videoFile, 'videos') : null
    }));
    
    res.json(blogsWithUrls);
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const blogWithUrls = {
      ...blog.toObject(),
      image: blog.image ? 
        (isUrl(blog.image) ? blog.image : getFileUrl(blog.image, 'blogs')) 
        : 'https://images.unsplash.com/photo-1625246333195-78b9b589f346?w=800',
      videoFile: blog.videoFile ? getFileUrl(blog.videoFile, 'videos') : null
    };
    
    res.json(blogWithUrls);
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a blog with file upload
// @route   POST /api/blogs
// @access  Public
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      readTime,
      category,
      video, // YouTube URL
      tags,
      trending,
      status
    } = req.body;
    
    // Handle file uploads from request body or files
    let image = req.body.image;
    let videoFile = req.body.videoFile;
    
    // If files were uploaded via multipart/form-data
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        image = req.files.image[0].filename;
      }
      if (req.files.videoFile && req.files.videoFile[0]) {
        videoFile = req.files.videoFile[0].filename;
      }
    }
    
    // Check if image is a URL or file upload
    if (image && isUrl(image)) {
      // Keep URL as is
    } else if (req.file && req.file.fieldname === 'image') {
      image = req.file.filename;
    }
    
    const blog = new Blog({
      title,
      excerpt,
      content,
      author,
      readTime,
      category,
      image: image || '',
      video: video || null,
      videoFile: videoFile || null,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
      trending: trending || false,
      status: status || 'published'
    });
    
    const createdBlog = await blog.save();
    
    // Return blog with URLs
    const blogWithUrls = {
      ...createdBlog.toObject(),
      image: createdBlog.image ? 
        (isUrl(createdBlog.image) ? createdBlog.image : getFileUrl(createdBlog.image, 'blogs')) 
        : 'https://images.unsplash.com/photo-1625246333195-78b9b589f346?w=800',
      videoFile: createdBlog.videoFile ? getFileUrl(createdBlog.videoFile, 'videos') : null
    };
    
    res.status(201).json(blogWithUrls);
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Public
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Handle file uploads
    if (req.files) {
      // Handle image upload
      if (req.files.image && req.files.image[0]) {
        // Delete old image if exists and it's not a URL
        if (blog.image && !isUrl(blog.image)) {
          const oldImagePath = path.join('uploads/blogs', blog.image);
          await deleteFile(oldImagePath);
        }
        req.body.image = req.files.image[0].filename;
      }
      
      // Handle video upload
      if (req.files.videoFile && req.files.videoFile[0]) {
        // Delete old video if exists
        if (blog.videoFile) {
          const oldVideoPath = path.join('uploads/videos', blog.videoFile);
          await deleteFile(oldVideoPath);
        }
        req.body.videoFile = req.files.videoFile[0].filename;
        req.body.video = ''; // Clear YouTube URL when uploading file
      }
    } else if (req.file) {
      // Handle single file upload
      if (req.file.fieldname === 'image') {
        if (blog.image && !isUrl(blog.image)) {
          const oldImagePath = path.join('uploads/blogs', blog.image);
          await deleteFile(oldImagePath);
        }
        req.body.image = req.file.filename;
      } else if (req.file.fieldname === 'videoFile') {
        if (blog.videoFile) {
          const oldVideoPath = path.join('uploads/videos', blog.videoFile);
          await deleteFile(oldVideoPath);
        }
        req.body.videoFile = req.file.filename;
        req.body.video = '';
      }
    } else if (req.body.image && isUrl(req.body.image)) {
      // If image is a URL, extract or keep as is
      // If it's a new URL, keep it as URL
      // If it's our own uploaded file URL, extract filename
      if (req.body.image.includes('uploads/blogs/')) {
        req.body.image = extractFilenameFromUrl(req.body.image, 'blogs');
      }
    }
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Convert tags if needed
    if (req.body.tags && typeof req.body.tags === 'string') {
      updatedBlog.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await updatedBlog.save();
    }
    
    const blogWithUrls = {
      ...updatedBlog.toObject(),
      image: updatedBlog.image ? 
        (isUrl(updatedBlog.image) ? updatedBlog.image : getFileUrl(updatedBlog.image, 'blogs')) 
        : 'https://images.unsplash.com/photo-1625246333195-78b9b589f346?w=800',
      videoFile: updatedBlog.videoFile ? getFileUrl(updatedBlog.videoFile, 'videos') : null
    };
    
    res.json(blogWithUrls);
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Public
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Delete associated files
    if (blog.image && !isUrl(blog.image)) {
      const imagePath = path.join('uploads/blogs', blog.image);
      await deleteFile(imagePath);
    }
    
    if (blog.videoFile) {
      const videoPath = path.join('uploads/videos', blog.videoFile);
      await deleteFile(videoPath);
    }
    
    await blog.deleteOne();
    res.json({ message: 'Blog removed' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upload blog image
// @route   POST /api/blogs/upload/image
// @access  Public
export const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    res.json({
      filename: req.file.filename,
      url: getFileUrl(req.file.filename, 'blogs')
    });
  } catch (error) {
    console.error('Upload blog image error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upload blog video
// @route   POST /api/blogs/upload/video
// @access  Public
export const uploadBlogVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    res.json({
      filename: req.file.filename,
      url: getFileUrl(req.file.filename, 'videos')
    });
  } catch (error) {
    console.error('Upload blog video error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Like a blog
// @route   POST /api/blogs/:id/like
// @access  Public
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    blog.likes += 1;
    await blog.save();
    
    res.json({ likes: blog.likes });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};