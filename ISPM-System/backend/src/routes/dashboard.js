/**
 * routes/dashboard.js
 * Express router for role-based dashboard metrics.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';

const router = Router();

// All dashboard operations require authentication
router.use(authenticate);

/**
 * GET /api/dashboard
 * Returns data customized for authenticated user's role.
 */
router.get('/', getDashboardSummary);

export default router;
