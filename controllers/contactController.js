import ContactInfo from "../models/ContactInfo.js";
import ContactMessage from "../models/ContactMessage.js";

/* ===========================
   CONTACT INFO (PUBLIC)
=========================== */

// GET contact info
export const getContactInfo = async (req, res, next) => {
  try {
    console.log("Fetching contact info from database...");
    const info = await ContactInfo.findOne();
    
    if (!info) {
      console.log("No contact info found in database");
      return res.status(404).json({
        success: false,
        message: "No contact information found",
        data: null
      });
    }
    
    console.log("Contact info found:", info);
    res.status(200).json({
      success: true,
      message: "Contact information retrieved successfully",
      data: info
    });
  } catch (error) {
    console.error("Error in getContactInfo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve contact information",
      error: error.message
    });
    next(error);
  }
};

/* ===========================
   CONTACT INFO (ADMIN)
=========================== */

// CREATE or UPDATE contact info
export const saveContactInfo = async (req, res, next) => {
  try {
    console.log("Saving contact info:", req.body);
    
    // Validate required fields
    const { officeAddress, phone, email } = req.body;
    if (!officeAddress || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing: officeAddress, phone, email"
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    
    let info = await ContactInfo.findOne();
    
    if (info) {
      console.log("Updating existing contact info with ID:", info._id);
      info = await ContactInfo.findByIdAndUpdate(
        info._id,
        req.body,
        { new: true, runValidators: true }
      );
      console.log("Contact info updated successfully:", info);
    } else {
      console.log("Creating new contact info...");
      info = await ContactInfo.create(req.body);
      console.log("Contact info created successfully:", info);
    }
    
    res.status(200).json({
      success: true,
      message: "Contact info saved successfully",
      data: info
    });
  } catch (error) {
    console.error("Error in saveContactInfo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save contact information",
      error: error.message
    });
    next(error);
  }
};

/* ===========================
   CONTACT MESSAGES
=========================== */

// SEND message (Public)
export const sendMessage = async (req, res, next) => {
  try {
    console.log("Saving new message:", req.body);
    
    // Validate required fields
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing: name, email, message"
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    
    const newMessage = await ContactMessage.create(req.body);
    console.log("Message saved successfully:", newMessage);
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message
    });
    next(error);
  }
};

// GET all messages (Admin)
export const getMessages = async (req, res, next) => {
  try {
    console.log("Fetching all messages from database...");
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    console.log(`Found ${messages.length} messages`);
    
    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: messages
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
      error: error.message
    });
    next(error);
  }
};

// DELETE message (Admin)
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Deleting message with ID: ${id}`);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Message ID is required"
      });
    }
    
    const deletedMessage = await ContactMessage.findByIdAndDelete(id);
    
    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    console.log("Message deleted successfully:", deletedMessage);
    
    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: deletedMessage
    });
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message
    });
    next(error);
  }
};

// GET single message by ID (Admin)
export const getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Fetching message with ID: ${id}`);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Message ID is required"
      });
    }
    
    const message = await ContactMessage.findById(id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    console.log("Message found:", message);
    
    res.status(200).json({
      success: true,
      message: "Message retrieved successfully",
      data: message
    });
  } catch (error) {
    console.error("Error in getMessageById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve message",
      error: error.message
    });
    next(error);
  }
};

// MARK message as read (Admin)
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Marking message with ID: ${id} as read`);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Message ID is required"
      });
    }
    
    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    
    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    console.log("Message marked as read:", updatedMessage);
    
    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: updatedMessage
    });
  } catch (error) {
    console.error("Error in markMessageAsRead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as read",
      error: error.message
    });
    next(error);
  }
};