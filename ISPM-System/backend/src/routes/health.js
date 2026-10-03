/**
 * routes/health.js
 * Health-check route – GET /api/health
 */
import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Returns a simple status response confirming the API is operational.
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'ISPM API is running',
  });
});

export default router;
