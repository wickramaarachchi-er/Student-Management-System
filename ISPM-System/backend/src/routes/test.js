/**
 * routes/test.js
 * ============================================================
 * DEVELOPMENT VERIFICATION ROUTES – RBAC TESTING ONLY
 * Remove or gate behind NODE_ENV checks before production.
 * ============================================================
 *
 * GET /api/test/admin       – SYSTEM_ADMIN only
 * GET /api/test/compliance  – SYSTEM_ADMIN, COMPLIANCE_OFFICER
 * GET /api/test/training    – SYSTEM_ADMIN, TRAINING_ADMIN
 * GET /api/test/employee    – all four authenticated roles
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

// All test routes require authentication
router.use(authenticate);

/**
 * GET /api/test/admin
 * Accessible by: SYSTEM_ADMIN
 */
router.get(
  '/admin',
  authorizeRoles('SYSTEM_ADMIN'),
  (req, res) => {
    sendSuccess(res, {
      message: '[TEST] Admin route accessed successfully',
      data: { role: req.user.role, user: req.user.email },
    });
  }
);

/**
 * GET /api/test/compliance
 * Accessible by: SYSTEM_ADMIN, COMPLIANCE_OFFICER
 */
router.get(
  '/compliance',
  authorizeRoles('SYSTEM_ADMIN', 'COMPLIANCE_OFFICER'),
  (req, res) => {
    sendSuccess(res, {
      message: '[TEST] Compliance route accessed successfully',
      data: { role: req.user.role, user: req.user.email },
    });
  }
);

/**
 * GET /api/test/training
 * Accessible by: SYSTEM_ADMIN, TRAINING_ADMIN
 */
router.get(
  '/training',
  authorizeRoles('SYSTEM_ADMIN', 'TRAINING_ADMIN'),
  (req, res) => {
    sendSuccess(res, {
      message: '[TEST] Training route accessed successfully',
      data: { role: req.user.role, user: req.user.email },
    });
  }
);

/**
 * GET /api/test/employee
 * Accessible by: all authenticated roles
 */
router.get(
  '/employee',
  authorizeRoles('SYSTEM_ADMIN', 'COMPLIANCE_OFFICER', 'TRAINING_ADMIN', 'EMPLOYEE'),
  (req, res) => {
    sendSuccess(res, {
      message: '[TEST] Employee route accessed successfully',
      data: { role: req.user.role, user: req.user.email },
    });
  }
);

export default router;
