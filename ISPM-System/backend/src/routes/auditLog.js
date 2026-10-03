/**
 * routes/auditLog.js
 * READ-ONLY audit log routes.
 *
 * Allowed roles: SYSTEM_ADMIN, COMPLIANCE_OFFICER
 *
 * IMPORTANT: No POST / PATCH / DELETE routes are defined.
 *            Audit records are immutable from the API layer.
 */
import { Router } from 'express';
import { authenticate }    from '../middleware/authenticate.js';
import { authorizeRoles }  from '../middleware/authorize.js';
import { listAuditLogs, getAuditMeta } from '../controllers/auditLog.controller.js';

const router = Router();

// All routes require authentication + RBAC
router.use(authenticate);
router.use(authorizeRoles('SYSTEM_ADMIN', 'COMPLIANCE_OFFICER'));

/**
 * GET /api/audit-logs/meta
 * Returns distinct action codes and entity types for filter dropdowns.
 * Must be defined BEFORE /:id style routes (none here, but good practice).
 */
router.get('/meta', getAuditMeta);

/**
 * GET /api/audit-logs
 * Paginated, filterable list of audit log records – newest first.
 */
router.get('/', listAuditLogs);

export default router;
