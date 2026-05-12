// routes/products.js
import express from 'express';

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getOutOfStockProducts
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/alerts/low-stock', authenticateToken, authorize('admin', 'staff'), getLowStockProducts);
router.get('/alerts/out-of-stock', authenticateToken, authorize('admin', 'staff'), getOutOfStockProducts);
router.get('/:id', getProduct);

// ✅ Enable multipart parsing for create/update
router.post('/', authenticateToken, authorize('admin'), upload.single('image'), createProduct);
router.put('/:id', authenticateToken, authorize('admin'), upload.single('image'), updateProduct);

router.delete('/:id', authenticateToken, authorize('admin'), deleteProduct);
router.patch('/:id/stock', authenticateToken, authorize('admin', 'staff'), updateStock);

export default router;
