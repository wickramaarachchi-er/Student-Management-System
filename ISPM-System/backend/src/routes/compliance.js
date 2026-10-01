/**
 * routes/compliance.js
 * Router for ISPM Compliance Tracking & Reporting endpoints.
 * Mounted at /api/compliance
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import {
  getDashboard,
  getEmployeesList,
  getEmployeeDetails,
  getMyCompliance,
} from '../controllers/compliance.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Compliance Officer Endpoints
router.get('/dashboard', authorizeRoles('COMPLIANCE_OFFICER'), getDashboard);
router.get('/employees', authorizeRoles('COMPLIANCE_OFFICER'), getEmployeesList);
router.get('/employees/:userId', authorizeRoles('COMPLIANCE_OFFICER'), getEmployeeDetails);

// Employee Self-Service Endpoint
router.get('/me', authorizeRoles('EMPLOYEE'), getMyCompliance);

export default router;
