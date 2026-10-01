/**
 * pages/UsersPage.jsx
 * Comprehensive User Management page for SYSTEM_ADMIN.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listUsersRequest } from '../services/user.service.js';
import { ROLE_LABELS } from '../utils/roles.js';
import Icon from '../components/common/Icon.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
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
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="User Directory & Access Control"
        description="Manage employee identities, role permissions, and active directory status across the university."
        icon="users"
        action={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-md shadow-blue-950 shrink-0 cursor-pointer"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        }
      />

      {/* Success Toast */}
      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Icon name="check" className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-400 hover:text-white p-1 rounded-lg"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Icon name="close" className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            className="underline font-bold hover:text-white text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Accounts" value={stats.total} icon="users" />
        <StatCard title="Active Accounts" value={stats.active} icon="user-check" iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
        <StatCard title="Deactivated Accounts" value={stats.inactive} icon="power" iconBg="bg-rose-500/10 text-rose-400 border-rose-500/20" />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Icon
            name="search"
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
          />
          <input
            id="user-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <Icon name="close" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role & Status Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-role" className="text-xs text-slate-400 font-semibold whitespace-nowrap">
              Role:
            </label>
            <select
              id="filter-role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="SYSTEM_ADMIN">System Administrator</option>
              <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
              <option value="TRAINING_ADMIN">Training Administrator</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-status" className="text-xs text-slate-400 font-semibold whitespace-nowrap">
              Status:
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            title="Refresh user list"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
          >
            <Icon name="refresh" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-medium">Retrieving user accounts from directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Icon name="users" className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">No users found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No user accounts match the current filter criteria. Try adjusting the search term or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">User / Identity</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {users.map((u) => {
                  const isCurrentAdmin = currentAdmin?.id === u.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name with initials avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {u.firstName?.[0] || ''}
                            {u.lastName?.[0] || ''}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span>
                                {u.firstName} {u.lastName}
                              </span>
                              {isCurrentAdmin && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800 font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            {u.phone && (
                              <div className="text-[11px] text-slate-400 mt-0.5">{u.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        {u.email}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={u.role} type="role" />
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-300 font-medium">
                        {u.department || <span className="text-slate-500">—</span>}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            title="Edit user profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Icon name="pencil" className="w-4 h-4" />
                          </button>

                          {isCurrentAdmin ? (
                            <span
                              title="Cannot deactivate your own administrator account"
                              className="p-1.5 rounded-lg text-slate-600 cursor-not-allowed inline-block"
                            >
                              <Icon name="power" className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setStatusTargetUser(u)}
                              title={u.isActive ? 'Deactivate account' : 'Activate account'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                u.isActive
                                  ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
                                  : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/30'
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
