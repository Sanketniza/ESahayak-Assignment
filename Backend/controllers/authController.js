const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Zod validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passwordConfirm: z.string()
}).refine(data => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ['passwordConfirm']
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Send JWT token in response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);
  
  // Token expiry - convert to milliseconds for JavaScript Date
  const expiresInMs = process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000;
  const expiry = new Date(Date.now() + expiresInMs);
  
  const cookieOptions = {
    expires: expiry,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };
  
  res.cookie('token', token, cookieOptions);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user
    }
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    // Validate request body
    const validData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const userExists = await User.findOne({ email: validData.email });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }
    
    // Create user
    const user = await User.create({
      name: validData.name,
      email: validData.email,
      password: validData.password
    });
    
    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Zod validation errors
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering user'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Validate request body
    const validData = loginSchema.parse(req.body);
    const { email, password } = validData;
    
    // Find user by email and select password
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle Zod validation errors
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error retrieving user'
    });
  }
};