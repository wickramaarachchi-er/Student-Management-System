/**
 * services/notification.service.js
 * Service for creating and managing in-app notifications.
 */
import prisma from '../config/prisma.js';

/**
 * Creates a single notification record for a recipient.
 */
export async function createNotification({ recipientId, title, message, type = 'SYSTEM', resourceRef = null }) {
  if (!recipientId || !title || !message) return null;

  return prisma.notification.create({
    data: {
      recipientId,
      title: title.trim(),
      message: message.trim(),
      type,
      resourceRef: resourceRef ? String(resourceRef) : null,
      isRead: false,
    },
  });
}

/**
 * Efficiently creates notifications for multiple recipients in bulk.
 */
export async function createBulkNotifications({ recipientIds = [], title, message, type = 'SYSTEM', resourceRef = null }) {
  if (!recipientIds || recipientIds.length === 0 || !title || !message) return { count: 0 };

  // Remove duplicates and nulls
  const uniqueIds = Array.from(new Set(recipientIds.filter(Boolean)));
  if (uniqueIds.length === 0) return { count: 0 };

  const data = uniqueIds.map((id) => ({
    recipientId: id,
    title: title.trim(),
    message: message.trim(),
    type,
    resourceRef: resourceRef ? String(resourceRef) : null,
    isRead: false,
  }));

  return prisma.notification.createMany({
    data,
  });
}

/**
 * Retrieves notifications for a specific user.
 */
export async function getNotificationsByUser(userId, { read, type } = {}) {
  const where = { recipientId: userId };

  if (read === 'true' || read === true) {
    where.isRead = true;
  } else if (read === 'false' || read === false) {
    where.isRead = false;
  }

  if (type) {
    where.type = type;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return notifications;
}

/**
 * Counts unread notifications for a user.
 */
export async function getUnreadCountByUser(userId) {
  const unreadCount = await prisma.notification.count({
    where: {
      recipientId: userId,
      isRead: false,
    },
  });

  return unreadCount;
}

/**
 * Marks a single notification as read.
 * Checks recipient ownership.
 */
export async function markNotificationAsRead(notificationId, userId) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    return { error: 'NOT_FOUND', message: 'Notification not found.' };
  }

  if (notification.recipientId !== userId) {
    return { error: 'FORBIDDEN', message: 'Access denied to this notification.' };
  }

  if (notification.isRead) {
    return { notification }; // Idempotent
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { notification: updated };
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllNotificationsAsRead(userId) {
  const result = await prisma.notification.updateMany({
    where: {
      recipientId: userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { count: result.count };
}

/** Notify active staff without failing an employee action that has already been saved. */
export async function notifyRoleOfEmployeeAction({ role, employeeId, title, message, type = 'SYSTEM', resourceRef }) {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { firstName: true, lastName: true, email: true, role: true },
    });
    if (!employee || employee.role !== 'EMPLOYEE') return { count: 0 };
    const recipients = await prisma.user.findMany({
      where: { role, isActive: true }, select: { id: true },
    });
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.email;
    return await createBulkNotifications({
      recipientIds: recipients.map(user => user.id), title,
      message: name + ' ' + message, type, resourceRef,
    });
  } catch (error) {
    console.error('[notification.service] Failed to notify staff of employee action:', error.message);
    return { count: 0 };
  }
}
