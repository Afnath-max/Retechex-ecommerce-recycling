import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@retechex.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Deleting old one...');
      await User.deleteOne({ email: 'admin@retechex.com' });
    }

    // Hash password properly
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('🔐 Password hashed successfully');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@retechex.com',
      password: hashedPassword,
      role: 'admin',
      phone: '0771234567',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Email: admin@retechex.com');
    console.log('🔑 Password: admin123');
    console.log('🌐 Login at: http://localhost:5173/admin/login');
    console.log('');
    console.log('Admin ID:', admin._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
