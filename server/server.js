import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'node:dns';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import discountRoutes from './routes/discountRoutes.js';
import adminDiscountRoutes from './routes/adminDiscountRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

// Load env variables
dotenv.config();
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
await connectDB();

/* -------------------- Static uploads (ABSOLUTE PATH) -------------------- */
const uploadPath = path.join(__dirname, 'server', 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use('/uploads', express.static(uploadPath));
// Optional: helpful log
console.log('📂 Serving /uploads from:', uploadPath);
/* ----------------------------------------------------------------------- */

// Middleware
app.use("/uploads", express.static(path.join("server", "uploads")));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ReTechEx API is running',
    health: '/health',
    api: '/api'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/admin/discounts', adminDiscountRoutes);
app.use('/api/contact', contactRoutes);

// Error handlers (must be LAST)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
