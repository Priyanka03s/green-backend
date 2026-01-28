// routes/contactRoutes.js

import express from "express";
import {
  getContactInfo,
  saveContactInfo,
  sendMessage,
  getMessages,
  deleteMessage,
  getMessageById,
  markMessageAsRead
} from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------- PUBLIC -------- */
router.get("/info", getContactInfo);
router.post("/message", sendMessage);

/* -------- ADMIN -------- */
router.post("/info", protect, admin, saveContactInfo);
router.get("/messages", protect, admin, getMessages);
router.get("/messages/:id", protect, admin, getMessageById);
router.delete("/messages/:id", protect, admin, deleteMessage);
router.patch("/messages/:id/read", protect, admin, markMessageAsRead);

export default router;