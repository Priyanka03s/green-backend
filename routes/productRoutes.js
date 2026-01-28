import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET all products with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = {};
    if (sort === 'price-asc') sortOptions.price = 1;
    if (sort === 'price-desc') sortOptions.price = -1;
    if (sort === 'name-asc') sortOptions.name = 1;
    if (sort === 'name-desc') sortOptions.name = -1;

    const products = await Product.find(query).sort(sortOptions);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// POST create new product
router.post('/', async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      category,
      price,
      quantity,
      weight,
      dimensions,
      usage,
      availability,
      images,
      sustainability,
      createdAt
    } = req.body;

    console.log('Creating product with:', req.body);

    if (!id || !name || !description || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const existingProduct = await Product.findOne({ id });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product ID already exists'
      });
    }

    const productWeight = weight !== undefined && weight !== null && weight !== '' 
      ? parseFloat(weight) 
      : 0;

    const productDimensions = {
      length: dimensions?.length !== undefined && dimensions?.length !== null && dimensions?.length !== ''
        ? parseFloat(dimensions.length) 
        : 0,
      breadth: dimensions?.breadth !== undefined && dimensions?.breadth !== null && dimensions?.breadth !== ''
        ? parseFloat(dimensions.breadth) 
        : 0,
      height: dimensions?.height !== undefined && dimensions?.height !== null && dimensions?.height !== ''
        ? parseFloat(dimensions.height) 
        : 0,
    };

    const newProduct = new Product({
      id,
      name,
      description,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      weight: productWeight,
      dimensions: productDimensions,
      usage: {
        applicationMethod: usage?.applicationMethod || '',
        shelfLife: usage?.shelfLife || '',
        recommendedCrops: usage?.recommendedCrops || []
      },
      availability: availability !== false,
      images: images || '',
      sustainability: sustainability || [],
      createdAt: createdAt || new Date().toISOString()
    });

    const savedProduct = await newProduct.save();

    console.log('Product saved successfully:', savedProduct);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      quantity,
      weight,
      dimensions,
      usage,
      availability,
      images,
      sustainability
    } = req.body;

    console.log('Updating product with:', req.body);

    const productWeight = weight !== undefined && weight !== null && weight !== '' 
      ? parseFloat(weight) 
      : 0;

    const productDimensions = {
      length: dimensions?.length !== undefined && dimensions?.length !== null && dimensions?.length !== ''
        ? parseFloat(dimensions.length) 
        : 0,
      breadth: dimensions?.breadth !== undefined && dimensions?.breadth !== null && dimensions?.breadth !== ''
        ? parseFloat(dimensions.breadth) 
        : 0,
      height: dimensions?.height !== undefined && dimensions?.height !== null && dimensions?.height !== ''
        ? parseFloat(dimensions.height) 
        : 0,
    };

    const updateData = {
      name,
      description,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      weight: productWeight,
      dimensions: productDimensions,
      usage: {
        applicationMethod: usage?.applicationMethod || '',
        shelfLife: usage?.shelfLife || '',
        recommendedCrops: usage?.recommendedCrops || []
      },
      availability: availability !== false,
      images: images || '',
      sustainability: sustainability || []
    };

    const updatedProduct = await Product.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('Product updated successfully:', updatedProduct);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ id: req.params.id });

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

export default router;