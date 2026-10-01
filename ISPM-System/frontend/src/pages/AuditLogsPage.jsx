/**
 * pages/AuditLogsPage.jsx
 * Read-only Audit Log viewer.
 *
 * Accessible to: SYSTEM_ADMIN, COMPLIANCE_OFFICER
 *
 * Features:
 *  - Server-side pagination (newest first)
 *  - Search across action / description / userEmail / entityType / entityId
 *  - Filters: action (dropdown), entity type (dropdown), dateFrom, dateTo
 *  - Clear Filters button resets to page 1
 *  - Audit action codes are humanised for display; raw codes are preserved in data
 */
import { useState, useEffect, useCallback } from 'react';
import { getAuditLogsRequest, getAuditMetaRequest } from '../services/audit.service.js';
import Icon from '../components/common/Icon.jsx';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert SNAKE_CASE action code to Title Case for display. */
function humaniseAction(action) {
  if (!action) return '—';
  return action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Colour a pill based on action category. */
function actionBadgeClass(action = '') {
  if (action.startsWith('LOGIN'))       return 'bg-blue-50 text-blue-700 border-blue-200';
  if (action.startsWith('USER'))        return 'bg-purple-50 text-purple-700 border-purple-200';
  if (action.startsWith('POLICY'))      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (action.startsWith('TRAINING'))    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (action.startsWith('QUIZ'))        return 'bg-amber-50 text-amber-700 border-amber-200';
  if (action.startsWith('HELPDESK'))    return 'bg-orange-50 text-orange-700 border-orange-200';
  if (action.startsWith('COMPLIANCE'))  return 'bg-teal-50 text-teal-700 border-teal-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

const PAGE_SIZE_OPTIONS = [20, 50, 100];

// ─── Component ──────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  // Data
  const [logs, setLogs]               = useState([]);
  const [pagination, setPagination]   = useState({ page: 1, limit: 20, totalRecords: 0, totalPages: 0 });
  const [metaActions, setMetaActions] = useState([]);
  const [metaTypes, setMetaTypes]     = useState([]);

  // Loading / error
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Filters (committed = sent to server)
  const [search,     setSearch]     = useState('');
  const [action,     setAction]     = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');

  // Pagination controls
  const [page,  setPage]  = useState(1);
  const [limit, setLimit] = useState(20);

  // ─── Fetch filter metadata once ────────────────────────────────────────
  useEffect(() => {
    getAuditMetaRequest().then((res) => {
      if (res.ok && res.data?.success) {
        setMetaActions(res.data.data.actions || []);
        setMetaTypes(res.data.data.entityTypes || []);
      }
    }).catch(() => {});
  }, []);

  // ─── Fetch logs ────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAuditLogsRequest({
        search:     search || undefined,
        action:     action || undefined,
        entityType: entityType || undefined,
        dateFrom:   dateFrom || undefined,
        dateTo:     dateTo || undefined,
        page,
        limit,
      });

      if (res.ok && res.data?.success) {
        setLogs(res.data.data.logs || []);
        setPagination(res.data.data.pagination || {});
      } else {
        setError(res.data?.message || 'Failed to retrieve audit logs.');
      }
    } catch {
      setError('A network error occurred while loading audit logs.');
    } finally {
      setLoading(false);
    }
  }, [search, action, entityType, dateFrom, dateTo, page, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1); // Reset to page 1 whenever any filter changes
  };

  const handleClearFilters = () => {
    setSearch('');
    setAction('');
    setEntityType('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasFilters = search || action || entityType || dateFrom || dateTo;

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
            <Icon name="shield-check" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Security Audit Logs</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tamper-evident record of authentication, policy, training, quiz, and administrative events.
            </p>
          </div>
        </div>
        {pagination.totalRecords > 0 && (
          <div className="flex-shrink-0 text-right">
            <span className="text-2xl font-bold text-slate-800">{pagination.totalRecords.toLocaleString()}</span>
            <p className="text-xs text-slate-500">total events</p>
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">Filters</h2>
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Row 1: search + action + entityType */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon name="search" className="w-4 h-4" />
            </span>
            <input
              id="audit-search"
              type="text"
              placeholder="Search action, email, entity…"
              value={search}
              onChange={handleFilterChange(setSearch)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Action filter */}
          <select
            id="audit-action-filter"
            value={action}
            onChange={handleFilterChange(setAction)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-800"
          >
            <option value="">All Actions</option>
            {metaActions.map((a) => (
              <option key={a} value={a}>{humaniseAction(a)}</option>
            ))}
          </select>

          {/* Entity type filter */}
          <select
            id="audit-entity-filter"
            value={entityType}
            onChange={handleFilterChange(setEntityType)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-800"
          >
            <option value="">All Entity Types</option>
            {metaTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Row 2: dateFrom + dateTo + page size */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-wide">From Date</label>
            <input
              id="audit-date-from"
              type="date"
              value={dateFrom}
              onChange={handleFilterChange(setDateFrom)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-wide">To Date</label>
            <input
              id="audit-date-to"
              type="date"
              value={dateTo}
              onChange={handleFilterChange(setDateTo)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-wide">Rows per page</label>
            <select
              id="audit-page-size"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-800"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">

        {/* Table header row */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">
            {loading ? 'Loading…' : `${pagination.totalRecords?.toLocaleString() || 0} records`}
            {hasFilters && !loading && ' (filtered)'}
          </h2>
          {pagination.totalPages > 0 && (
            <span className="text-xs text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading audit records…</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">{error}</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Icon name="shield-check" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No audit records found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {hasFilters ? 'No records match the current filter criteria.' : 'No audit events have been recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Date / Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide">Actor</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide">Entity</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Date/Time */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3 max-w-[160px]">
                      <span className="text-slate-700 font-medium truncate block" title={log.userEmail || log.userId || '—'}>
                        {log.userEmail || (log.userId ? `ID: ${log.userId.substring(0, 8)}…` : '—')}
                      </span>
                    </td>

                    {/* Action badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${actionBadgeClass(log.action)}`}
                        title={log.action}
                      >
                        {humaniseAction(log.action)}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="px-4 py-3">
                      {log.entityType ? (
                        <div>
                          <span className="text-slate-700 font-medium">{log.entityType}</span>
                          {log.entityId && (
                            <span className="block text-slate-400 font-mono text-[10px] mt-0.5" title={log.entityId}>
                              {log.entityId.substring(0, 12)}…
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3 max-w-xs">
                      <span className="text-slate-600 line-clamp-2 leading-relaxed" title={log.description || ''}>
                        {log.description || '—'}
                      </span>
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono">
                      {log.ipAddress || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination controls ── */}
        {!loading && !error && pagination.totalPages > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              id="audit-prev-page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>

            <span className="text-xs text-slate-500">
              Page <span className="font-bold text-slate-700">{pagination.page}</span> of{' '}
              <span className="font-bold text-slate-700">{pagination.totalPages}</span>
              {' '}({pagination.totalRecords?.toLocaleString()} records)
            </span>

            <button
              id="audit-next-page"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
