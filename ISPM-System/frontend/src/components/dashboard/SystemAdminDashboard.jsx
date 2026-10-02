/**
 * components/dashboard/SystemAdminDashboard.jsx
 * Premium, intuitive executive dashboard for SYSTEM_ADMIN role.
 * Designed for visual clarity, elegance, and immediate comprehension.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import StatusBadge from '../common/StatusBadge.jsx';

/**
 * Format raw technical audit action strings into friendly human-readable labels with semantic badge styles.
 */
const getAuditActionMeta = (action) => {
  if (!action) {
    return { label: 'System Event', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700/60' };
  }

  const map = {
    LOGIN_SUCCESS: { label: 'User Sign In', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    LOGIN_FAILED: { label: 'Failed Sign In', badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    LOGOUT: { label: 'User Sign Out', badgeClass: 'bg-slate-700/40 text-slate-300 border-slate-600/40' },
    USER_CREATED: { label: 'Account Created', badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    USER_UPDATED: { label: 'Account Updated', badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    USER_DELETED: { label: 'Account Deactivated', badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    PASSWORD_RESET: { label: 'Password Reset', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    POLICY_CREATED: { label: 'Policy Drafted', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    POLICY_PUBLISHED: { label: 'Policy Published', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    POLICY_UPDATED: { label: 'Policy Updated', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    POLICY_ACKNOWLEDGED: { label: 'Policy Signed', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    QUIZ_STARTED: { label: 'Quiz Started', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    QUIZ_COMPLETED: { label: 'Quiz Completed', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    TRAINING_STARTED: { label: 'Training Started', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    TRAINING_COMPLETED: { label: 'Training Completed', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    TICKET_CREATED: { label: 'Ticket Opened', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    TICKET_UPDATED: { label: 'Ticket Replied', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    TICKET_RESOLVED: { label: 'Ticket Resolved', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  };

  if (map[action]) return map[action];

  return {
    label: action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700/60',
  };
};

/**
 * Format ticket priority badge.
 */
const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'CRITICAL':
      return { label: 'Critical', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
    case 'HIGH':
      return { label: 'High Priority', bg: 'bg-orange-500/15 text-orange-300 border-orange-500/30' };
    case 'MEDIUM':
      return { label: 'Medium Priority', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    case 'LOW':
    default:
      return { label: 'Standard', bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
  }
};

/**
 * Clean audit description for effortless readability.
 */
const cleanAuditDescription = (desc, action) => {
  if (!desc) return 'Security event recorded';

  if (action === 'QUIZ_STARTED') {
    const emailMatch = desc.match(/by\s+([^\s)]+)/i);
    const email = emailMatch ? emailMatch[1] : '';
    return email ? `Quiz assessment attempt started by ${email}` : 'Quiz assessment started';
  }
  if (action === 'QUIZ_COMPLETED') {
    const emailMatch = desc.match(/by\s+([^\s)]+)/i);
    const email = emailMatch ? emailMatch[1] : '';
    return email ? `Quiz assessment completed by ${email}` : 'Quiz assessment finished';
  }

  return (
    desc
      .replace(/\s*\([^)]*id:[^)]*\)/gi, '')
      .replace(/\s*\(quizId:[^)]*\)/gi, '')
      .replace(/\s*\(policyId:[^)]*\)/gi, '')
      .replace(/\s*\(userId:[^)]*\)/gi, '')
      .replace(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/gi, '')
      .replace(/\bcm[a-z0-9]{20,}\b/gi, '')
      .trim() || desc
  );
};

export default function SystemAdminDashboard({ data }) {
  const { metrics, recentHelpdeskTickets = [], recentSystemActivity = [] } = data || {};
  const {
    totalUsers = 0,
    activeUsers = 0,
    inactiveUsers = 0,
    usersByRole = {},
    openHelpdeskTickets = 0,
    inProgressHelpdeskTickets = 0,
    unresolvedHelpdeskCount = 0,
    unreadNotificationCount = 0,
  } = metrics || {};

  const sysAdminCount = usersByRole.SYSTEM_ADMIN || 0;
  const complianceOfficerCount = usersByRole.COMPLIANCE_OFFICER || 0;
  const trainingAdminCount = usersByRole.TRAINING_ADMIN || 0;
  const employeeCount = usersByRole.EMPLOYEE || 0;

  const totalCalculatedUsers = totalUsers || 1;
  const activeRatePercent = Math.round((activeUsers / totalCalculatedUsers) * 100);

  // Role percentages for distribution
  const sysAdminPct = Math.round((sysAdminCount / totalCalculatedUsers) * 100);
  const compliancePct = Math.round((complianceOfficerCount / totalCalculatedUsers) * 100);
  const trainingPct = Math.round((trainingAdminCount / totalCalculatedUsers) * 100);
  const employeePct = Math.max(0, 100 - sysAdminPct - compliancePct - trainingPct);

  const quickActions = [
    {
      title: 'User Management',
      subtitle: `${totalUsers} registered staff accounts`,
      desc: 'Add new staff, edit departmental assignments, and configure access permissions.',
      path: '/users',
      icon: 'users',
      badge: `${activeUsers} Active`,
      theme: {
        border: 'hover:border-blue-500/50',
        bgGlow: 'group-hover:bg-blue-600/10',
        iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        accent: 'text-blue-400',
      },
    },
    {
      title: 'Support Helpdesk',
      subtitle: unresolvedHelpdeskCount > 0 ? `${unresolvedHelpdeskCount} tickets need attention` : 'All inquiries answered',
      desc: 'Respond to employee inquiries, credential reset requests, and security policy questions.',
      path: '/helpdesk',
      icon: 'helpdesk',
      badge: unresolvedHelpdeskCount > 0 ? 'Pending Action' : 'Clear',
      theme: {
        border: 'hover:border-amber-500/50',
        bgGlow: 'group-hover:bg-amber-600/10',
        iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        accent: 'text-amber-400',
      },
    },
    {
      title: 'Security Audit Logs',
      subtitle: 'Complete event traceability',
      desc: 'Inspect chronological access records, sign-in attempts, and policy modification logs.',
      path: '/audit-logs',
      icon: 'shield-check',
      badge: 'Live Trail',
      theme: {
        border: 'hover:border-emerald-500/50',
        bgGlow: 'group-hover:bg-emerald-600/10',
        iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        accent: 'text-emerald-400',
      },
    },
    {
      title: 'System Notifications',
      subtitle: unreadNotificationCount > 0 ? `${unreadNotificationCount} unread advisories` : 'Inbox up to date',
      desc: 'Review alerts, track publication broadcasts, and check automated security notifications.',
      path: '/notifications',
      icon: 'bell',
      badge: unreadNotificationCount > 0 ? 'New Alerts' : '0 Unread',
      theme: {
        border: 'hover:border-purple-500/50',
        bgGlow: 'group-hover:bg-purple-600/10',
        iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        accent: 'text-purple-400',
      },
    },
  ];

  return (
    <div className="space-y-16">

      {/* ============================================================
          1. Hero Operational Snapshot (Clean & Reassuring)
          ============================================================ */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-blue-950/40 border border-slate-800/80 p-6 sm:p-7 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Soft Ambient Background Light */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>System Infrastructure Online & Secure</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Platform Administration Overview
            </h2>
            <p className="text-sm text-slate-300/80 max-w-2xl font-normal leading-relaxed">
              Live directory synchronization, role-based access governance, and enterprise helpdesk queue are operating normally.
            </p>
          </div>

          {/* Quick Snapshot Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-center">
              <span className="text-[11px] font-medium text-slate-400">Account Health</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5">{activeRatePercent}% Active</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-center">
              <span className="text-[11px] font-medium text-slate-400">Support Inquiries</span>
              <span className={`text-base font-bold mt-0.5 ${unresolvedHelpdeskCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {unresolvedHelpdeskCount} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. 4 Primary Key Performance Indicators (Minimalist & Punchy)
          ============================================================ */}
      <section aria-label="Key Performance Indicators" className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* KPI 1: Total Users */}
          <Link
            to="/users"
            className="group relative p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-blue-500/40 shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Directory Users
                </span>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon name="users" className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
                {totalUsers}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Accounts registered across all departments
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {activeUsers} Active
              </span>
              <span className="text-slate-500 font-medium">
                {inactiveUsers} Inactive
              </span>
            </div>
          </Link>

          {/* KPI 2: Support Queue */}
          <Link
            to="/helpdesk"
            className="group relative p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-500/40 shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Support Queue
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon name="helpdesk" className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3 flex items-baseline gap-2">
                <span>{unresolvedHelpdeskCount}</span>
                <span className="text-xs font-normal text-slate-400">pending</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Open employee inquiries & technical tickets
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{openHelpdeskTickets} Open • {inProgressHelpdeskTickets} In Review</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  unresolvedHelpdeskCount > 0
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {unresolvedHelpdeskCount > 0 ? 'Needs Triage' : 'Inbox Clear'}
              </span>
            </div>
          </Link>

          {/* KPI 3: Security Audit Trail */}
          <Link
            to="/audit-logs"
            className="group relative p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-emerald-500/40 shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Security Audit
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon name="shield-check" className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
                {recentSystemActivity.length}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Recent access & policy events logged
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Traceability Status</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                100% Logged
              </span>
            </div>
          </Link>

          {/* KPI 4: System Advisories */}
          <Link
            to="/notifications"
            className="group relative p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-purple-500/40 shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Alerts & Advisories
                </span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon name="bell" className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3 flex items-baseline gap-2">
                <span>{unreadNotificationCount}</span>
                <span className="text-xs font-normal text-slate-400">unread</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Policy updates, warnings, and messages
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Admin Inbox</span>
              <span className="text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                View inbox →
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* ============================================================
          3. User Roles & Permission Distribution (Visual & Clear)
          ============================================================ */}
      <section aria-label="Role Distribution" className="space-y-5 pt-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-px flex-1 bg-slate-800/60" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">Section 2</span>
          <div className="h-px flex-1 bg-slate-800/60" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              User Access Tiers & Organizational Roles
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clear breakdown of system permissions and directory distribution
            </p>
          </div>
          <Link
            to="/users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Manage All Users in Directory</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Visual Segmentation Bar */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Directory Allocation Overview</span>
            <span className="text-slate-300 font-semibold">{totalUsers} Registered Accounts</span>
          </div>

          <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-800">
            {sysAdminCount > 0 && (
              <div
                style={{ width: `${Math.max(5, sysAdminPct)}%` }}
                className="bg-purple-500 h-full rounded-sm transition-all"
                title={`System Administrators: ${sysAdminCount}`}
              />
            )}
            {complianceOfficerCount > 0 && (
              <div
                style={{ width: `${Math.max(5, compliancePct)}%` }}
                className="bg-emerald-500 h-full rounded-sm transition-all"
                title={`Compliance Officers: ${complianceOfficerCount}`}
              />
            )}
            {trainingAdminCount > 0 && (
              <div
                style={{ width: `${Math.max(5, trainingPct)}%` }}
                className="bg-amber-500 h-full rounded-sm transition-all"
                title={`Training Administrators: ${trainingAdminCount}`}
              />
            )}
            {employeeCount > 0 && (
              <div
                style={{ width: `${Math.max(10, employeePct)}%` }}
                className="bg-blue-500 h-full rounded-sm transition-all"
                title={`Employees: ${employeeCount}`}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              <span>System Admins ({sysAdminCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Compliance Officers ({complianceOfficerCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Training Admins ({trainingAdminCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span>Employees ({employeeCount})</span>
            </div>
          </div>
        </div>

        {/* 4 Elegant Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Role 1: System Admin */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/25 via-slate-900/80 to-slate-900 border border-purple-800/30 hover:border-purple-600/50 shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Infrastructure
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <Icon name="shield" className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white mt-2.5">System Administrators</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Full platform control, user account provisioning, and access permissions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">{sysAdminCount}</span>
              <span className="text-xs text-purple-300/80 font-medium">
                {sysAdminPct}% of directory
              </span>
            </div>
          </div>

          {/* Role 2: Compliance Officer */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/25 via-slate-900/80 to-slate-900 border border-emerald-800/30 hover:border-emerald-600/50 shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Governance
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Icon name="shield-check" className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white mt-2.5">Compliance Officers</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Security policy publishing, version approvals, and organizational compliance tracking.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-900/30 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">{complianceOfficerCount}</span>
              <span className="text-xs text-emerald-300/80 font-medium">
                {compliancePct}% of directory
              </span>
            </div>
          </div>

          {/* Role 3: Training Admin */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/25 via-slate-900/80 to-slate-900 border border-amber-800/30 hover:border-amber-600/50 shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Curriculum
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Icon name="academic-cap" className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white mt-2.5">Training Admins</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Creation of awareness modules, quiz assessments, and employee knowledge scoring.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-900/30 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">{trainingAdminCount}</span>
              <span className="text-xs text-amber-300/80 font-medium">
                {trainingPct}% of directory
              </span>
            </div>
          </div>

          {/* Role 4: Employee */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-950/25 via-slate-900/80 to-slate-900 border border-blue-800/30 hover:border-blue-600/50 shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Workforce
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Icon name="users" className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white mt-2.5">Employees</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Staff across university departments reviewing policies and completing assigned training.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-900/30 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">{employeeCount}</span>
              <span className="text-xs text-blue-300/80 font-medium">
                {employeePct}% of directory
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          4. Operational Live Activity (Support & Audit Split)
          ============================================================ */}
      <section aria-label="Support & Audit Operations" className="pt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-slate-800/60" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">Section 3</span>
          <div className="h-px flex-1 bg-slate-800/60" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">

          {/* Left: Support Helpdesk Triage */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl flex flex-col justify-between backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center">
                    <Icon name="helpdesk" className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Support & Inquiries Queue</h3>
                    <p className="text-xs text-slate-400">Employee technical and security questions</p>
                  </div>
                </div>
                <Link
                  to="/helpdesk"
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  Manage Helpdesk →
                </Link>
              </div>

              {recentHelpdeskTickets.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <Icon name="check" className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">All Tickets Resolved</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    There are no unresolved inquiries in the queue.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentHelpdeskTickets.map((t) => {
                    const priorityMeta = getPriorityBadge(t.priority);
                    return (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityMeta.bg}`}>
                              {priorityMeta.label}
                            </span>
                            <span className="text-xs font-bold text-slate-100 truncate">
                              {t.subject}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span className="font-medium text-slate-300">
                              {t.creator ? `${t.creator.firstName} ${t.creator.lastName || ''}`.trim() : 'User'}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {t.creator?.email || ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          <StatusBadge status={t.status} />
                          <span className="text-[11px] text-slate-500 font-medium">
                            {new Date(t.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{unresolvedHelpdeskCount} ticket(s) currently open or under review</span>
              <Link to="/helpdesk" className="text-blue-400 hover:text-blue-300 font-medium">
                View all tickets →
              </Link>
            </div>
          </div>

          {/* Right: Security Audit Stream */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl flex flex-col justify-between backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center justify-center">
                    <Icon name="shield-check" className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Recent Security Activity</h3>
                    <p className="text-xs text-slate-400">Chronological platform security stream</p>
                  </div>
                </div>
                <Link
                  to="/audit-logs"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  Full Audit Log →
                </Link>
              </div>

              {recentSystemActivity.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Icon name="shield" className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">No Recent Activity</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Security actions will appear here in chronological order.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSystemActivity.map((log) => {
                    const actionMeta = getAuditActionMeta(log.action);
                    return (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${actionMeta.badgeClass}`}
                          >
                            {actionMeta.label}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(log.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-normal">
                          {cleanAuditDescription(log.description, log.action)}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span className="font-mono text-slate-400 truncate max-w-[200px]">
                            {log.userEmail || 'System'}
                          </span>
                          <span>
                            {new Date(log.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Automatic audit trail recording active</span>
              <Link to="/audit-logs" className="text-blue-400 hover:text-blue-300 font-medium">
                Search logs →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          5. Administrative Quick Actions (Clean & Clickable Cards)
          ============================================================ */}
      <section aria-label="Administrative Shortcuts" className="space-y-5 pt-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-px flex-1 bg-slate-800/60" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">Section 4</span>
          <div className="h-px flex-1 bg-slate-800/60" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Administrative Operations</h3>
          <p className="text-sm text-slate-400 mt-1">
            Quickly jump into platform governance, user management, and security triage
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.path}
              className={`p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 ${action.theme.border} shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between group min-h-[175px] relative overflow-hidden`}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 ${action.theme.bgGlow} transition-opacity duration-300 pointer-events-none`} />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-11 h-11 rounded-2xl ${action.theme.iconBg} flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform`}
                  >
                    <Icon name={action.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    {action.badge}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{action.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                <span>Open module</span>
                <span className={`group-hover:translate-x-1.5 transition-transform text-sm ${action.theme.accent}`}>
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          6. Architecture & Platform Specs Footer
          ============================================================ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Icon name="lock" className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-200 block">
              ISPM Enterprise Security Platform
            </span>
            <span className="text-[11px] text-slate-500">
              Role-Based Access Control • Automated Policy Governance • Audit Compliance
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono">
            Branch: Heshani-UI
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active RBAC Guard
          </span>
        </div>
      </div>

    </div>
  );
}
