import express from 'express';
import { createContactMessage, listContactMessages } from '../controllers/contactController.js';
import { authenticateToken } from '../middleware/auth.js';        // <-- add
import { authorize } from '../middleware/authorize.js';  

const router = express.Router();

// Public submit (no auth required)
router.post('/', express.json(), createContactMessage);

router.get(
  '/',
  authenticateToken,
  authorize('admin'),
  listContactMessages
);

export default router;