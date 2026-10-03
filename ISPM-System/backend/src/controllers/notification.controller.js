/**
 * controllers/notification.controller.js
 * Express controllers for in-app Notifications endpoints.
 */
import {
  getNotificationsByUser,
  getUnreadCountByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notification.service.js';

/**
 * GET /api/notifications
 * All authenticated users – returns ONLY own notifications.
 */
export async function getMyNotifications(req, res) {
  try {
    const { read, type } = req.query;

    const notifications = await getNotificationsByUser(req.user.id, { read, type });

    return res.status(200).json({
      success: true,
      data: { notifications },
    });
  } catch (err) {
    console.error('[notification.controller] Error fetching notifications:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.',
    });
  }
}

/**
 * GET /api/notifications/unread-count
 * Returns unread notification count for the authenticated user.
 */
export async function getUnreadCount(req, res) {
  try {
    const unreadCount = await getUnreadCountByUser(req.user.id);

    return res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (err) {
    console.error('[notification.controller] Error fetching unread count:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve unread notification count.',
    });
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read (must be owned by authenticated user).
 */
export async function handleMarkAsRead(req, res) {
  try {
    const { id } = req.params;

    const result = await markNotificationAsRead(id, req.user.id);

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: result.message });
    }
    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { notification: result.notification },
    });
  } catch (err) {
    console.error('[notification.controller] Error marking notification read:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification status.',
    });
  }
}

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications for the authenticated user as read.
 */
export async function handleMarkAllAsRead(req, res) {
  try {
    const result = await markAllNotificationsAsRead(req.user.id);

    return res.status(200).json({
      success: true,
      message: `${result.count} notification(s) marked as read.`,
      data: { count: result.count },
    });
  } catch (err) {
    console.error('[notification.controller] Error marking all notifications read:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read.',
    });
  }
}
