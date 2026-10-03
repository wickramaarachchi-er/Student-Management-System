/**
 * pages/PoliciesPage.jsx
 * Policy Management for Compliance Officers & Policy Acknowledgement Portal for Employees.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listPoliciesRequest } from '../services/policy.service.js';
import Icon from '../components/common/Icon.jsx';
import './EmployeePoliciesPage.css';

// Modals
import CreatePolicyModal from '../components/policies/CreatePolicyModal.jsx';
import EditPolicyModal from '../components/policies/EditPolicyModal.jsx';
import CreateVersionModal from '../components/policies/CreateVersionModal.jsx';
import PublishVersionModal from '../components/policies/PublishVersionModal.jsx';
import AcknowledgementsModal from '../components/policies/AcknowledgementsModal.jsx';
import ArchivePolicyModal from '../components/policies/ArchivePolicyModal.jsx';
import PolicyDetailModal from '../components/policies/PolicyDetailModal.jsx';

const POLICY_CATEGORIES = [
  'GENERAL',
  'DATA_PROTECTION',
  'ACCESS_CONTROL',
  'INCIDENT_RESPONSE',
  'ACCEPTABLE_USE',
  'REMOTE_WORK',
  'CRYPTOGRAPHY',
  'PHYSICAL_SECURITY',
  'OTHER',
];

export default function PoliciesPage() {
  const { user } = useAuth();
  const isComplianceOfficer = user?.role === 'COMPLIANCE_OFFICER';
  const isEmployee = user?.role === 'EMPLOYEE';

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // Compliance: DRAFT/PUBLISHED/ARCHIVED. Employee: pending/acknowledged

  // Active Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [versionTargetPolicy, setVersionTargetPolicy] = useState(null);
  const [publishTargetPolicy, setPublishTargetPolicy] = useState(null);
  const [ackTargetPolicy, setAckTargetPolicy] = useState(null);
  const [archiveTargetPolicy, setArchiveTargetPolicy] = useState(null);
  const [detailPolicyId, setDetailPolicyId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (isComplianceOfficer && statusFilter !== 'all') params.status = statusFilter;

      const res = await listPoliciesRequest(params);
      if (res.ok) {
        const raw = res.data?.data;
        const items = Array.isArray(raw?.policies)
          ? raw.policies
          : Array.isArray(raw)
          ? raw
          : [];
        setPolicies(items);
      } else {
        setError(res.data?.message || 'Failed to load policies.');
      }
    } catch {
      setError('Unable to reach server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, isComplianceOfficer]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // Employee-side filtering (handles pending/acknowledged filter on client-side)
  const employeeFilteredPolicies = useMemo(() => {
    if (!Array.isArray(policies)) return [];
    if (!isEmployee) return policies;
    return policies.filter((p) => {
      const acked = Boolean(p.acknowledged || p.userAcknowledgement?.acknowledged);
      if (statusFilter === 'pending') return !acked;
      if (statusFilter === 'acknowledged') return acked;
      return true;
    });
  }, [policies, isEmployee, statusFilter]);

  // Statistics for KPIs
  const complianceStats = useMemo(() => {
    if (!Array.isArray(policies)) return { total: 0, published: 0, drafts: 0, archived: 0 };
    const total = policies.length;
    const published = policies.filter((p) => p.status === 'PUBLISHED').length;
    const drafts = policies.filter((p) => p.status === 'DRAFT').length;
    const archived = policies.filter((p) => p.status === 'ARCHIVED').length;
    return { total, published, drafts, archived };
  }, [policies]);

  const employeeStats = useMemo(() => {
    if (!Array.isArray(policies)) return { total: 0, acknowledged: 0, pending: 0, rate: 100 };
    const total = policies.length;
    const acknowledged = policies.filter((p) => Boolean(p.acknowledged || p.userAcknowledgement?.acknowledged)).length;
    const pending = total - acknowledged;
    const rate = total > 0 ? Math.round((acknowledged / total) * 100) : 100;
    return { total, acknowledged, pending, rate };
  }, [policies]);

  return (
    <div className={isEmployee ? "employee-policies-page" : "space-y-6"}>
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/30 text-rose-200'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* COMPLIANCE OFFICER VIEW                                  */}
      {/* ========================================================= */}
      {isComplianceOfficer && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Compliance Officer Portal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Policy Management
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Author, version, publish, and audit employee compliance for Information Security Policies.
              </p>
            </div>

            <button
              type="button"
              id="add-policy-btn"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <span>+</span>
              <span>Create New Policy</span>
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Policies</div>
              <div className="text-2xl font-bold text-white mt-1">{complianceStats.total}</div>
              <div className="text-xs text-slate-500 mt-0.5">governance library</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 shadow-sm">
              <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Published Active</div>
              <div className="text-2xl font-bold text-emerald-300 mt-1">{complianceStats.published}</div>
              <div className="text-xs text-emerald-400/80 mt-0.5">enforced across staff</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 shadow-sm">
              <div className="text-xs font-medium text-amber-400 uppercase tracking-wider">Draft Versions</div>
              <div className="text-2xl font-bold text-amber-300 mt-1">{complianceStats.drafts}</div>
              <div className="text-xs text-amber-400/80 mt-0.5">pending review / release</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Archived</div>
              <div className="text-2xl font-bold text-slate-400 mt-1">{complianceStats.archived}</div>
              <div className="text-xs text-slate-500 mt-0.5">decommissioned records</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                id="policy-search-input"
                placeholder="Search policy title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                id="policy-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                {POLICY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <select
                id="policy-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Policies Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-medium tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Policy Title</th>
                    <th scope="col" className="px-5 py-3.5">Category</th>
                    <th scope="col" className="px-5 py-3.5">Scope / Dept</th>
                    <th scope="col" className="px-5 py-3.5">Version</th>
                    <th scope="col" className="px-5 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5">Updated</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Loading policies...
                      </td>
                    </tr>
                  ) : policies.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                        No policies found. Click "Create New Policy" to add your first policy.
                      </td>
                    </tr>
                  ) : (
                    policies.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => setDetailPolicyId(p.id)}
                            className="text-white font-medium hover:text-indigo-400 text-left transition-colors"
                          >
                            {p.title}
                          </button>
                          {p.description && (
                            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {p.description}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {p.category.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          {p.targetDepartment ? (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {p.targetDepartment}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">All Departments</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-200">
                          v{p.currentVersion?.versionNumber || p.version || '1.0'}
                        </td>

                        <td className="px-5 py-3.5">
                          {p.status === 'PUBLISHED' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Published
                            </span>
                          ) : p.status === 'ARCHIVED' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-400">
                              Archived
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Draft
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Document */}
                            <button
                              type="button"
                              onClick={() => setDetailPolicyId(p.id)}
                              title="View Policy Document & Versions"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
                            >
                              👁️ View
                            </button>

                            {/* Edit Metadata */}
                            {p.status !== 'ARCHIVED' && (
                              <button
                                type="button"
                                onClick={() => setEditingPolicy(p)}
                                title="Edit Policy Metadata"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
                              >
                                ✏️ Edit
                              </button>
                            )}

                            {/* Add Version */}
                            {p.status !== 'ARCHIVED' && (
                              <button
                                type="button"
                                onClick={() => setVersionTargetPolicy(p)}
                                title="Create New Version"
                                className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 transition-colors text-xs"
                              >
                                ➕ Version
                              </button>
                            )}

                            {/* Publish Version */}
                            {p.status !== 'ARCHIVED' && (
                              <button
                                type="button"
                                onClick={() => setPublishTargetPolicy(p)}
                                title="Publish a Version"
                                className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 transition-colors text-xs"
                              >
                                🚀 Publish
                              </button>
                            )}

                            {/* Acknowledgement Report */}
                            {p.status === 'PUBLISHED' && (
                              <button
                                type="button"
                                onClick={() => setAckTargetPolicy(p)}
                                title="View Employee Acknowledgement Report"
                                className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 transition-colors text-xs"
                              >
                                📊 Report
                              </button>
                            )}

                            {/* Archive */}
                            {p.status !== 'ARCHIVED' && (
                              <button
                                type="button"
                                onClick={() => setArchiveTargetPolicy(p)}
                                title="Archive Policy"
                                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 transition-colors text-xs"
                              >
                                📦 Archive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* EMPLOYEE VIEW                                            */}
      {/* ========================================================= */}
      {isEmployee && <>
        <header className="ep-header"><div><span className="ep-eyebrow">MY WORKSPACE / POLICIES</span><h1>Security policies</h1><p>Read the latest guidance and keep your acknowledgements up to date.</p></div><div className="ep-header-tools">{user?.department && <span className="ep-department"><Icon name="users" className="w-4 h-4" />{user.department}</span>}<button type="button" className="ep-refresh" onClick={fetchPolicies} disabled={loading}><Icon name="refresh" className="w-4 h-4" />{loading ? 'Refreshing...' : 'Refresh'}</button></div></header>

        {!loading && !error && <section className="ep-summary" aria-label="Policy summary for current search and category">
          {[
            { label: 'Applicable policies', value: employeeStats.total, icon: 'book', tone: 'blue', detail: 'Within your search and category' },
            { label: 'Acknowledged', value: employeeStats.acknowledged, icon: 'shield-check', tone: 'green', detail: 'Latest versions confirmed' },
            { label: 'Awaiting review', value: employeeStats.pending, icon: 'clipboard-list', tone: 'amber', detail: 'Read and acknowledge to complete' },
          ].map(stat => <article key={stat.label}><span className={'ep-stat-icon ' + stat.tone}><Icon name={stat.icon} className="w-5 h-5" /></span><h2>{stat.label}</h2><strong>{stat.value}</strong><p>{stat.detail}</p></article>)}
        </section>}

        {!loading && !error && employeeStats.total > 0 && <div className={'ep-notice ' + (employeeStats.pending ? 'pending' : 'complete')}><span className="ep-notice-icon"><Icon name={employeeStats.pending ? 'book' : 'check'} className="w-5 h-5" /></span><div><h2>{employeeStats.pending ? employeeStats.pending + ' ' + (employeeStats.pending === 1 ? 'policy needs' : 'policies need') + ' your acknowledgement' : 'All policies in this view are acknowledged'}</h2><p>{employeeStats.pending ? 'Open each policy, read the document, and confirm your understanding.' : 'Your acknowledgements are up to date for this search and category.'}</p></div>{employeeStats.pending > 0 && <button type="button" onClick={() => setStatusFilter('pending')}>View pending <span aria-hidden="true">&#8594;</span></button>}</div>}

        <section className="ep-library" aria-labelledby="ep-library-title">
          <div className="ep-library-heading"><div><h2 id="ep-library-title">Your policy library</h2><p>Policies relevant to your role and department.</p></div><div className="ep-tabs" role="group" aria-label="Filter by acknowledgement status">{[{ value: 'all', label: 'All', count: employeeStats.total }, { value: 'pending', label: 'Pending', count: employeeStats.pending }, { value: 'acknowledged', label: 'Acknowledged', count: employeeStats.acknowledged }].map(tab => <button key={tab.value} type="button" aria-pressed={statusFilter === tab.value} onClick={() => setStatusFilter(tab.value)}>{tab.label}<span>{loading || error ? '\u2014' : tab.count}</span></button>)}</div></div>
          <div className="ep-toolbar"><div className="ep-search"><Icon name="search" className="w-4 h-4" /><input type="search" aria-label="Search security policies" placeholder="Search policy titles or descriptions..." value={search} onChange={e => setSearch(e.target.value)} /></div><select aria-label="Filter policies by category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="all">All categories</option>{POLICY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.replaceAll('_', ' ')}</option>)}</select>{(search || categoryFilter !== 'all' || statusFilter !== 'all') && <button type="button" className="ep-clear" onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); }}>Clear filters</button>}</div>

          {loading ? <div className="ep-state" role="status"><Icon name="refresh" className="w-6 h-6 animate-spin" /><h3>Loading security policies...</h3></div>
            : error ? <div className="ep-state ep-error" role="alert"><h3>Unable to load policies</h3><p>{error}</p><button type="button" onClick={fetchPolicies}>Try again</button></div>
            : employeeFilteredPolicies.length === 0 ? <div className="ep-state"><Icon name="book" className="w-6 h-6" /><h3>No policies in this view</h3><p>{search || categoryFilter !== 'all' || statusFilter !== 'all' ? 'Try another search or adjust your filters.' : 'Published policies relevant to your role will appear here.'}</p></div>
            : <div className="ep-card-grid">{employeeFilteredPolicies.map(p => {
              const isAcked = Boolean(p.acknowledged || p.userAcknowledgement?.acknowledged);
              const ackedAt = p.acknowledgedAt || p.userAcknowledgement?.acknowledgedAt;
              return <article key={p.id} className={'ep-policy-card ' + (isAcked ? 'acknowledged' : 'pending')}><div className="ep-card-badges"><span className="ep-category">{(p.category || 'GENERAL').replaceAll('_', ' ')}</span><span className={'ep-status ' + (isAcked ? 'acknowledged' : 'pending')}><Icon name={isAcked ? 'check' : 'book'} className="w-3 h-3" />{isAcked ? 'Acknowledged' : 'Review required'}</span></div><div className="ep-card-heading"><span className="ep-document-icon"><Icon name="book" className="w-5 h-5" /></span><h3>{p.title}</h3></div><p className="ep-card-description">{p.description || 'Information security guidance for your workplace.'}</p><div className="ep-card-meta"><span>Version {p.currentVersion?.versionNumber || p.version || '1.0'}</span><span>{p.targetDepartment || 'All staff'}</span>{p.publishedAt && <span>Published {new Date(p.publishedAt).toLocaleDateString()}</span>}</div><div className="ep-card-footer"><span>{isAcked ? ackedAt ? 'Acknowledged ' + new Date(ackedAt).toLocaleDateString() : 'Acknowledgement recorded' : 'Confirmation pending'}</span><button type="button" aria-label={(isAcked ? 'Review ' : 'Read and acknowledge ') + p.title} className={isAcked ? 'ep-secondary' : 'ep-primary'} onClick={() => setDetailPolicyId(p.id)}><Icon name={isAcked ? 'eye' : 'book'} className="w-4 h-4" />{isAcked ? 'Review policy' : 'Read & acknowledge'}</button></div></article>;
            })}</div>}
          {!loading && !error && <div className="ep-library-footer" role="status">Showing {employeeFilteredPolicies.length} {employeeFilteredPolicies.length === 1 ? 'policy' : 'policies'} &middot; Summary reflects your search and category.</div>}
        </section>
      </>}

      {/* ========================================================= */}
      {/* MODAL DIALOGS                                            */}
      {/* ========================================================= */}

      {/* Create Policy Modal */}
      {isCreateOpen && (
        <CreatePolicyModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onPolicyCreated={(newPolicy) => {
            fetchPolicies();
            showToast(`Policy "${newPolicy?.title || 'Policy'}" created successfully as DRAFT.`);
          }}
        />
      )}

      {/* Edit Policy Modal */}
      {editingPolicy && (
        <EditPolicyModal
          isOpen={Boolean(editingPolicy)}
          policy={editingPolicy}
          onClose={() => setEditingPolicy(null)}
          onPolicyUpdated={(updated) => {
            fetchPolicies();
            showToast(`Policy "${updated?.title || 'Policy'}" updated successfully.`);
          }}
        />
      )}

      {/* Create Version Modal */}
      {versionTargetPolicy && (
        <CreateVersionModal
          isOpen={Boolean(versionTargetPolicy)}
          policy={versionTargetPolicy}
          onClose={() => setVersionTargetPolicy(null)}
          onVersionCreated={(newVersion) => {
            fetchPolicies();
            showToast(`Version ${newVersion?.versionNumber || ''} created for "${versionTargetPolicy.title}".`);
          }}
        />
      )}

      {/* Publish Version Modal */}
      {publishTargetPolicy && (
        <PublishVersionModal
          isOpen={Boolean(publishTargetPolicy)}
          policy={publishTargetPolicy}
          onClose={() => setPublishTargetPolicy(null)}
          onVersionPublished={(publishedPolicy) => {
            fetchPolicies();
            showToast(`Policy "${publishedPolicy?.title || publishTargetPolicy.title}" published successfully!`);
          }}
        />
      )}

      {/* Acknowledgements Report Modal */}
      {ackTargetPolicy && (
        <AcknowledgementsModal
          isOpen={Boolean(ackTargetPolicy)}
          policy={ackTargetPolicy}
          onClose={() => setAckTargetPolicy(null)}
        />
      )}

      {/* Archive Policy Confirmation Modal */}
      {archiveTargetPolicy && (
        <ArchivePolicyModal
          isOpen={Boolean(archiveTargetPolicy)}
          policy={archiveTargetPolicy}
          onClose={() => setArchiveTargetPolicy(null)}
          onArchived={(archived) => {
            fetchPolicies();
            showToast(`Policy "${archived.title}" has been archived.`);
          }}
        />
      )}

      {/* Policy Reading & Acknowledgement Modal */}
      {detailPolicyId && (
        <PolicyDetailModal
          isOpen={Boolean(detailPolicyId)}
          policyId={detailPolicyId}
          userRole={user?.role}
          onClose={() => setDetailPolicyId(null)}
          onAcknowledged={() => {
            fetchPolicies();
            showToast('Policy acknowledged successfully! Your compliance record has been saved.');
          }}
        />
      )}
    </div>
  );
}
