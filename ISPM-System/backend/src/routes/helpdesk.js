/**
 * routes/helpdesk.js
 * Helpdesk & Security Query management routes.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import {
  getTickets,
  getTicketDetails,
  handleCreateTicket,
  handleAddResponse,
  handleUpdateStatus,
} from '../controllers/helpdesk.controller.js';

const router = Router();

// All helpdesk routes require authentication
router.use(authenticate);

/**
 * GET /api/helpdesk/tickets
 * SYSTEM_ADMIN: views all tickets
 * EMPLOYEE: views own tickets
 */
router.get(
  '/tickets',
  authorizeRoles('SYSTEM_ADMIN', 'EMPLOYEE'),
  getTickets
);

/**
 * GET /api/helpdesk/tickets/:id
 * SYSTEM_ADMIN or ticket owner EMPLOYEE
 */
router.get(
  '/tickets/:id',
  authorizeRoles('SYSTEM_ADMIN', 'EMPLOYEE'),
  getTicketDetails
);

/**
 * POST /api/helpdesk/tickets
 * EMPLOYEE only
 */
router.post(
  '/tickets',
  authorizeRoles('EMPLOYEE'),
  handleCreateTicket
);

/**
 * POST /api/helpdesk/tickets/:id/responses
 * SYSTEM_ADMIN or ticket owner EMPLOYEE
 */
router.post(
  '/tickets/:id/responses',
  authorizeRoles('SYSTEM_ADMIN', 'EMPLOYEE'),
  handleAddResponse
);

/**
 * PATCH /api/helpdesk/tickets/:id/status
 * SYSTEM_ADMIN only
 */
router.patch(
  '/tickets/:id/status',
  authorizeRoles('SYSTEM_ADMIN'),
  handleUpdateStatus
);

export default router;
