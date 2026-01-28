import express from 'express';
import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImages,
  deleteBannerImage
} from '../controllers/bannerController.js';
import { uploadMultipleImages, uploadBanner } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getBanners);
router.get('/:id', getBannerById);

// Admin routes
router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

// Image routes
router.post('/:id/images', uploadMultipleImages, async (req, res, next) => {
  try {
    const images = req.files.map(file => {
      const base64 = file.buffer.toString('base64');
      const mimeType = file.mimetype;
      return `data:${mimeType};base64,${base64}`;
    });
    
    req.body.images = images;
    next();
  } catch (error) {
    next(error);
  }
}, uploadBannerImages);

router.delete('/:id/images/:imageId', deleteBannerImage);

export default router;