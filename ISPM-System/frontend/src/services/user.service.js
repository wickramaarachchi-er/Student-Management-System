/**
 * services/user.service.js
 * Frontend API client for User Management operations.
 * All calls route through the centralized apiFetch wrapper.
 */
import { apiFetch } from './api.js';

/**
 * Lists users with optional query parameters.
 *
 * @param {object} [params]
 * @param {string} [params.search]
 * @param {string} [params.role]
 * @param {string} [params.status]
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function listUsersRequest(params = {}) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.role) query.set('role', params.role);
  if (params.status && params.status !== 'all') query.set('status', params.status);

  const qs = query.toString();
  return apiFetch(`/users${qs ? `?${qs}` : ''}`);
}

/**
 * Retrieves a single user profile.
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function getUserRequest(id) {
  return apiFetch(`/users/${id}`);
}

/**
 * Creates a new user account.
 *
 * @param {object} userData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function createUserRequest(userData) {
  return apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Updates an existing user's profile details.
 *
 * @param {string} id
 * @param {object} userData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function updateUserRequest(id, userData) {
  return apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
}

/**
 * Activates or deactivates a user account.
 *
 * @param {string} id
 * @param {boolean} isActive
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function updateUserStatusRequest(id, isActive) {
  return apiFetch(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}
