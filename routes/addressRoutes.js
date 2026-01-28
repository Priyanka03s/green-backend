import express from 'express';
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserAddresses, // Add this function
} from '../controllers/addressController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

import Address from '../models/Address.js';

const router = express.Router();

// User routes
router.post('/', protect, createAddress);
router.get('/', protect, getAddresses);
router.get('/default', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id, isDefault: true });
    if (addresses.length === 0) {
      return res.status(404).json({ message: 'No default address found' });
    }
    res.json(addresses[0]);
  } catch (error) {
    console.error('Get default address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to get addresses for a specific user
router.get('/user/:userId', protect, adminMiddleware, getUserAddresses);

// Individual address routes
router.get('/:id', protect, getAddressById);
router.put('/:id', protect, updateAddress);
router.delete('/:id', protect, deleteAddress);
router.put('/:id/default', protect, setDefaultAddress);

export default router;