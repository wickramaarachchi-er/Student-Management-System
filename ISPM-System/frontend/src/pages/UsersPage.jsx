/**
 * pages/UsersPage.jsx
 * Comprehensive User Management page for SYSTEM_ADMIN.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listUsersRequest } from '../services/user.service.js';
import Icon from '../components/common/Icon.jsx';

import StatusBadge from '../components/common/StatusBadge.jsx';
import CreateUserModal from '../components/users/CreateUserModal.jsx';
import EditUserModal from '../components/users/EditUserModal.jsx';
import StatusConfirmModal from '../components/users/StatusConfirmModal.jsx';
import './UsersPage.css';

export default function UsersPage() {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [statusTargetUser, setStatusTargetUser] = useState(null);

  // Fetch users from backend API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listUsersRequest({
        search,
        role: roleFilter,
        status: statusFilter,
      });

      if (res.ok) {
        setUsers(res.data?.data?.users || []);
      } else {
        setError(res.data?.message || 'Failed to load user directory.');
      }
    } catch {
      setError('Unable to connect to server. Please check backend status.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toast auto-clear
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleUserCreated = (newUser) => {
    setSuccessMessage(`User account ${newUser.email} created successfully.`);
    fetchUsers();
  };

  const handleUserUpdated = (updatedUser) => {
    setSuccessMessage(`User account ${updatedUser.email} updated successfully.`);
    fetchUsers();
  };

  const handleStatusChanged = (updatedUser) => {
    const statusText = updatedUser.isActive ? 'activated' : 'deactivated';
    setSuccessMessage(`User account ${updatedUser.email} ${statusText} successfully.`);
    fetchUsers();
  };

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

  return (
    <div className="user-management">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight leading-tight">
            User management
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed mt-1.5">
            Manage your people, their roles, and access to the system.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-sm shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span>Create User</span>
        </button>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/70 text-emerald-200 text-sm flex items-center justify-between shadow-sm animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Icon name="check" className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-200 text-sm flex items-center justify-between shadow-sm animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3">
            <Icon name="close" className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            className="underline font-semibold hover:text-white text-xs cursor-pointer ml-4"
          >
            Retry
          </button>
        </div>
      )}

      <section className="um-summary" aria-label="Directory overview">
        {[
          { title: search || roleFilter || statusFilter !== 'all' ? 'Matching users' : 'Total users', value: stats.total, icon: 'users', tone: 'indigo', caption: 'Employee accounts in this view', tag: 'Directory' },
          { title: 'Active accounts', value: stats.active, icon: 'user-check', tone: 'green', caption: 'Accounts with system access', tag: 'Access enabled' },
          { title: 'Inactive accounts', value: stats.inactive, icon: 'power', tone: 'orange', caption: 'Accounts with access disabled', tag: 'Access paused' },
        ].map(card => (
          <article key={card.title} className={`um-summary-card um-summary-${card.tone}`}>
            <div className="um-summary-top"><span className="um-summary-icon"><Icon name={card.icon} className="w-5 h-5" /></span><span className="um-summary-tag">{card.tag}</span></div>
            <div className="um-summary-value">{loading || error ? '—' : card.value}</div>
            <h2>{card.title}</h2>
            <p>{card.caption}</p>
            <div className="um-summary-accent" />
          </article>
        ))}
      </section>

      <section className="um-filters" aria-label="Search and filters">
        <div className="um-filters-heading"><div><h2>Find the right people</h2><p>Search your directory or narrow the list by role and account status.</p></div><button type="button" className="um-reset" disabled={!search && !roleFilter && statusFilter === 'all'} onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter('all'); }}>Reset filters</button></div>
        <div className="um-filter-controls">
          <div className="um-search-field"><label htmlFor="user-search-input">Search directory</label><div className="um-search-box"><Icon name="search" className="w-4 h-4" /><input id="user-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, or department" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><Icon name="close" className="w-4 h-4" /></button>}</div></div>
          <div className="um-select-field"><label htmlFor="filter-role">Assigned role</label><select id="filter-role" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="">All roles</option><option value="SYSTEM_ADMIN">System Administrator</option><option value="COMPLIANCE_OFFICER">Compliance Officer</option><option value="TRAINING_ADMIN">Training Administrator</option><option value="EMPLOYEE">Employee</option></select></div>
          <div className="um-select-field"><label htmlFor="filter-status">Account status</label><select id="filter-status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <button type="button" className="um-refresh-button" onClick={fetchUsers} disabled={loading} aria-label="Refresh user directory"><Icon name="refresh" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span></button>
        </div>
      </section>
      {/* Users Table / Directory */}
      <section aria-label="User Directory List">
        <div className="um-directory-card">
          <div className="um-directory-heading">
            <div><h2>User directory <span>{loading || error ? '—' : users.length}</span></h2><p>A central view of employee identities and permissions.</p></div>
            {(search || roleFilter || statusFilter !== 'all') && <button type="button" onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter('all'); }}>Clear filters</button>}
          </div>
          {loading ? (
            <div className="p-14 text-center">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3.5" />
              <p className="text-sm text-slate-400 font-medium">Retrieving user accounts from directory...</p>
            </div>
          ) : error ? (
            <div className="p-14 text-center"><h3 className="font-semibold">Directory unavailable</h3><p className="text-sm text-slate-400 mt-2">Try refreshing to load your user accounts.</p></div>
          ) : users.length === 0 ? (
            <div className="p-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Icon name="users" className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">No users found</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                No user accounts match the current filter criteria. Try adjusting the search term or filters.
              </p>
            </div>
          ) : (
            <div className="um-table-scroll" tabIndex={0} aria-label="User directory table">
              <table className="um-directory-table">
                <caption className="sr-only">User accounts, assigned roles, departments, access status, and account actions</caption>
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/40 text-xs font-semibold text-slate-400">
                    <th scope="col" className="py-3.5 px-5 sm:px-6">User</th>

                    <th scope="col" className="py-3.5 px-5">Assigned role</th>
                    <th scope="col" className="py-3.5 px-5">Department</th>
                    <th scope="col" className="py-3.5 px-5">Status</th>
                    <th scope="col" className="py-3.5 px-5 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                  {users.map((u) => {
                    const isCurrentAdmin = currentAdmin?.id === u.id;

                    return (
                      <tr
                        key={u.id}
                        className={isCurrentAdmin ? "um-current-user" : ""}
                      >
                        {/* Name with initials avatar */}
                        <td className="py-4 px-5 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600/15 border border-blue-500/25 text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0 shadow-inner">
                              {u.firstName?.[0] || ''}
                              {u.lastName?.[0] || ''}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                                <span>
                                  {u.firstName} {u.lastName}
                                </span>
                                {isCurrentAdmin && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="um-identity-email">{u.email}</div>
                              {u.phone && (
                                <div className="text-xs text-slate-400 mt-0.5">{u.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-5">
                          <StatusBadge status={u.role} type="role" />
                        </td>

                        {/* Department */}
                        <td className="py-4 px-5 text-slate-300 font-normal">
                          {u.department || <span className="text-slate-500">—</span>}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                          <div className="um-access-caption">{u.isActive ? 'Access enabled' : 'Access paused'}</div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 sm:px-6 text-right">
                          <div className="um-row-actions">
                            <button type="button" className="um-action um-action-edit" onClick={() => setEditingUser(u)} aria-label={`Edit ${u.firstName} ${u.lastName}`}><Icon name="pencil" className="w-3.5 h-3.5" /><span>Edit</span></button>
                            <button type="button" disabled={isCurrentAdmin} className={`um-action ${u.isActive ? 'um-action-deactivate' : 'um-action-activate'}`} onClick={() => setStatusTargetUser(u)} title={isCurrentAdmin ? 'Cannot deactivate your own administrator account' : u.isActive ? 'Deactivate account' : 'Activate account'} aria-label={`${u.isActive ? 'Deactivate' : 'Activate'} ${u.firstName} ${u.lastName}`}><Icon name={isCurrentAdmin ? 'lock' : 'power'} className="w-3.5 h-3.5" /><span>{u.isActive ? 'Deactivate' : 'Activate'}</span></button>
                          </div>                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && users.length > 0 && <div className="um-directory-footer"><span>Showing {users.length} user{users.length === 1 ? '' : 's'}{search || roleFilter || statusFilter !== 'all' ? ' matching your filters' : ' in your directory'}</span><span>Roles determine system permissions</span></div>}
        </div>
      </section>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUserCreated={handleUserCreated}
      />

      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={handleUserUpdated}
      />

      <StatusConfirmModal
        isOpen={!!statusTargetUser}
        user={statusTargetUser}
        onClose={() => setStatusTargetUser(null)}
        onStatusChanged={handleStatusChanged}
      />
    </div>
  );
}
