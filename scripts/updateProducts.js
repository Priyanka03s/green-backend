import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const updateExistingProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all products that don't have weight or dimensions
    const productsToUpdate = await Product.find({
      $or: [
        { weight: { $exists: false } },
        { dimensions: { $exists: false } }
      ]
    });

    console.log(`Found ${productsToUpdate.length} products to update`);

    for (const product of productsToUpdate) {
      // Update with default values
      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            weight: product.weight || 0,
            dimensions: {
              length: product.dimensions?.length || 0,
              breadth: product.dimensions?.breadth || 0,
              height: product.dimensions?.height || 0
            }
          }
        }
      );
      console.log(`Updated product: ${product.name}`);
    }

    console.log('All products updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
};

updateExistingProducts();