import express from "express";
import {
  createCategory,
  getCategories,
  getEnabledCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

// Create a new category
router.post("/", createCategory);
router.get("/", getCategories);
router.get("/enabled", getEnabledCategories);
router.get("/:id", getCategoryById);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;