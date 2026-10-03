/**
 * services/audit.service.js
 * Frontend service for the read-only Audit Log API.
 *
 * Covers:
 *  - getAuditLogsRequest  – paginated + filtered list
 *  - getAuditMetaRequest  – distinct actions / entityTypes for dropdowns
 *
 * All calls go through the centralized apiFetch helper.
 * No create / update / delete functions are provided – audit logs are immutable.
 */
import { apiFetch } from './api.js';

/**
 * GET /api/audit-logs
 *
 * @param {object} [params]
 * @param {string}  [params.search]
 * @param {string}  [params.action]
 * @param {string}  [params.entityType]
 * @param {string}  [params.userEmail]
 * @param {string}  [params.dateFrom]   – ISO date string
 * @param {string}  [params.dateTo]     – ISO date string
 * @param {number}  [params.page]
 * @param {number}  [params.limit]
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export function getAuditLogsRequest(params = {}) {
  const query = new URLSearchParams();

  if (params.search)     query.set('search',     params.search);
  if (params.action)     query.set('action',     params.action);
  if (params.entityType) query.set('entityType', params.entityType);
  if (params.userEmail)  query.set('userEmail',  params.userEmail);
  if (params.dateFrom)   query.set('dateFrom',   params.dateFrom);
  if (params.dateTo)     query.set('dateTo',     params.dateTo);
  if (params.page)       query.set('page',       String(params.page));
  if (params.limit)      query.set('limit',      String(params.limit));

  const qs = query.toString();
  return apiFetch(`/audit-logs${qs ? `?${qs}` : ''}`);
}

/**
 * GET /api/audit-logs/meta
 * Returns distinct action codes and entity types for filter dropdowns.
 *
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export function getAuditMetaRequest() {
  return apiFetch('/audit-logs/meta');
}
