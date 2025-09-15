const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const rateLimit = require('./middleware/rateLimitMiddleware');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB (safe on Vercel: connection is cached across invocations)
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configured via environment (fallback to all during local dev)
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Handle preflight quickly
app.options('*', cors({ origin: allowedOrigin, credentials: true }));
app.use(morgan('dev'));
app.use(rateLimit());

// Routes
const buyerRoutes = require('./routes/buyerRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/buyers', buyerRoutes);
app.use('/api/auth', authRoutes);

// Health check
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

module.exports = app;
