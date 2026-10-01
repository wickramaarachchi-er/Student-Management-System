/**
 * services/compliance.service.js
 * Frontend API client for ISPM Compliance Tracking & Reporting.
 * Uses centralized apiFetch helper for authorization and environment configuration.
 */
import { apiFetch } from './api.js';

/**
 * GET /compliance/dashboard
 * COMPLIANCE_OFFICER only.
 */
export async function getComplianceDashboardRequest() {
  return apiFetch('/compliance/dashboard');
}

/**
 * GET /compliance/employees
 * COMPLIANCE_OFFICER only.
 * @param {object} params - { search, department, status }
 */
export async function getEmployeeComplianceListRequest(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.department && params.department !== 'all') query.append('department', params.department);
  if (params.status && params.status !== 'all') query.append('status', params.status);

  const qs = query.toString();
  return apiFetch(`/compliance/employees${qs ? '?' + qs : ''}`);
}

/**
 * GET /compliance/employees/:userId
 * COMPLIANCE_OFFICER only.
 * @param {string} userId
 */
export async function getEmployeeComplianceDetailsRequest(userId) {
  return apiFetch(`/compliance/employees/${userId}`);
}

/**
 * GET /compliance/me
 * EMPLOYEE only.
 */
export async function getMyComplianceRequest() {
  return apiFetch('/compliance/me');
}
