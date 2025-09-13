const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getCurrentUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes
router.get('/me', protect, getCurrentUser);

module.exports = router;