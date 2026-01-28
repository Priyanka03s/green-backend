import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  bulkUpdateOrderStatus
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/place', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/cancel/:id', protect, cancelOrder);

// Admin routes
router.get('/admin/all', protect, admin, getAllOrders);
router.put('/status/:id', protect, admin, updateOrderStatus);
router.put('/bulk-status', protect, admin, bulkUpdateOrderStatus);

export default router;
