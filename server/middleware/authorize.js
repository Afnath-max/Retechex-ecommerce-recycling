/**
 * Role-based authorization middleware
 * Usage: authorize('admin') or authorize('admin', 'staff')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required.' 
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. This action requires ${allowedRoles.join(' or ')} role. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource
 * Usage: authorizeOwner() - checks if resource belongs to user
 */
export const authorizeOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required.' 
    });
  }

  // Admin can access any resource
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user owns the resource (req.params.userId or req.user.id)
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (resourceUserId && resourceUserId !== req.user.id.toString()) {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. You can only access your own resources.' 
    });
  }

  next();
};
