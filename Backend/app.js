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

// CORS configured via environment: support multiple comma-separated origins
const rawOrigins = process.env.CORS_ORIGIN || '*';
const allowedOrigins = rawOrigins === '*'
  ? '*'
  : rawOrigins
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin requests (mobile apps, curl, same-origin on server)
    if (!origin) return callback(null, true);
    if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked origin: ${origin}`);
    // Disable CORS for this request without throwing an error (avoids 500)
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Handle preflight for all routes (use regex to avoid path-to-regexp '*' error)
app.options(/.*/, cors(corsOptions));

// Fallback: manual OPTIONS handler to guarantee 204 with proper headers
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') return next();
  const origin = req.headers.origin;
  const originAllowed = !origin || allowedOrigins === '*' || allowedOrigins.includes(origin);
  if (originAllowed && origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      req.headers['access-control-request-headers'] || 'Content-Type, Authorization'
    );
  }
  return res.sendStatus(204);
});
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
