// models/ContactMessage.js

import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    subject: {
      type: String
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const ContactMessage = mongoose.model(
  "ContactMessage",
  contactMessageSchema
);

export default ContactMessage;