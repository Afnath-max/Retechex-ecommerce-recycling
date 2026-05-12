import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Appointment from '../models/Appointment.js';
import Discount from '../models/Discount.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateAdminSummaryPDF } from '../utils/pdfGenerator.js';
import fs from 'fs'; // REQUIRED to delete the temporary PDF file after download

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;

  let query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip(skip);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    users
  });
});

// Create staff account
export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, phone, assignedBranch } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const staff = await User.create({
    name,
    email,
    password,
    phone,
    role: 'staff',
    assignedBranch
  });

  res.status(201).json({
    success: true,
    message: 'Staff account created',
    staff: {
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      assignedBranch: staff.assignedBranch
    }
  });
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Cannot delete admin users');
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'User deleted'
  });
});

// Update user role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['customer', 'staff', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: 'User role updated',
    user
  });
});

// Dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const pendingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
  const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
  const lowStockProducts = await Product.countDocuments({ stockQuantity: { $lte: 10, $gt: 0 } });

  // This month stats
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
  const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });
  const revenueThisMonth = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfMonth }, orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      pendingAppointments,
      lowStockProducts,
      newUsersThisMonth,
      ordersThisMonth,
      revenueThisMonth: revenueThisMonth[0]?.total || 0
    }
  });
});

// Revenue trend
export const getRevenueTrend = asyncHandler(async (req, res) => {
  const { period = '30days' } = req.query;

  let startDate;
  if (period === '7days') {
    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30days') {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  } else {
    startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  }

  const trend = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        orderStatus: { $ne: 'Cancelled' }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    trend
  });
});


// FIX: Added user fetching logic and corrected inventory field names
export const downloadAdminSummaryPDF = async (req, res) => {
  try {
    // === 1. USERS (Added) ===
    const [usersCount, userRoles, allUsers] = await Promise.all([
      User.countDocuments({}),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      // Fetch a list of all users (name, email, role, date created)
      User.find({})
        .select('name email role createdAt')
        .sort({ role: 1, createdAt: -1 })
        .lean(),
    ]);
    const users = {
      count: usersCount,
      byRole: userRoles || [],
      list: allUsers || [], // List of all users to be displayed in PDF
    };

    // Orders
    const [ordersCount, revenueAgg, ordersByStatus] = await Promise.all([
      Order.countDocuments({}),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    ]);
    const orders = {
      count: ordersCount,
      revenue: revenueAgg?.[0]?.total || 0,
      byStatus: ordersByStatus || [],
    };

    // Appointments
    const [apptCount, apptByStatus, nextAppt] = await Promise.all([
      Appointment.countDocuments({}),
      Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Appointment.findOne({ appointmentDate: { $gte: new Date() } })
        .sort({ appointmentDate: 1 })
        .select('appointmentDate branch')
        .lean(),
    ]);
    const appointments = {
      count: apptCount,
      byStatus: apptByStatus || [],
      next: nextAppt
        ? {
            date: new Date(nextAppt.appointmentDate).toLocaleString(),
            branch: nextAppt.branch,
          }
        : null,
    };

    // Inventory (Corrected assumed field names to 'stockQuantity')
    const [productsCount, stockAgg, lowStock] = await Promise.all([
      Product.countDocuments({}),
      Product.aggregate([{ $group: { _id: null, sum: { $sum: '$stockQuantity' } } }]),
      Product.find({ stockQuantity: { $lte: 10 } }).select('name stockQuantity').sort({ stockQuantity: 1 }).limit(5).lean(),
    ]);
    const inventory = {
      count: productsCount,
      inStock: stockAgg?.[0]?.sum || 0,
      lowStock: lowStock || [],
    };

    // Discounts
    const activeDiscounts = await Discount.countDocuments({
      isActive: true,
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });
    const topDiscounts = await Discount.find({ isActive: true })
      .select('code name percentage percent')
      .sort({ percentage: -1, percent: -1 })
      .limit(5)
      .lean();
    const discounts = { active: activeDiscounts, top: topDiscounts || [] };

    // Build PDF
    const filePath = await generateAdminSummaryPDF({
      generatedAt: new Date(),
      users, // <--- Now includes user data
      orders,
      appointments,
      inventory,
      discounts,
    });

    const filename = `admin-summary-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.download(filePath, filename, (err) => {
      try { fs.unlinkSync(filePath); } catch {}
      if (err) console.error('Download error:', err);
    });
  } catch (err) {
    console.error('Admin summary PDF error:', err);
    res.status(500).json({ message: 'Failed to build summary report' });
  }
};


// Order status distribution
export const getOrderStatusDistribution = asyncHandler(async (req, res) => {
  const distribution = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    distribution
  });
});

// Top products
export const getTopProducts = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const topProducts = await Product.find()
    .sort({ sales: -1 })
    .limit(Number(limit))
    .select('name category sales price');

  res.json({
    success: true,
    topProducts
  });
});

// Discount CRUD
export const createDiscount = asyncHandler(async (req, res) => {
  const discount = await Discount.create({
    ...req.body,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Discount created',
    discount
  });
});

export const getAllDiscounts = asyncHandler(async (req, res) => {
  const discounts = await Discount.find()
    .populate('productId', 'name category')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: discounts.length,
    discounts
  });
});

export const updateDiscount = asyncHandler(async (req, res) => {
  const discount = await Discount.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!discount) {
    res.status(404);
    throw new Error('Discount not found');
  }

  res.json({
    success: true,
    message: 'Discount updated',
    discount
  });
});

export const deleteDiscount = asyncHandler(async (req, res) => {
  const discount = await Discount.findById(req.params.id);

  if (!discount) {
    res.status(404);
    throw new Error('Discount not found');
  }

  await discount.deleteOne();

  res.json({
    success: true,
    message: 'Discount deleted'
  });
});

// Create bulk discount (apply to all products)
export const createBulkDiscount = asyncHandler(async (req, res) => {
  const { percentage, startDate, endDate, name, description } = req.body;

  if (!percentage || percentage <= 0 || percentage > 100) {
    res.status(400);
    throw new Error('Please provide a valid percentage between 1 and 100');
  }

  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Please provide start and end dates');
  }

  if (new Date(endDate) <= new Date(startDate)) {
    res.status(400);
    throw new Error('End date must be after start date');
  }

  // Get all products
  const products = await Product.find({ status: 'listed' });

  if (products.length === 0) {
    res.status(400);
    throw new Error('No products available to apply discount');
  }

  // Create discount for each product
  const discounts = [];
  for (const product of products) {
    const discount = await Discount.create({
      name: name || `Bulk Discount - ${percentage}%`,
      description: description || `Site-wide ${percentage}% discount`,
      type: 'percentage',
      value: percentage,
      scope: 'product',
      productId: product._id,
      startDate,
      endDate,
      isActive: true,
      createdBy: req.user.id
    });
    discounts.push(discount);
  }

  res.status(201).json({
    success: true,
    message: `Bulk discount applied to ${discounts.length} products`,
    count: discounts.length,
    discount: {
      percentage,
      startDate,
      endDate,
      productsAffected: discounts.length
    }
  });
});

// Get category-wise product count
export const getCategoryStats = asyncHandler(async (req, res) => {
  const stats = await Product.aggregate([
    { $match: { status: 'listed' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    stats
  });
});