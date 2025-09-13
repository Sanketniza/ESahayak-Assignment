const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Get token from request
const getToken = (req) => {
  let token;
  
  // Check headers for authorization token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookies for token (for browser clients)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  return token;
};

// Middleware to protect routes - requires authentication
exports.protect = async (req, res, next) => {
  try {
    const token = getToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Please log in.'
    });
  }
};

// Middleware to check if user is owner or admin
exports.checkOwnership = (req, res, next) => {
  const buyerId = req.params.id;
  
  // If user is admin, allow access
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Get the buyer object to check ownership
  // Note: This assumes the buyer object is already fetched and attached to req
  if (!req.buyer) {
    return res.status(404).json({
      success: false,
      message: 'Buyer not found'
    });
  }
  
  // Check if user owns this buyer
  if (req.buyer.ownerId !== req.user._id) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to perform this action. You can only edit your own leads.'
    });
  }
  
  // User is the owner, proceed
  next();
};

// Middleware to check if user is admin
exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    
    next();
  };
};