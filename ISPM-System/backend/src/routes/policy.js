/**
 * routes/policy.js
 * Information Security Policy Management routes with strict RBAC.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  createPolicyVersion,
  publishPolicyVersion,
  archivePolicy,
  acknowledgePolicy,
  getPolicyAcknowledgements,
} from '../controllers/policy.controller.js';

const router = Router();

// All policy endpoints require authentication
router.use(authenticate);

// View policies list & single policy: COMPLIANCE_OFFICER and EMPLOYEE
router.get('/', authorizeRoles('COMPLIANCE_OFFICER', 'EMPLOYEE'), getPolicies);
router.get('/:id', authorizeRoles('COMPLIANCE_OFFICER', 'EMPLOYEE'), getPolicy);

// Policy creation, metadata edit, versioning, publishing, archiving: COMPLIANCE_OFFICER only
router.post('/', authorizeRoles('COMPLIANCE_OFFICER'), createPolicy);
router.patch('/:id', authorizeRoles('COMPLIANCE_OFFICER'), updatePolicy);
router.post('/:id/versions', authorizeRoles('COMPLIANCE_OFFICER'), createPolicyVersion);
router.patch('/:id/versions/:versionId/publish', authorizeRoles('COMPLIANCE_OFFICER'), publishPolicyVersion);
router.patch('/:id/archive', authorizeRoles('COMPLIANCE_OFFICER'), archivePolicy);

// Acknowledgements report: COMPLIANCE_OFFICER only
router.get('/:id/acknowledgements', authorizeRoles('COMPLIANCE_OFFICER'), getPolicyAcknowledgements);

// Acknowledge policy: EMPLOYEE only
router.post('/:id/acknowledge', authorizeRoles('EMPLOYEE'), acknowledgePolicy);

export default router;
