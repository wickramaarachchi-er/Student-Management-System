/**
 * pages/UsersPage.jsx
 * Comprehensive User Management page for SYSTEM_ADMIN.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listUsersRequest } from '../services/user.service.js';
import Icon from '../components/common/Icon.jsx';
import StatCard from '../components/common/StatCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import CreateUserModal from '../components/users/CreateUserModal.jsx';
import EditUserModal from '../components/users/EditUserModal.jsx';
import StatusConfirmModal from '../components/users/StatusConfirmModal.jsx';

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight leading-tight">
            User Directory & Access Control
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed mt-1.5">
            Manage university employee identities, access roles, and directory statuses.
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

      {/* Summary Stat Cards */}
      <section aria-label="Directory Overview">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <StatCard
            title="Total Users"
            value={stats.total}
            subtitle={`${stats.active} active in directory`}
            icon="users"
            iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
          />
          <StatCard
            title="Active Users"
            value={stats.active}
            subtitle={`${Math.round((stats.active / (stats.total || 1)) * 100)}% active rate`}
            icon="user-check"
            iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            trend="Healthy"
            trendType="positive"
          />
          <StatCard
            title="Deactivated Accounts"
            value={stats.inactive}
            subtitle="Inactive access status"
            icon="power"
            iconBg="bg-rose-500/10 text-rose-400 border-rose-500/20"
            trend={stats.inactive > 0 ? 'Restricted' : 'None'}
            trendType={stats.inactive > 0 ? 'warning' : 'neutral'}
          />
        </div>
      </section>

      {/* Filter Toolbar */}
      <section aria-label="Search and Filters">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-sm">
          {/* Search */}
          <div className="relative flex-1">
            <Icon
              name="search"
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              id="user-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or department..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                title="Clear search"
              >
                <Icon name="close" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="filter-role" className="text-xs font-medium text-slate-400 whitespace-nowrap">
                Role:
              </label>
              <select
                id="filter-role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">All Roles</option>
                <option value="SYSTEM_ADMIN">System Administrator</option>
                <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
                <option value="TRAINING_ADMIN">Training Administrator</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="filter-status" className="text-xs font-medium text-slate-400 whitespace-nowrap">
                Status:
              </label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              title="Refresh directory"
              className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <Icon name="refresh" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Users Table / Directory */}
      <section aria-label="User Directory List">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-14 text-center">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3.5" />
              <p className="text-sm text-slate-400 font-medium">Retrieving user accounts from directory...</p>
            </div>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/40 text-xs font-semibold text-slate-400">
                    <th className="py-3.5 px-5 sm:px-6">User / Identity</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Assigned Role</th>
                    <th className="py-3.5 px-5 hidden md:table-cell">Department</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                  {users.map((u) => {
                    const isCurrentAdmin = currentAdmin?.id === u.id;

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-800/30 transition-colors group"
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
                              {u.phone && (
                                <div className="text-xs text-slate-400 mt-0.5">{u.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-5 font-mono text-xs text-slate-300">
                          {u.email}
                        </td>

                        {/* Role */}
                        <td className="py-4 px-5">
                          <StatusBadge status={u.role} type="role" />
                        </td>

                        {/* Department */}
                        <td className="py-4 px-5 hidden md:table-cell text-slate-300 font-normal">
                          {u.department || <span className="text-slate-500">—</span>}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingUser(u)}
                              title="Edit user profile"
                              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            >
                              <Icon name="pencil" className="w-4 h-4" />
                            </button>

                            {isCurrentAdmin ? (
                              <span
                                title="Cannot deactivate your own administrator account"
                                className="p-2 rounded-lg text-slate-600 cursor-not-allowed inline-block"
                              >
                                <Icon name="power" className="w-4 h-4" />
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setStatusTargetUser(u)}
                                title={u.isActive ? 'Deactivate account' : 'Activate account'}
                                className={`p-2 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 ${
                                  u.isActive
                                    ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 focus:ring-rose-500/40'
                                    : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 focus:ring-emerald-500/40'
                                }`}
                              >
                                <Icon name="power" className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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

