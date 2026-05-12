import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token and attach user to request
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid token payload.' 
      });
    }

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found.' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'Your account has been deactivated.' 
      });
    }

    // Attach user to request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      assignedBranch: user.assignedBranch
    };

    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Session expired. Please log in again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid token.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Authentication failed.' 
    });
  }
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};
