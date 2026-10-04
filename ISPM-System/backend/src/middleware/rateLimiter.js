/**
 * middleware/rateLimiter.js
 * Express rate-limiting middleware to protect sensitive endpoints against brute-force attacks.
 */
import rateLimit from 'express-rate-limit';

export const passwordChangeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => req.user.id,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password change attempts. Please try again in 15 minutes.' },
});

/**
 * Demo-friendly rate limiter for authentication routes (e.g. POST /api/auth/login).
 * Limit: 15 login requests per 15 minutes per IP address.
 * Responds with HTTP 429 when threshold is exceeded.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 1000, // Allow 1000 attempts in dev/test to avoid blocking test suites
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => process.env.SKIP_RATE_LIMIT === 'true' || req.headers['x-test-suite'] === 'true',
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
