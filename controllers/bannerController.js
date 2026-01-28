import Banner from '../models/Banner.js';
import { bufferToBase64, getFileUrl, deleteFile } from '../middleware/uploadMiddleware.js';
import path from 'path';

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    
    // Convert base64 images to URLs if they exist
    const bannersWithUrls = banners.map(banner => {
      const bannerObj = banner.toObject();
      
      // If banner has images array with base64, convert first image to URL
      if (bannerObj.images && bannerObj.images.length > 0) {
        // Keep base64 for now, or convert to URL if stored as file
        bannerObj.images = bannerObj.images.map(img => ({
          ...img,
          // You can add URL conversion logic here if needed
        }));
      }
      
      return bannerObj;
    });
    
    res.json(bannersWithUrls);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create banner
// @route   POST /api/banners
// @access  Public (admin panel)
export const createBanner = async (req, res) => {
  try {
    const banner = new Banner(req.body);
    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Public (admin panel)
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Handle file upload if image was uploaded
    if (req.file) {
      // You can save the file and store the URL
      // For now, we'll convert to base64 and store in images array
      const base64Image = bufferToBase64(req.file.buffer, req.file.mimetype);
      updateData.images = [{
        url: base64Image,
        order: 0
      }];
    }
    
    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedBanner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json(updatedBanner);
  } catch (error) {
    console.error('Error updating banner:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Public (admin panel)
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    await banner.deleteOne();
    res.json({ message: 'Banner removed' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload banner images (Base64 images)
// @route   POST /api/banners/:id/images
// @access  Public (admin panel)
export const uploadBannerImages = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    const { images } = req.body;
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: 'Images array is required' });
    }
    
    const newImages = images.map((base64Image, index) => ({
      url: base64Image,
      order: banner.images.length + index
    }));
    
    banner.images.push(...newImages);
    await banner.save();
    
    res.json(banner);
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete banner image
// @route   DELETE /api/banners/:id/images/:imageId
// @access  Public (admin panel)
export const deleteBannerImage = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    const imageIndex = banner.images.findIndex(img => img._id.toString() === req.params.imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    banner.images.splice(imageIndex, 1);
    await banner.save();
    
    res.json(banner);
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};