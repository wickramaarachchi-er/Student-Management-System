/**
 * routes/index.js
 * Root API router – mounts all sub-routers under /api.
 */
import { Router } from 'express';
import healthRouter from './health.js';
import authRouter   from './auth.js';
import testRouter   from './test.js';

import userRouter   from './user.js';
import policyRouter from './policy.js';

const router = Router();

// Health check – public
router.use('/health', healthRouter);

// Authentication – POST /auth/login (public) + GET /auth/me (protected)
router.use('/auth', authRouter);

// User Management – /api/users (SYSTEM_ADMIN only)
router.use('/users', userRouter);

// Policy Management & Acknowledgements – /api/policies (COMPLIANCE_OFFICER, EMPLOYEE)
router.use('/policies', policyRouter);

// DEVELOPMENT ONLY – RBAC verification routes; remove before production
router.use('/test', testRouter);

export default router;
