/**
 * routes/notification.js
 * Express router for in-app Notifications.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getMyNotifications,
  getUnreadCount,
  handleMarkAsRead,
  handleMarkAllAsRead,
} from '../controllers/notification.controller.js';

const router = Router();

// All notification routes require authentication.
// All four roles (SYSTEM_ADMIN, COMPLIANCE_OFFICER, TRAINING_ADMIN, EMPLOYEE)
// are allowed to manage THEIR OWN notifications.
router.use(authenticate);

/**
 * GET /api/notifications
 * List authenticated user's notifications.
 */
router.get('/', getMyNotifications);

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications for authenticated user.
 */
router.get('/unread-count', getUnreadCount);

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications belonging to authenticated user as read.
 */
router.patch('/read-all', handleMarkAllAsRead);

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification owned by authenticated user as read.
 */
router.patch('/:id/read', handleMarkAsRead);

export default router;
