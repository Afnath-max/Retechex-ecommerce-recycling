import express from 'express';
import { getBulkDiscount } from '../controllers/discountConfigController.js';

const router = express.Router();
router.get('/bulk', getBulkDiscount);
export default router;
