/**
 * pages/UsersPage.jsx
 * Comprehensive User Management page for SYSTEM_ADMIN.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listUsersRequest } from '../services/user.service.js';
import { ROLE_LABELS, ROLE_BADGE_STYLES } from '../utils/roles.js';
import Icon from '../components/common/Icon.jsx';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
              System Admin
            </span>
            <span className="text-xs text-slate-400 font-medium">Access Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage employee identities, role permissions, and access status across the organization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30 flex-shrink-0"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Icon name="check" className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-400 hover:text-white p-1"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Icon name="close" className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            className="underline font-semibold hover:text-white text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Directory Accounts</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Icon name="users" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Accounts</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
            <Icon name="user-check" className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Deactivated Accounts</div>
            <div className="text-2xl font-bold text-red-400 mt-1">{stats.inactive}</div>
          </div>
          <div className="p-3 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20">
            <Icon name="power" className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Icon
            name="search"
            className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
          />
          <input
            id="user-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <Icon name="close" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role & Status Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-role" className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Role:
            </label>
            <select
              id="filter-role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="SYSTEM_ADMIN">System Administrator</option>
              <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
              <option value="TRAINING_ADMIN">Training Administrator</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-status" className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Status:
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            title="Refresh list"
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
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
            <p className="text-xs text-slate-400">Loading user directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Icon name="users" className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No users found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No user accounts match the current filter criteria. Try adjusting the search term or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {users.map((u) => {
                  const roleLabel = ROLE_LABELS[u.role] || u.role;
                  const roleBadge = ROLE_BADGE_STYLES[u.role] || 'bg-slate-800 text-slate-300';
                  const isCurrentAdmin = currentAdmin?.id === u.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name with initials avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                            {u.firstName?.[0] || ''}
                            {u.lastName?.[0] || ''}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>
                                {u.firstName} {u.lastName}
                              </span>
                              {isCurrentAdmin && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800 font-normal">
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
                        <span className={`text-[10px] px-2.5 py-1 rounded-md border font-medium whitespace-nowrap ${roleBadge}`}>
                          {roleLabel}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-300">
                        {u.department || <span className="text-slate-500">—</span>}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-400 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            title="Edit user profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Icon name="pencil" className="w-4 h-4" />
                          </button>

                          {/* Status Toggle (Deactivate / Activate) */}
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
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.isActive
                                  ? 'text-slate-400 hover:text-red-400 hover:bg-red-950/30'
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
