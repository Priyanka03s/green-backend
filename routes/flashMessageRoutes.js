// routes/flashMessageRoutes.js

import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getFlashMessages,
  getFlashMessageById,
  createFlashMessage,
  updateFlashMessage,
  deleteFlashMessage
} from '../controllers/flashMessageController.js';

const router = express.Router();

router.route('/')
  .get(getFlashMessages)
  .post(protect, admin, createFlashMessage);

router
  .route('/:id')
  .get(getFlashMessageById)
  .put(protect, admin, updateFlashMessage)
  .delete(protect, admin, deleteFlashMessage);

export default router;