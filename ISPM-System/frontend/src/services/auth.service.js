/**
 * services/auth.service.js
 * Thin wrappers around the authentication API endpoints.
 */
import { apiFetch } from './api.js';

/**
 * POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function loginRequest(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * GET /api/auth/me
 * Requires a stored Bearer token (injected by apiFetch automatically).
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function getMeRequest() {
  return apiFetch('/auth/me');
}

export async function changePasswordRequest(currentPassword, newPassword, confirmPassword) {
  return apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
}
