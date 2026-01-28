import express from 'express';
import Wishlist from '../models/wishlistModel.js';

const router = express.Router();

// Mock user ID
const MOCK_USER_ID = 'user_123';

// Get user's wishlist
router.get('/', async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: MOCK_USER_ID });
    res.json({
      success: true,
      items: items,
      totalItems: items.length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add to wishlist
router.post('/add', async (req, res) => {
  try {
    const { productId, name, price, image } = req.body;
    
    // Check if already exists
    const exists = await Wishlist.findOne({ 
      userId: MOCK_USER_ID, 
      productId 
    });
    
    if (exists) {
      return res.json({ success: false, message: 'Already in wishlist' });
    }
    
    // Add to wishlist
    const item = await Wishlist.create({
      userId: MOCK_USER_ID,
      productId,
      name,
      price,
      image
    });
    
    res.json({ success: true, item });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove from wishlist
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    await Wishlist.deleteOne({ 
      userId: MOCK_USER_ID, 
      productId 
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;