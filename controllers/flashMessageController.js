// controllers/flashMessageController.js

import FlashMessage from '../models/flashMessage.js';

// @desc    Get all flash messages
// @route   GET /api/flash-messages
// @access  Public
const getFlashMessages = async (req, res) => {
  try {
    const flashMessages = await FlashMessage.find({}).sort({ createdAt: -1 });
    
    // Filter to only include currently active messages
    const activeMessages = flashMessages.filter(msg => msg.isCurrentlyActive());
    
    res.json({
      success: true,
      count: activeMessages.length,
      data: activeMessages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get flash message by ID
// @route   GET /api/flash-messages/:id
// @access  Private/Admin
const getFlashMessageById = async (req, res) => {
  try {
    const flashMessage = await FlashMessage.findById(req.params.id);
    
    if (!flashMessage) {
      return res.status(404).json({
        success: false,
        message: 'Flash message not found'
      });
    }
    
    res.json({
      success: true,
      data: flashMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create a flash message
// @route   POST /api/flash-messages
// @access  Private/Admin
const createFlashMessage = async (req, res) => {
  try {
    const { message, backgroundColor, textColor, isActive, startDate, endDate, link, linkText } = req.body;
    
    const flashMessage = await FlashMessage.create({
      message,
      backgroundColor,
      textColor,
      isActive,
      startDate,
      endDate,
      link,
      linkText
    });
    
    res.status(201).json({
      success: true,
      data: flashMessage
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a flash message
// @route   PUT /api/flash-messages/:id
// @access  Private/Admin
const updateFlashMessage = async (req, res) => {
  try {
    const flashMessage = await FlashMessage.findById(req.params.id);
    
    if (!flashMessage) {
      return res.status(404).json({
        success: false,
        message: 'Flash message not found'
      });
    }
    
    const updatedFlashMessage = await FlashMessage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedFlashMessage
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a flash message
// @route   DELETE /api/flash-messages/:id
// @access  Private/Admin
const deleteFlashMessage = async (req, res) => {
  try {
    const flashMessage = await FlashMessage.findById(req.params.id);
    
    if (!flashMessage) {
      return res.status(404).json({
        success: false,
        message: 'Flash message not found'
      });
    }
    
    await flashMessage.deleteOne();
    
    res.json({
      success: true,
      message: 'Flash message deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

export {
  getFlashMessages,
  getFlashMessageById,
  createFlashMessage,
  updateFlashMessage,
  deleteFlashMessage
};