const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const rateLimit = require('./middleware/rateLimitMiddleware');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev')); // Logger
app.use(rateLimit()); // Rate limiting

// Define routes
const buyerRoutes = require('./routes/buyerRoutes');
app.use('/api/buyers', buyerRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Buyer Lead Intake API running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
