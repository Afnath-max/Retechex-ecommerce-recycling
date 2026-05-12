import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';
import { generateOrderPDF } from '../utils/pdfGenerator.js';
import fs from 'fs';

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private/Customer
export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, paymentMethod = 'Cash on Delivery' } = req.body;

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
    res.status(400);
    throw new Error('Please provide complete shipping address');
  }

  // Get user's cart, ensuring we populate the activeDiscount for current pricing
  const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      populate: { path: 'activeDiscount' } // CRUCIAL: Get current active discount
  });
  
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // --- Start of Price/Stock Validation and Order Item Preparation ---
  let totalAmount = 0;
  const orderItems = [];

  for (const item of cart.items) {
    // We can rely on the populated product with activeDiscount
    const product = item.product; 
    
    if (!product) {
      res.status(404);
      throw new Error(`Product for cart item not found`);
    }
    
    // Check stock
    if (product.stockQuantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
    }
    
    if (product.status !== 'listed') {
      res.status(400);
      throw new Error(`Product ${product.name} is no longer available`);
    }

    // --- FIX: Calculate final effective price at the moment of purchase ---
    let effectivePrice = product.price;
    const activeDiscount = product.activeDiscount;
    
    if (activeDiscount && activeDiscount.isValid) {
        // Instantiate a Mongoose Model instance to use the getFinalPrice method
        const ProductModel = mongoose.model('Product');
        const productInstance = new ProductModel(product); 

        effectivePrice = productInstance.getFinalPrice(activeDiscount);
    }
    
    totalAmount += effectivePrice * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: effectivePrice // Use the current effective (discounted) price
    });
  }
  // --- End of Price/Stock Validation and Order Item Preparation ---
  
  // Calculate total (REMOVED: const totalAmount = cart.totalAmount; - now calculated above)

  // Generate order number
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderNumber = `ORD-${year}${month}${day}-${random}`;

  // Create order
  const order = await Order.create({
    orderNumber,
    user: userId,
    items: orderItems,
    totalAmount, // Use the new calculated total with discounts
    shippingAddress,
    paymentMethod,
    paymentStatus: 'Pending',
    orderStatus: 'Processing'
  });

  // Decrement stock for each product
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(
      item.product._id,
      {
        $inc: {
          stockQuantity: -item.quantity,
          sales: item.quantity
        }
      }
    );
  }

  // Clear cart
  await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [], totalAmount: 0 } }
  );

  // Populate order details
  const populatedOrder = await Order.findById(order._id)
    .populate('items.product')
    .populate('user', 'name email phone');

  // Send order confirmation email
  try {
    await sendOrderConfirmationEmail(
      populatedOrder.user.email,
      populatedOrder.user.name,
      populatedOrder
    );
    console.log('✅ Order confirmation email sent');
  } catch (emailError) {
    console.error('❌ Failed to send order confirmation email:', emailError);
    // Don't fail the order if email fails
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order: populatedOrder
  });
});

// @desc    Get customer's orders
// @route   GET /api/orders/my
// @access  Private/Customer
export const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, page = 1, limit = 10 } = req.query;

  let query = { user: userId };
  
  if (status) {
    query.orderStatus = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const orders = await Order.find(query)
    .populate('items.product')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip(skip);

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product')
    .populate('user', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Normalize IDs for comparison (avoid ObjectId vs string mismatch)
  const orderUserId = (order.user && order.user._id
    ? order.user._id.toString()
    : order.user?.toString?.() || '');

  const requesterId = (req.user && (req.user.id || req.user._id))
    ? String(req.user.id || req.user._id)
    : '';

  // Only restrict customers; allow admin/staff to view any order
  if (
    req.user &&
    req.user.role === 'customer' &&
    orderUserId &&
    requesterId &&
    orderUserId !== requesterId
  ) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    order,
  });
});

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private/Customer
export const cancelOrder = asyncHandler(async (req, res) => {
  // Load order first (outside any session)
  let order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ownership check
  if (order.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  // Only when Processing
  if (order.orderStatus !== 'Processing') {
    res.status(400);
    throw new Error('Order cannot be cancelled. Current status: ' + order.orderStatus);
  }

  // -------- Attempt transactional path (replica set required) --------
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Re-read inside the session to avoid stale doc
    order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      res.status(404);
      throw new Error('Order not found');
    }

    // Update order status
    order.orderStatus = 'Cancelled';
    await order.save({ session });

    // Restore stock for each item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQuantity: item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (err) {
    // If the error is due to transactions not being supported, fallback
    const msg = String(err?.message || '');
    const isTxnNotSupported =
      msg.includes('Transaction numbers are only allowed on a replica set member') ||
      msg.includes('Transaction') && msg.includes('replica set');

    // Clean up session if opened
    if (session) {
      try { await session.abortTransaction(); } catch (_) {}
      session.endSession();
    }

    if (!isTxnNotSupported) {
      // Real error unrelated to transactions → bubble up
      throw err;
    }
    // else fall through to non-transactional path
  }

  // -------- Non-transactional fallback (standalone Mongo) --------
  // Re-read fresh order to ensure we didn't partially change it
  order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.orderStatus !== 'Processing') {
    res.status(400);
    throw new Error('Order cannot be cancelled. Current status: ' + order.orderStatus);
  }

  // 1) Update order status first
  order.orderStatus = 'Cancelled';
  await order.save();

  // 2) Best-effort stock restore (non-transactional)
  //    If any product is missing, skip it but keep the order cancelled.
  for (const item of order.items) {
    try {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQuantity: item.quantity } }
      );
    } catch (_) {
      // log if you want: console.warn('Stock restore failed for', item.product, _);
    }
  }

  return res.json({
    success: true,
    message: 'Order cancelled successfully',
    order
  });
});

// @desc    Update order shipping address
// @route   PATCH /api/orders/:id/address
// @access  Private
export const updateOrderAddress = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check ownership
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  // Can only update address if order is still being processed
  if (order.orderStatus !== 'Processing') {
    res.status(400);
    throw new Error('Cannot update address. Order has already been ' + order.orderStatus.toLowerCase());
  }

  const { shippingAddress } = req.body;

  if (shippingAddress) {
    order.shippingAddress = {
      street: shippingAddress.street || order.shippingAddress.street,
      city: shippingAddress.city || order.shippingAddress.city,
      state: shippingAddress.state || order.shippingAddress.state,
      zipCode: shippingAddress.zipCode || order.shippingAddress.zipCode,
      country: shippingAddress.country || order.shippingAddress.country || 'Sri Lanka'
    };
  }

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: 'Shipping address updated successfully',
    order: updatedOrder
  });
});

// @desc    Get all orders (Admin/Staff)
// @route   GET /api/orders/all
// @access  Private/Admin/Staff
export const getAllOrders = asyncHandler(async (req, res) => {
  const {
    status,
    paymentStatus,
    startDate,
    endDate,
    page = 1,
    limit = 10
  } = req.query;

  let query = {};

  if (status) query.orderStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const orders = await Order.find(query)
    .populate('user', 'name email phone')
    .populate('items.product', 'name category')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip(skip);

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    orders
  });
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin/Staff
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingNumber, note } = req.body;

  if (!orderStatus) {
    res.status(400);
    throw new Error('Order status is required');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Update status
  order.orderStatus = orderStatus;
  
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }
  
  if (note) {
    order.notes = note;
  }

  // Add to status history
  order.statusHistory.push({
    status: orderStatus,
    updatedBy: req.user.id,
    note
  });

  await order.save();

  res.json({
    success: true,
    message: 'Order status updated',
    order
  });
});

// @desc    Update shipping address
// @route   PATCH /api/orders/:id/address
// @access  Private/Customer
export const updateShippingAddress = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check ownership
  if (order.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  // Can only update address if status is Processing
  if (order.orderStatus !== 'Processing') {
    res.status(400);
    throw new Error('Address can only be updated for orders in Processing status');
  }

  // Normalize input
  const { shippingAddress } = req.body;
  if (!shippingAddress) {
    res.status(400);
    throw new Error('shippingAddress field is required');
  }

  // Update only defined fields
  order.shippingAddress = {
    ...order.shippingAddress,
    street: shippingAddress.street || order.shippingAddress?.street,
    city: shippingAddress.city || order.shippingAddress?.city,
    zipCode:
      shippingAddress.zipCode ||
      shippingAddress.postalCode ||
      order.shippingAddress?.zipCode,
    country: shippingAddress.country || order.shippingAddress?.country || 'Sri Lanka',
  };

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: 'Shipping address updated successfully',
    order: updatedOrder,
  });
});

// @desc    Download order PDF
// @route   GET /api/orders/:id/pdf
// @access  Private
export const downloadOrderPDF = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product')
    .populate('user', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check authorization
  if (req.user.role === 'customer' && order.user._id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  try {
    const pdfPath = await generateOrderPDF(order);
    
    res.download(pdfPath, `order-${order._id.toString().slice(-8).toUpperCase()}.pdf`, (err) => {
      // Delete temp file after sending
      fs.unlinkSync(pdfPath);
      
      if (err) {
        console.error('PDF download error:', err);
        res.status(500);
        throw new Error('Failed to download PDF');
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500);
    throw new Error('Failed to generate PDF');
  }
});

// @desc    Delete order (hard delete)
// @route   DELETE /api/orders/:id
// @access  Private/Admin/Staff
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // NOTE: Assuming Admin/Staff are authorized by the route middleware
  // For safety, only allow deletion of orders that are Cancelled or Delivered
  // OR restore stock if not Cancelled/Delivered, but that is complex and risky
  // For simplicity, let's just allow the deletion for Admin/Staff as requested,
  // but a real-world app should handle stock restoration carefully.

  await order.deleteOne();

  res.json({
    success: true,
    message: 'Order permanently deleted'
  });
});