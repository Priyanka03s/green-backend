import express from 'express';
import { register, login, googleLogin, getProfile, updateProfile, getAllUsers, updateAddress, getAddress, getMyAddress } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, admin, getAllUsers);

// Address routes
router.get('/address', protect, getMyAddress);        // ✅ new route for current user's address
router.get('/address/:id', protect, getAddress);      // fetch address by ID
router.put('/address', protect, updateAddress);

export default router;
