/**
 * utils/roles.js
 * Role display names, badge colors, and navigation configuration.
 */

export const ROLE_LABELS = {
  SYSTEM_ADMIN: 'System Administrator',
  COMPLIANCE_OFFICER: 'Compliance Officer',
  TRAINING_ADMIN: 'Training Administrator',
  EMPLOYEE: 'Employee',
};

export const ROLE_BADGE_STYLES = {
  SYSTEM_ADMIN: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
  COMPLIANCE_OFFICER: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  TRAINING_ADMIN: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  EMPLOYEE: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
};

/**
 * Navigation menus for each role.
 * Only 'Dashboard' is fully functional in this phase.
 * Other modules are routed to /coming-soon or their respective paths with a Coming Soon placeholder.
 */
export const ROLE_NAV_ITEMS = {
  SYSTEM_ADMIN: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'User Management', path: '/users', icon: 'users' },
    { label: 'Helpdesk', path: '/helpdesk', icon: 'helpdesk' },
    { label: 'Notifications', path: '/notifications', icon: 'bell' },
    { label: 'Audit Logs', path: '/audit-logs', icon: 'shield-check' },
  ],
  COMPLIANCE_OFFICER: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Policies', path: '/policies', icon: 'book' },
    { label: 'Compliance', path: '/compliance', icon: 'award' },
    { label: 'Reports', path: '/reports', icon: 'chart' },
    { label: 'Audit Logs', path: '/audit-logs', icon: 'shield-check' },
    { label: 'Notifications', path: '/notifications', icon: 'bell' },
  ],
  TRAINING_ADMIN: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Training', path: '/training', icon: 'academic-cap' },
    { label: 'Quizzes', path: '/quizzes', icon: 'clipboard-list' },
    { label: 'Training Progress', path: '/training-progress', icon: 'trending-up' },
    { label: 'Notifications', path: '/notifications', icon: 'bell' },
  ],
  EMPLOYEE: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Policies', path: '/policies', icon: 'book' },
    { label: 'Training', path: '/training', icon: 'academic-cap' },
    { label: 'Quizzes', path: '/quizzes', icon: 'clipboard-list' },
    { label: 'My Progress', path: '/my-progress', icon: 'user-check' },
    { label: 'Helpdesk', path: '/helpdesk', icon: 'helpdesk' },
    { label: 'Notifications', path: '/notifications', icon: 'bell' },
  ],
};
