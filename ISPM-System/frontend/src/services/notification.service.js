/**
 * services/notification.service.js
 * Frontend service layer for in-app Notifications endpoints.
 */
import { apiFetch } from './api.js';

/**
 * Fetch authenticated user's notifications list with optional read and type filters.
 */
export async function getNotificationsRequest(params = {}) {
  const query = new URLSearchParams();
  if (params.read !== undefined && params.read !== '') query.append('read', params.read);
  if (params.type) query.append('type', params.type);

  const queryString = query.toString();
  const path = `/notifications${queryString ? `?${queryString}` : ''}`;
  return apiFetch(path, { method: 'GET' });
}

/**
 * Fetch unread notification count for the authenticated user.
 */
export async function getUnreadCountRequest() {
  return apiFetch('/notifications/unread-count', { method: 'GET' });
}

/**
 * Mark a single notification as read.
 */
export async function markAsReadRequest(id) {
  return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

/**
 * Mark all notifications for the authenticated user as read.
 */
export async function markAllAsReadRequest() {
  return apiFetch('/notifications/read-all', { method: 'PATCH' });
}
