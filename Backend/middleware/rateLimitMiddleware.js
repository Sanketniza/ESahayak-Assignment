// Simple in-memory rate limiting middleware
// Normally you would use a package like express-rate-limit or connect-rate-limit
// But for simplicity, we're implementing a basic version

const rateLimit = () => {
  const requests = new Map();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_REQUESTS = 100; // Maximum requests per window

  // Clean up old entries every 15 minutes
  setInterval(() => {
    const now = Date.now();
    requests.forEach((value, key) => {
      if (now - value.timestamp > WINDOW_MS) {
        requests.delete(key);
      }
    });
  }, WINDOW_MS);

  return (req, res, next) => {
    // Create a key based on IP
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, {
        count: 1,
        timestamp: now
      });
      return next();
    }
    
    const request = requests.get(key);
    
    // Reset if outside window
    if (now - request.timestamp > WINDOW_MS) {
      request.count = 1;
      request.timestamp = now;
      return next();
    }
    
    // Increment count
    request.count += 1;
    
    // Check limit
    if (request.count > MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }
    
    next();
  };
};

module.exports = rateLimit;