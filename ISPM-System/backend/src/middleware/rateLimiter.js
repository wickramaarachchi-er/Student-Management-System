/**
 * middleware/rateLimiter.js
 * Express rate-limiting middleware to protect sensitive endpoints against brute-force attacks.
 */
import rateLimit from 'express-rate-limit';

/**
 * Demo-friendly rate limiter for authentication routes (e.g. POST /api/auth/login).
 * Limit: 15 login requests per 15 minutes per IP address.
 * Responds with HTTP 429 when threshold is exceeded.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 15, // Allow 15 attempts per 15 mins (demo friendly)
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
      error: {
        code: 'TOO_MANY_REQUESTS',
        details: 'Rate limit exceeded for login endpoint.',
      },
    });
  },
});
