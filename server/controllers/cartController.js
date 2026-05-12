import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import mongoose from 'mongoose'; // Added: Need Mongoose for Model instantiation

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id; // From authenticated token
  
  // 1. Populate 'items.product' and its 'activeDiscount' virtual
  let cart = await Cart.findOne({ user: userId })
    .populate({
        path: 'items.product',
        populate: { path: 'activeDiscount' } // Populate the activeDiscount virtual
    });
  
  if (!cart) {
    // Create empty cart if doesn't exist
    cart = await Cart.create({ user: userId, items: [] });
  }

  // 2. Calculate final prices for all items in the cart for client-side display
  const augmentedCart = cart.toObject();
  let totalAmount = 0; // Recalculate total based on current effective prices

  augmentedCart.items = augmentedCart.items.map(item => {
    const product = item.product;
    
    // Instantiate a Mongoose Model instance to use the getFinalPrice method
    const ProductModel = mongoose.model('Product');
    const productInstance = new ProductModel(product);

    // Calculate effective price at this moment for display
    if (product.activeDiscount && product.activeDiscount.isActive) {
      product.finalPrice = productInstance.getFinalPrice(product.activeDiscount);
      product.hasDiscount = true;
      product.discount = product.activeDiscount;
    } else {
      product.finalPrice = product.price;
      product.hasDiscount = false;
    }

    // This totalAmount is not saved to the Cart model, but it's important 
    // for the client to have an accurate total based on current prices.
    totalAmount += product.finalPrice * item.quantity;
    
    // Note: item.priceAtAdd (original price lock) is preserved but not used for total
    return item;
  });

  // Overwrite the cart total for the response, ensuring it reflects the current discounts
  augmentedCart.totalAmount = totalAmount;

  res.json({
    success: true,
    cart: augmentedCart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  // Get product
  const product = await Product.findById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.status !== 'listed') {
    res.status(400);
    throw new Error('Product is not available');
  }

  if (product.stockQuantity < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stockQuantity} items available in stock`);
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  // Check if item already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + Number(quantity);
    
    if (newQuantity > product.stockQuantity) {
      res.status(400);
      throw new Error(`Cannot add more. Only ${product.stockQuantity} available`);
    }
    
    cart.items[existingItemIndex].quantity = newQuantity;
    // priceAtAdd remains the original price, the order controller will use the CURRENT effective price
    
  } else {
    // Add new item with original price locked (priceAtAdd)
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      priceAtAdd: product.price // Lock original price when added
    });
  }

  await cart.save();
  
  // Re-run the logic to get the correct augmented cart for the response
  const updatedCart = await Cart.findOne({ user: userId })
    .populate({
        path: 'items.product',
        populate: { path: 'activeDiscount' }
    });

  const augmentedCart = updatedCart.toObject();
  let responseTotalAmount = 0;

  augmentedCart.items = augmentedCart.items.map(item => {
    const product = item.product;
    const ProductModel = mongoose.model('Product');
    const productInstance = new ProductModel(product);

    if (product.activeDiscount && product.activeDiscount.isActive) {
      product.finalPrice = productInstance.getFinalPrice(product.activeDiscount);
      product.hasDiscount = true;
      product.discount = product.activeDiscount;
    } else {
      product.finalPrice = product.price;
      product.hasDiscount = false;
    }
    responseTotalAmount += product.finalPrice * item.quantity;
    return item;
  });
  
  augmentedCart.totalAmount = responseTotalAmount; // Update total for response

  res.json({
    success: true,
    message: 'Item added to cart',
    cart: augmentedCart
  });
});

// @desc    Update cart item quantity
// @route   PATCH /api/cart/items/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  // Check stock availability
  const product = await Product.findById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (Number(quantity) > product.stockQuantity) {
    res.status(400);
    throw new Error(`Only ${product.stockQuantity} items available`);
  }

  // Update quantity
  cart.items[itemIndex].quantity = Number(quantity);
  await cart.save();
  
  // Re-run the logic to get the correct augmented cart for the response
  const updatedCart = await Cart.findOne({ user: userId })
    .populate({
        path: 'items.product',
        populate: { path: 'activeDiscount' }
    });
  
  const augmentedCart = updatedCart.toObject();
  let responseTotalAmount = 0;
  
  augmentedCart.items = augmentedCart.items.map(item => {
    const product = item.product;
    const ProductModel = mongoose.model('Product');
    const productInstance = new ProductModel(product);

    if (product.activeDiscount && product.activeDiscount.isActive) {
      product.finalPrice = productInstance.getFinalPrice(product.activeDiscount);
      product.hasDiscount = true;
      product.discount = product.activeDiscount;
    } else {
      product.finalPrice = product.price;
      product.hasDiscount = false;
    }
    responseTotalAmount += product.finalPrice * item.quantity;
    return item;
  });
  
  augmentedCart.totalAmount = responseTotalAmount; // Update total for response

  res.json({
    success: true,
    message: 'Cart updated',
    cart: augmentedCart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Remove item
  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();
  
  // Re-run the logic to get the correct augmented cart for the response
  const updatedCart = await Cart.findOne({ user: userId })
    .populate({
        path: 'items.product',
        populate: { path: 'activeDiscount' }
    });
  
  const augmentedCart = updatedCart.toObject();
  let responseTotalAmount = 0;

  augmentedCart.items = augmentedCart.items.map(item => {
    const product = item.product;
    const ProductModel = mongoose.model('Product');
    const productInstance = new ProductModel(product);

    if (product.activeDiscount && product.activeDiscount.isActive) {
      product.finalPrice = productInstance.getFinalPrice(product.activeDiscount);
      product.hasDiscount = true;
      product.discount = product.activeDiscount;
    } else {
      product.finalPrice = product.price;
      product.hasDiscount = false;
    }
    responseTotalAmount += product.finalPrice * item.quantity;
    return item;
  });

  augmentedCart.totalAmount = responseTotalAmount; // Update total for response

  res.json({
    success: true,
    message: 'Item removed from cart',
    cart: augmentedCart
  });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.json({
    success: true,
    message: 'Cart cleared',
    cart
  });
});