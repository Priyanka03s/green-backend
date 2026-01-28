import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  subtitleOne: {
    type: String,
    trim: true
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
    trim: true
  },
  buttonLink: {
    type: String,
    default: '/products',
    trim: true
  },
  images: [{
    url: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;