import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get user's wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let wishlist = await Wishlist.findOne({ user: userId }).populate('products');

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  res.json({
    success: true,
    wishlist
  });
});

// Add product to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Get or create wishlist
  let wishlist = await Wishlist.findOne({ user: userId });
  
  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, products: [] });
  }

  // Check if already in wishlist
  if (wishlist.hasProduct(productId)) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  wishlist.addProduct(productId);
  await wishlist.save();
  await wishlist.populate('products');

  res.json({
    success: true,
    message: 'Added to wishlist',
    wishlist
  });
});

// Remove product from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  wishlist.removeProduct(productId);
  await wishlist.save();
  await wishlist.populate('products');

  res.json({
    success: true,
    message: 'Removed from wishlist',
    wishlist
  });
});

// Check if product is in wishlist
export const checkWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: userId });

  const inWishlist = wishlist ? wishlist.hasProduct(productId) : false;

  res.json({
    success: true,
    inWishlist
  });
});
