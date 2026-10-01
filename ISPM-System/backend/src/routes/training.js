/**
 * routes/training.js
 * Training Management and Employee Training Progress routes with strict RBAC.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import {
  getTrainingModules,
  getMyProgress,
  getTrainingModule,
  createTrainingModule,
  updateTrainingModule,
  publishTrainingModule,
  archiveTrainingModule,
  startTraining,
  completeTraining,
  getModuleProgressReport,
} from '../controllers/training.controller.js';

const router = Router();

// All training endpoints require authentication
router.use(authenticate);

// View list of training modules: TRAINING_ADMIN and EMPLOYEE
router.get('/', authorizeRoles('TRAINING_ADMIN', 'EMPLOYEE'), getTrainingModules);

// Personal training progress overview: EMPLOYEE only
router.get('/my-progress', authorizeRoles('EMPLOYEE'), getMyProgress);

// Progress report for a training module: TRAINING_ADMIN only
router.get('/:id/progress', authorizeRoles('TRAINING_ADMIN'), getModuleProgressReport);

// View training module details: TRAINING_ADMIN and EMPLOYEE
router.get('/:id', authorizeRoles('TRAINING_ADMIN', 'EMPLOYEE'), getTrainingModule);

// Management endpoints: TRAINING_ADMIN only
router.post('/', authorizeRoles('TRAINING_ADMIN'), createTrainingModule);
router.patch('/:id', authorizeRoles('TRAINING_ADMIN'), updateTrainingModule);
router.patch('/:id/publish', authorizeRoles('TRAINING_ADMIN'), publishTrainingModule);
router.patch('/:id/archive', authorizeRoles('TRAINING_ADMIN'), archiveTrainingModule);

// Employee training progress actions: EMPLOYEE only
router.post('/:id/start', authorizeRoles('EMPLOYEE'), startTraining);
router.post('/:id/complete', authorizeRoles('EMPLOYEE'), completeTraining);

export default router;
