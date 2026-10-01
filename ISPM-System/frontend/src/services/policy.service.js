/**
 * services/policy.service.js
 * Frontend API client for Information Security Policy Management & Acknowledgements.
 */
import { apiFetch } from './api.js';

/**
 * Lists policies with optional query parameters.
 *
 * @param {object} [params]
 * @param {string} [params.search]
 * @param {string} [params.category]
 * @param {string} [params.status]
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function listPoliciesRequest(params = {}) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.status && params.status !== 'all') query.set('status', params.status);

  const qs = query.toString();
  return apiFetch(`/policies${qs ? `?${qs}` : ''}`);
}

/**
 * Retrieves a single policy with details and versions.
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function getPolicyRequest(id) {
  return apiFetch(`/policies/${id}`);
}

/**
 * Creates a new policy (Compliance Officer only).
 *
 * @param {object} policyData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function createPolicyRequest(policyData) {
  return apiFetch('/policies', {
    method: 'POST',
    body: JSON.stringify(policyData),
  });
}

/**
 * Updates policy metadata (Compliance Officer only).
 *
 * @param {string} id
 * @param {object} policyData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function updatePolicyRequest(id, policyData) {
  return apiFetch(`/policies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(policyData),
  });
}

/**
 * Adds a new version to a policy (Compliance Officer only).
 *
 * @param {string} id
 * @param {object} versionData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function createPolicyVersionRequest(id, versionData) {
  return apiFetch(`/policies/${id}/versions`, {
    method: 'POST',
    body: JSON.stringify(versionData),
  });
}

/**
 * Publishes a specific policy version (Compliance Officer only).
 *
 * @param {string} id
 * @param {string} versionId
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function publishPolicyVersionRequest(id, versionId) {
  return apiFetch(`/policies/${id}/versions/${versionId}/publish`, {
    method: 'PATCH',
  });
}

/**
 * Archives a policy (Compliance Officer only).
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function archivePolicyRequest(id) {
  return apiFetch(`/policies/${id}/archive`, {
    method: 'PATCH',
  });
}

/**
 * Acknowledges the current published version of a policy (Employee only).
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function acknowledgePolicyRequest(id) {
  return apiFetch(`/policies/${id}/acknowledge`, {
    method: 'POST',
  });
}

/**
 * Retrieves the acknowledgement report for a policy (Compliance Officer only).
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function getPolicyAcknowledgementsRequest(id) {
  return apiFetch(`/policies/${id}/acknowledgements`);
}
