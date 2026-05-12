import express from 'express';
import {
  getAllUsers,
  createStaff,
  deleteUser,
  updateUserRole,
  getDashboardStats,
  getRevenueTrend,
  getOrderStatusDistribution,
  getTopProducts,
  createDiscount,
  getAllDiscounts,
  updateDiscount,
  deleteDiscount,
  createBulkDiscount,
  getCategoryStats,
  // ⬇️ add this
  downloadAdminSummaryPDF,
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Global protection for all admin routes
router.use(authenticateToken);
router.use(authorize('admin'));

// Users / staff
router.get('/users', getAllUsers);
router.post('/staff', createStaff);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

// Dashboard & charts
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/revenue-trend', getRevenueTrend);
router.get('/dashboard/order-distribution', getOrderStatusDistribution);
router.get('/dashboard/top-products', getTopProducts);
router.get('/dashboard/category-stats', getCategoryStats);

// Discounts
router.get('/discounts', getAllDiscounts);
router.post('/discounts', createDiscount);
router.post('/discounts/bulk', createBulkDiscount);
router.put('/discounts/:id', updateDiscount);
router.delete('/discounts/:id', deleteDiscount);

// Summary PDF (auth already applied via router.use)
router.get('/report/summary/pdf', downloadAdminSummaryPDF);

export default router;