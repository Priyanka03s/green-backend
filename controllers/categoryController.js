import Category from "../models/Category.js";
import Product from "../models/Product.js";

/* CREATE CATEGORY */
export const createCategory = async (req, res) => {
  try {
    const { name, isEnabled = true } = req.body;
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = new Category({
      name,
      isEnabled,
    });

    const newCategory = await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (err) {
    console.error("Error creating category:", err); // <-- CHECK THIS LOG!
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: err.message,
    });
  }
};

/* GET ALL CATEGORIES */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: err.message,
    });
  }
};

/* UPDATE CATEGORY */
export const updateCategory = async (req, res) => {
  try {
    // Use the whole request body for the update. This is more flexible.
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body, // <-- Change this from { isEnabled: req.body.isEnabled }
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found with that ID.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: err.message,
    });
  }
};

/* DELETE CATEGORY */
export const deleteCategory = async (req, res) => {
  try {
    // Use findByIdAndDelete with the default _id
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // The rest of your delete logic for products is fine
    await Product.updateMany(
      { category: category.name },
      { $unset: { category: 1 } }
    );

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: err.message,
    });
  }
};

/* GET ENABLED CATEGORIES ONLY */
export const getEnabledCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isEnabled: true }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    console.error("Error fetching enabled categories:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: err.message,
    });
  }
};

/* GET CATEGORY BY ID */
export const getCategoryById = async (req, res) => {
  try {
    // Use findById for Mongoose _id, not findOne
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: err.message,
    });
  }
};
