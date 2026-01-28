import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  processCODPayment,
  getPaymentStatus
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);
router.post('/failed', protect, handlePaymentFailure);
router.post('/cod/process', protect, processCODPayment);
router.get('/status/:orderId', protect, getPaymentStatus);

export default router;
