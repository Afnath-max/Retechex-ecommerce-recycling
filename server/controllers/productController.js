import Product from '../models/Product.js';
import Discount from '../models/Discount.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { saveUploadedImage } from '../utils/fileStorage.js';

const calculateFinalPrice = (price, discount) => {
  if (!discount || !discount.isActive) return price;
  if (discount.type === 'percentage') return price * (1 - discount.value / 100);
  return Math.max(0, price - discount.value);
};

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    condition,
    minPrice,
    maxPrice,
    sort = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 12,
    status = 'listed'
  } = req.query;

  // Build query
  let query = {};

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Filters
  if (category) query.category = category;
  if (condition) query.condition = condition;
  if (status) query.status = status;

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Sort
  const sortOrder = order === 'asc' ? 1 : -1;
  let sortQuery = {};
  
  if (sort === 'price') {
    sortQuery.price = sortOrder;
  } else if (sort === 'name') {
    sortQuery.name = sortOrder;
  } else {
    sortQuery.createdAt = sortOrder;
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortQuery)
      .limit(Number(limit))
      .skip(skip)
      .populate('activeDiscount')
      .lean({ virtuals: true }),
    Product.countDocuments(query)
  ]);

  // Calculate final prices with discounts
  const productsWithPrices = products.map(product => {
    const productObj = { ...product };
    
    if (product.activeDiscount && product.activeDiscount.isActive) {
      productObj.finalPrice = calculateFinalPrice(product.price, product.activeDiscount);
      productObj.hasDiscount = true;
      productObj.discount = product.activeDiscount;
    } else {
      productObj.finalPrice = product.price;
      productObj.hasDiscount = false;
    }

    return productObj;
  });

  res.json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    products: productsWithPrices
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('activeDiscount')
    .lean({ virtuals: true });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const productObj = { ...product };
  
  if (product.activeDiscount && product.activeDiscount.isActive) {
    productObj.finalPrice = calculateFinalPrice(product.price, product.activeDiscount);
    productObj.hasDiscount = true;
    productObj.discount = product.activeDiscount;
  } else {
    productObj.finalPrice = product.price;
    productObj.hasDiscount = false;
  }

  res.json({
    success: true,
    product: productObj
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    condition,
    price,
    description = '',
    brand = '',
    stockQuantity = 0,
    lowStockThreshold = 10,
    tags,
    status,
  } = req.body;

  // Store image in images array. On Vercel this becomes a Blob URL.
  const imageUrl = await saveUploadedImage(req.file, 'products');
  const images = imageUrl ? [imageUrl] : [];

  // Cast numerics
  const prod = await Product.create({
    name,
    category,
    condition,
    price: Number(price),
    description,
    brand,
    stockQuantity: Number(stockQuantity),
    lowStockThreshold: Number(lowStockThreshold),
    images, // ✅ Use images array
    tags,
    status: status || 'listed',
  });

  res.status(201).json({ success: true, message: 'Product created successfully', product: prod });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Allowed fields
  const payload = {};
  [
    'name',
    'category',
    'condition',
    'description',
    'brand',
    'tags',
    'status',
  ].forEach((k) => {
    if (k in req.body) payload[k] = req.body[k];
  });

  if ('price' in req.body) payload.price = Number(req.body.price);
  if ('stockQuantity' in req.body) payload.stockQuantity = Number(req.body.stockQuantity);
  if ('lowStockThreshold' in req.body) payload.lowStockThreshold = Number(req.body.lowStockThreshold);

  if (req.file) {
    const newImagePath = await saveUploadedImage(req.file, 'products');
    // NOTE: This REPLACES any existing images with the new one.
    // If you need to keep previous images, you'd need a more complex array management on the frontend.
    payload.images = [newImagePath];
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  res.json({ success: true, message: 'Product updated successfully', product: updated });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin/Staff
export const updateStock = asyncHandler(async (req, res) => {
  const { quantity, action, note } = req.body;

  if (!quantity || !action) {
    res.status(400);
    throw new Error('Please provide quantity and action (increment/decrement)');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Update stock
  if (action === 'increment') {
    product.stockQuantity += Number(quantity);
    product.lastRestocked = new Date();
  } else if (action === 'decrement') {
    if (product.stockQuantity < quantity) {
      res.status(400);
      throw new Error('Insufficient stock');
    }
    product.stockQuantity -= Number(quantity);
  } else {
    res.status(400);
    throw new Error('Invalid action. Use "increment" or "decrement"');
  }

  // Update status based on stock
  if (product.stockQuantity === 0) {
    product.status = 'out_of_stock';
  } else if (product.status === 'out_of_stock') {
    product.status = 'listed';
  }

  await product.save();

  res.json({
    success: true,
    message: 'Stock updated successfully',
    product: {
      id: product._id,
      name: product.name,
      stockQuantity: product.stockQuantity,
      status: product.status,
      isLowStock: product.isLowStock,
      isOutOfStock: product.isOutOfStock
    },
    note
  });
});

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Admin/Staff
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const { threshold = 10 } = req.query;

  const products = await Product.find({
    stockQuantity: { $lte: Number(threshold), $gt: 0 },
    status: 'listed'
  }).sort({ stockQuantity: 1 }).lean();

  res.json({
    success: true,
    count: products.length,
    threshold: Number(threshold),
    products
  });
});

// @desc    Get out of stock products
// @route   GET /api/products/out-of-stock
// @access  Private/Admin/Staff
export const getOutOfStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    stockQuantity: 0
  }).sort({ updatedAt: -1 }).lean();

  res.json({
    success: true,
    count: products.length,
    products
  });
});
