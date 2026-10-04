/**
 * routes/auth.js
 * Authentication routes.
 *
 * POST /api/auth/login  – obtain a JWT
 * GET  /api/auth/me     – get current authenticated user profile
 */
import { Router } from 'express';
import { login, getMe, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginRateLimiter, passwordChangeRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * POST /api/auth/login
 * Public – rate-limited to prevent brute-force attacks.
 */
router.post('/login', loginRateLimiter, login);

/**
 * GET /api/auth/me
 * Protected – requires a valid Bearer token.
 */
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, passwordChangeRateLimiter, changePassword);

export default router;
