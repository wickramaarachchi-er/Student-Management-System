/**
 * pages/PoliciesPage.jsx
 * Policy Management for Compliance Officers & Policy Acknowledgement Portal for Employees.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listPoliciesRequest } from '../services/policy.service.js';

// Modals
import CreatePolicyModal from '../components/policies/CreatePolicyModal.jsx';
import EditPolicyModal from '../components/policies/EditPolicyModal.jsx';
import CreateVersionModal from '../components/policies/CreateVersionModal.jsx';
import PublishVersionModal from '../components/policies/PublishVersionModal.jsx';
import AcknowledgementsModal from '../components/policies/AcknowledgementsModal.jsx';
import ArchivePolicyModal from '../components/policies/ArchivePolicyModal.jsx';
import PolicyDetailModal from '../components/policies/PolicyDetailModal.jsx';
import './PoliciesPage.css';

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
    <div className={`space-y-6 ${isComplianceOfficer ? 'policies-management' : ''}`}>
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
          <div className="policies-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <div className="policies-summary grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="policies-filter p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
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
          <div className="policies-directory rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
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
      {isEmployee && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Employee Compliance Portal
                </span>
                {user?.department && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    Dept: {user.department}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Security Policies & Acknowledgements
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Review corporate security policies and complete required acknowledgements to maintain compliance.
              </p>
            </div>
          </div>

          {/* Compliance Status Alert Banner */}
          {employeeStats.pending > 0 ? (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-amber-300 text-sm">
                    Action Required: {employeeStats.pending} Policy{employeeStats.pending > 1 ? 'ies' : ''} Awaiting Acknowledgement
                  </h3>
                  <p className="text-xs text-amber-400/80 mt-0.5">
                    Please read and acknowledge the latest published versions to comply with university security standards.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shrink-0"
              >
                View Pending ({employeeStats.pending})
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <h3 className="font-bold text-emerald-300 text-sm">
                  All Applicable Policies Acknowledged
                </h3>
                <p className="text-xs text-emerald-400/80 mt-0.5">
                  Great job! You are currently 100% compliant with all published information security policies.
                </p>
              </div>
            </div>
          )}

          {/* Employee KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Applicable Policies</div>
              <div className="text-2xl font-bold text-white mt-1">{employeeStats.total}</div>
              <div className="text-xs text-slate-500 mt-0.5">governing your role / department</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 shadow-sm">
              <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Acknowledged</div>
              <div className="text-2xl font-bold text-emerald-300 mt-1">{employeeStats.acknowledged}</div>
              <div className="text-xs text-emerald-400/80 mt-0.5">{employeeStats.rate}% compliance rate</div>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 shadow-sm">
              <div className="text-xs font-medium text-rose-400 uppercase tracking-wider">Pending Action</div>
              <div className="text-2xl font-bold text-rose-300 mt-1">{employeeStats.pending}</div>
              <div className="text-xs text-rose-400/80 mt-0.5">requires review & signature</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search policies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {POLICY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({policies.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === 'pending'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Pending ({employeeStats.pending})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('acknowledged')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === 'acknowledged'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Acknowledged ({employeeStats.acknowledged})
                </button>
              </div>
            </div>
          </div>

          {/* Policy Cards Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading security policies...</p>
            </div>
          ) : employeeFilteredPolicies.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
              <span className="text-3xl block mb-2">📋</span>
              <h3 className="font-semibold text-white">No policies match your filter</h3>
              <p className="text-xs text-slate-500 mt-1">Try modifying search or category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {employeeFilteredPolicies.map((p) => {
                const isAcked = Boolean(p.acknowledged || p.userAcknowledgement?.acknowledged);
                const ackedAt = p.acknowledgedAt || p.userAcknowledgement?.acknowledgedAt;

                return (
                  <div
                    key={p.id}
                    className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-xl ${
                      isAcked
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-900/90 border-amber-500/30 hover:border-amber-500/50 shadow-amber-500/5'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 pb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {p.category.replace(/_/g, ' ')}
                        </span>

                        {/* Status Badge */}
                        {isAcked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Acknowledged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            Acknowledgement Required
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {p.description || 'Information security policy governing university operations.'}
                      </p>

                      {/* Meta Pills */}
                      <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          v{p.currentVersion?.versionNumber || p.version || '1.0'}
                        </span>
                        {p.targetDepartment ? (
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
                            Dept: {p.targetDepartment}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            All Staff
                          </span>
                        )}
                        {p.publishedAt && (
                          <span className="text-slate-500">
                            Published: {new Date(p.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="pt-5 mt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="text-xs">
                        {isAcked && ackedAt ? (
                          <span className="text-slate-500">
                            Signed: <span className="text-slate-400">{new Date(ackedAt).toLocaleDateString()}</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium">Pending Confirmation</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setDetailPolicyId(p.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          isAcked
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                        }`}
                      >
                        <span>{isAcked ? '📖 Review Policy' : '✍️ Read & Acknowledge'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

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
