/**
 * pages/AuditLogsPage.jsx
 * Professional security audit log viewer with filtering and pagination.
 * Accessible to: SYSTEM_ADMIN, COMPLIANCE_OFFICER
 */
import { useState, useEffect, useCallback } from 'react';
import { getAuditLogsRequest, getAuditMetaRequest } from '../services/audit.service.js';
import Icon from '../components/common/Icon.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pagination from '../components/common/Pagination.jsx';

function humaniseAction(action) {
  if (!action) return '—';
  return action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function actionBadgeClass(action = '') {
  if (action.startsWith('LOGIN'))       return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
  if (action.startsWith('USER'))        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
  if (action.startsWith('POLICY'))      return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
  if (action.startsWith('TRAINING'))    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
  if (action.startsWith('QUIZ'))        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
  if (action.startsWith('HELPDESK'))    return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
  if (action.startsWith('COMPLIANCE'))  return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
  return 'bg-slate-800/60 text-slate-300 border-slate-700/50';
}

const PAGE_SIZE_OPTIONS = [20, 50, 100];
const INPUT_CLASS = 'w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30';

export default function AuditLogsPage() {
  const [logs, setLogs]               = useState([]);
  const [pagination, setPagination]   = useState({ page: 1, limit: 20, totalRecords: 0, totalPages: 0 });
  const [metaActions, setMetaActions] = useState([]);
  const [metaTypes, setMetaTypes]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [action, setAction]           = useState('');
  const [entityType, setEntityType]   = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [page, setPage]               = useState(1);
  const [limit, setLimit]             = useState(20);

  useEffect(() => {
    getAuditMetaRequest().then((res) => {
      if (res.ok && res.data?.success) {
        setMetaActions(res.data.data.actions || []);
        setMetaTypes(res.data.data.entityTypes || []);
      }
    }).catch(() => {});
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (search)     params.search = search;
      if (action)     params.action = action;
      if (entityType) params.entityType = entityType;
      if (dateFrom)   params.dateFrom = dateFrom;
      if (dateTo)     params.dateTo = dateTo;

      const res = await getAuditLogsRequest(params);
      if (res.ok && res.data?.success) {
        const d = res.data.data;
        setLogs(d.logs || []);
        setPagination(d.pagination || { page: 1, limit, totalRecords: 0, totalPages: 0 });
      } else {
        setError(res.data?.message || 'Failed to retrieve audit records.');
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

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch(''); setAction(''); setEntityType(''); setDateFrom(''); setDateTo('');
    setPage(1);
  };

  const hasFilters = search || action || entityType || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Audit Logs"
        description="Tamper-evident chronological record of authentication, policy, training, quiz, and administrative events."
        icon="shield-check"
        action={
          pagination.totalRecords > 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right shrink-0">
              <div className="text-xl font-extrabold text-slate-100">{pagination.totalRecords.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 font-medium">total events</div>
            </div>
          ) : null
        }
      />

      {/* Filters Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Filter Events</h2>
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="audit-search"
              type="text"
              placeholder="Search action, email, entity…"
              value={search}
              onChange={handleFilterChange(setSearch)}
              className={INPUT_CLASS + ' pl-9'}
            />
          </div>

          <select id="audit-action-filter" value={action} onChange={handleFilterChange(setAction)} className={INPUT_CLASS}>
            <option value="">All Actions</option>
            {metaActions.map((a) => (
              <option key={a} value={a}>{humaniseAction(a)}</option>
            ))}
          </select>

          <select id="audit-entity-filter" value={entityType} onChange={handleFilterChange(setEntityType)} className={INPUT_CLASS}>
            <option value="">All Entity Types</option>
            {metaTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1 uppercase tracking-wide">From Date</label>
            <input id="audit-date-from" type="date" value={dateFrom} onChange={handleFilterChange(setDateFrom)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1 uppercase tracking-wide">To Date</label>
            <input id="audit-date-to" type="date" value={dateTo} onChange={handleFilterChange(setDateTo)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1 uppercase tracking-wide">Rows per Page</label>
            <select
              id="audit-page-size"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className={INPUT_CLASS}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {loading ? 'Loading…' : `${pagination.totalRecords?.toLocaleString() || 0} records${hasFilters ? ' (filtered)' : ''}`}
          </h2>
          {pagination.totalPages > 0 && (
            <span className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-6"><LoadingState message="Retrieving security audit records…" /></div>
        ) : error ? (
          <div className="p-6"><ErrorState message={error} onRetry={fetchLogs} /></div>
        ) : logs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No audit records found"
              description={hasFilters ? 'No records match the current filter criteria. Clear filters to see all events.' : 'No audit events have been recorded yet.'}
              icon="shield-check"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3.5 text-left whitespace-nowrap">Date / Time</th>
                  <th className="px-4 py-3.5 text-left">Actor</th>
                  <th className="px-4 py-3.5 text-left">Action</th>
                  <th className="px-4 py-3.5 text-left">Entity</th>
                  <th className="px-4 py-3.5 text-left">Description</th>
                  <th className="px-4 py-3.5 text-left whitespace-nowrap">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <span className="text-slate-200 font-medium truncate block font-mono text-[11px]" title={log.userEmail || ''}>
                        {log.userEmail || (log.userId ? `${log.userId.substring(0, 10)}…` : '—')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${actionBadgeClass(log.action)}`}
                        title={log.action}
                      >
                        {humaniseAction(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.entityType ? (
                        <div>
                          <span className="text-slate-200 font-semibold">{log.entityType}</span>
                          {log.entityId && (
                            <span className="block text-slate-500 font-mono text-[10px] mt-0.5" title={log.entityId}>
                              {log.entityId.substring(0, 14)}…
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="text-slate-300 line-clamp-2 leading-relaxed" title={log.description || ''}>
                        {log.description || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {log.ipAddress || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && pagination.totalPages > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalRecords}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
