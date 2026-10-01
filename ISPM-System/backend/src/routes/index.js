/**
 * routes/index.js
 * Root API router – mounts all sub-routers under /api.
 */
import { Router } from 'express';
import healthRouter from './health.js';
import authRouter   from './auth.js';
import testRouter   from './test.js';

const router = Router();

// Health check – public
router.use('/health', healthRouter);

// Authentication – POST /auth/login (public) + GET /auth/me (protected)
router.use('/auth', authRouter);

// DEVELOPMENT ONLY – RBAC verification routes; remove before production
router.use('/test', testRouter);

// Future module routes will be mounted here, e.g.:
// router.use('/users',    userRouter);
// router.use('/policies', policyRouter);

export default router;
