import express from 'express';
import { setBulkDiscount } from '../controllers/discountConfigController.js';

const router = express.Router();

// Simple admin guard using x-admin-key = process.env.ADMIN_SECRET (optional in dev)
const adminGuard = (req, res, next) => {
  const key = req.header('x-admin-key');
  if (!process.env.ADMIN_SECRET) return next();
  if (key === process.env.ADMIN_SECRET) return next();
  return res.status(401).json({ success:false, message:'Admin key required' });
};

router.post('/bulk', express.json(), adminGuard, setBulkDiscount);
export default router;
