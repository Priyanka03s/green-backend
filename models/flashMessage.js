// models/flashMessage.js

import mongoose from 'mongoose';

const flashMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [200, 'Message cannot exceed 200 characters']
  },
  backgroundColor: {
    type: String,
    default: '#1e4d19',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Background color must be a valid hex color code'
    }
  },
  textColor: {
    type: String,
    default: '#FFFFFF',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Text color must be a valid hex color code'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  link: {
    type: String,
    default: ''
  },
  linkText: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Method to check if flash message is currently active
flashMessageSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

const FlashMessage = mongoose.model('FlashMessage', flashMessageSchema);

export default FlashMessage;