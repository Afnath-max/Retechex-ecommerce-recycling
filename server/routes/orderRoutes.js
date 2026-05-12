import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updateShippingAddress,
  updateOrderAddress,
  downloadOrderPDF,
  deleteOrder // ⬅️ ADDED
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.post('/', authenticateToken, authorize('customer'), createOrder);
router.get('/my', authenticateToken, authorize('customer'), getMyOrders);
router.get('/all/list', authenticateToken, authorize('admin', 'staff'), getAllOrders);
router.get('/:id', authenticateToken, getOrder);
router.get('/:id/pdf', authenticateToken, downloadOrderPDF);
router.patch('/:id/cancel', authenticateToken, authorize('customer'), cancelOrder);
router.patch('/:id/address', authenticateToken, authorize('customer'), updateShippingAddress);
router.patch('/:id/status', authenticateToken, authorize('admin', 'staff'), updateOrderStatus);


router.delete('/:id', authenticateToken, authorize('admin', 'staff'), deleteOrder);

export default router;