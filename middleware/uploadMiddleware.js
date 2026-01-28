import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different file types
const directories = {
  banners: path.join(uploadsDir, 'banners'),
  blogs: path.join(uploadsDir, 'blogs'),
  videos: path.join(uploadsDir, 'videos')
};

// Create directories if they don't exist
Object.values(directories).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on route or fieldname
    let dest = uploadsDir;
    
    if (req.baseUrl?.includes('banners')) {
      dest = directories.banners;
    } else if (req.baseUrl?.includes('blogs')) {
      if (file.fieldname === 'videoFile') {
        dest = directories.videos;
      } else {
        dest = directories.blogs;
      }
    } else if (file.fieldname === 'videoFile') {
      dest = directories.videos;
    } else if (file.fieldname === 'image') {
      dest = directories.blogs;
    }
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, filename);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp|gif|svg/;
  const allowedVideoTypes = /mp4|webm|ogg|mov|avi|mkv|m4v/;
  
  const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype;
  
  // For banners (only images)
  if (req.baseUrl?.includes('banners')) {
    if (allowedImageTypes.test(extname) && mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp, gif, svg) are allowed for banners'));
  }
  
  // For blogs and general uploads
  if (file.fieldname === 'image' || file.fieldname === 'bannerImage') {
    if (allowedImageTypes.test(extname) && mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp, gif, svg) are allowed'));
  } else if (file.fieldname === 'videoFile') {
    if (allowedVideoTypes.test(extname) && mimetype.startsWith('video/')) {
      return cb(null, true);
    }
    cb(new Error('Only video files (mp4, webm, ogg, mov, avi, mkv, m4v) are allowed'));
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Create multer instance with memory storage for banners (to get buffer for base64)
const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: storage, // Use disk storage for blogs
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 5 // Maximum 5 files
  },
  fileFilter
});

// Create separate instance for banners with memory storage
const bannerUpload = multer({
  storage: memoryStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB max for banner images
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|webp|gif|svg/;
    const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mimetype = file.mimetype;
    
    if (allowedImageTypes.test(extname) && mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp, gif, svg) are allowed for banners'));
  }
});

// Middleware for specific file types
export const uploadImage = upload.single('image');
export const uploadBannerImage = upload.single('bannerImage');
export const uploadVideo = upload.single('videoFile');

// Multiple file upload middleware for banners
export const uploadMultipleImages = bannerUpload.array('images', 10);

// Multiple file upload for blogs (image + video)
export const uploadBlogFiles = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 }
]);

// Custom middleware for banners
export const uploadBanner = (req, res, next) => {
  bannerUpload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Helper function to get file URL
export const getFileUrl = (filename, type = 'blogs') => {
  if (!filename) return null;
  
  let basePath = 'uploads';
  if (type === 'banners') {
    basePath = 'uploads/banners';
  } else if (type === 'videos') {
    basePath = 'uploads/videos';
  } else if (type === 'blogs') {
    basePath = 'uploads/blogs';
  }
  
  return `${process.env.BASE_URL || 'http://localhost:5000'}/${basePath}/${filename}`;
};

// Helper to delete file
export const deleteFile = async (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
      return true;
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
  return false;
};

// Helper to extract filename from URL
export const extractFilenameFromUrl = (url, type = 'blogs') => {
  if (!url) return null;
  
  let basePath = 'uploads';
  if (type === 'banners') {
    basePath = 'uploads/banners';
  } else if (type === 'videos') {
    basePath = 'uploads/videos';
  } else if (type === 'blogs') {
    basePath = 'uploads/blogs';
  }
  
  const parts = url.split('/');
  return parts[parts.length - 1];
};

// Convert buffer to base64
export const bufferToBase64 = (buffer, mimeType) => {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
};

// Convert base64 to buffer (if needed)
export const base64ToBuffer = (base64String) => {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
};