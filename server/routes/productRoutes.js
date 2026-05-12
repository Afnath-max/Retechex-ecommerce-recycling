// routes/products.js
import express from 'express';
import multer from 'multer';

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

const router = express.Router();

/**
 * Multer setup for single image upload (field name: "image")
 * Saves files to ./uploads with a unique filename.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'server/uploads/'),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `product-${Date.now()}.${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  // allow png, jpg, jpeg, webp
  if (/image\/(png|jpe?g|webp)$/i.test(file.mimetype)) return cb(null, true);
  cb(new Error('Only PNG, JPG, and WEBP images are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

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