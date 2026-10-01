/**
 * routes/user.js
 * User Management routes – accessible exclusively by SYSTEM_ADMIN.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
} from '../controllers/user.controller.js';

const router = Router();

// Enforce authentication & SYSTEM_ADMIN role on all user management routes
router.use(authenticate, authorizeRoles('SYSTEM_ADMIN'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.patch('/:id/status', updateUserStatus);

export default router;
