import express from 'express';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  uploadBlogImage,
  uploadBlogVideo
} from '../controllers/blogController.js';
import { uploadImage, uploadVideo, uploadBlogFiles } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/:id/like', likeBlog);

// Upload routes
router.post('/upload/image', uploadImage, uploadBlogImage);
router.post('/upload/video', uploadVideo, uploadBlogVideo);

// Blog CRUD routes
router.post('/', uploadBlogFiles, createBlog);
router.put('/:id', uploadBlogFiles, updateBlog);
router.delete('/:id', deleteBlog);

export default router;