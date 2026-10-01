/**
 * routes/auth.js
 * Authentication routes.
 *
 * POST /api/auth/login  – obtain a JWT
 * GET  /api/auth/me     – get current authenticated user profile
 */
import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

/**
 * POST /api/auth/login
 * Public – no authentication required.
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Protected – requires a valid Bearer token.
 */
router.get('/me', authenticate, getMe);

export default router;
