import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  name: String,
  price: Number,
  image: String
}, {
  timestamps: true
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;