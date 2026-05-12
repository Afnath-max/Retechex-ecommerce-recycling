import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorize('staff'));

router.get('/dashboard/stats', getDashboardStats);

export default router;
