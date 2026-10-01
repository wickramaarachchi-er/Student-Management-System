/**
 * services/training.service.js
 * Frontend API client for Training Management and Employee Training Progress.
 */
import { apiFetch } from './api.js';

/**
 * Lists training modules with optional search and status filters.
 *
 * @param {object} [params]
 * @param {string} [params.search]
 * @param {string} [params.status] - 'all' | 'published' | 'draft'
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function listTrainingRequest(params = {}) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.status && params.status !== 'all') query.set('status', params.status);

  const qs = query.toString();
  return apiFetch(`/training${qs ? `?${qs}` : ''}`);
}

/**
 * Retrieves a single training module with details.
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function getTrainingRequest(id) {
  return apiFetch(`/training/${id}`);
}

/**
 * Creates a new training module (Training Admin only).
 *
 * @param {object} moduleData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function createTrainingRequest(moduleData) {
  return apiFetch('/training', {
    method: 'POST',
    body: JSON.stringify(moduleData),
  });
}

/**
 * Updates training module metadata or content (Training Admin only).
 *
 * @param {string} id
 * @param {object} moduleData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function updateTrainingRequest(id, moduleData) {
  return apiFetch(`/training/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(moduleData),
  });
}

/**
 * Publishes a training module (Training Admin only).
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function publishTrainingRequest(id) {
  return apiFetch(`/training/${id}/publish`, {
    method: 'PATCH',
  });
}

/**
 * Archives/deactivates a training module (Training Admin only).
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function archiveTrainingRequest(id) {
  return apiFetch(`/training/${id}/archive`, {
    method: 'PATCH',
  });
}

/**
 * Starts a training module (Employee only).
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function startTrainingRequest(id) {
  return apiFetch(`/training/${id}/start`, {
    method: 'POST',
  });
}

/**
 * Completes a training module (Employee only).
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function completeTrainingRequest(id) {
  return apiFetch(`/training/${id}/complete`, {
    method: 'POST',
  });
}

/**
 * Retrieves the personal training progress overview (Employee only).
 *
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function getMyProgressRequest() {
  return apiFetch('/training/my-progress');
}

/**
 * Retrieves employee progress report for a module (Training Admin only).
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function getTrainingProgressReportRequest(id) {
  return apiFetch(`/training/${id}/progress`);
}
