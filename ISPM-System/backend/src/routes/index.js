/**
 * routes/index.js
 * Root API router – mounts all sub-routers under /api.
 */
import { Router } from 'express';
import healthRouter from './health.js';

const router = Router();

// Health check
router.use('/health', healthRouter);

// Future module routes will be mounted here, e.g.:
// router.use('/auth',   authRouter);
// router.use('/users',  userRouter);
// router.use('/policies', policyRouter);

export default router;
