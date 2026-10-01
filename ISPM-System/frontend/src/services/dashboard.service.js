/**
 * services/dashboard.service.js
 * Frontend API client service for fetching role-specific dashboard data.
 */
import { apiFetch } from './api.js';

/**
 * Fetches real database dashboard summary for current authenticated user.
 * @returns {Promise<object>}
 */
export async function fetchDashboardSummary() {
  const { ok, status, data } = await apiFetch('/dashboard');
  if (!ok) {
    throw new Error(data?.message || `Failed to retrieve dashboard metrics (${status})`);
  }
  return data.data;
}
