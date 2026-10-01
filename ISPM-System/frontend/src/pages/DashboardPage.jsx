/**
 * pages/DashboardPage.jsx
 * Role-aware home dashboard displaying customized welcome information and metrics.
 */
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_LABELS, ROLE_BADGE_STYLES } from '../utils/roles.js';
import Icon from '../components/common/Icon.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role;
  const roleLabel = (role && ROLE_LABELS[role]) || role || 'User';
  const roleBadge = (role && ROLE_BADGE_STYLES[role]) || 'bg-slate-800 text-slate-300';

  // Role-specific overview configuration
  const getRoleContent = () => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return {
          title: 'System Administration & Security Operations',
          description:
            'Central authority for user directory access, role permissions, infrastructure audit logs, and technical operations.',
          statCards: [
            { label: 'Active Users', value: '4 Seeded', detail: 'RBAC active across 4 roles', icon: 'users', color: 'purple' },
            { label: 'Audit Events', value: 'Active', detail: 'Real-time security action logging', icon: 'shield-check', color: 'blue' },
            { label: 'Helpdesk Queue', value: 'Ready', detail: 'Employee assistance dispatch', icon: 'helpdesk', color: 'emerald' },
            { label: 'System Status', value: '100% OK', detail: 'Port 5001 Express API connected', icon: 'dashboard', color: 'teal' },
          ],
          modules: [
            { name: 'User Management', desc: 'Create, update, and manage employee accounts and role assignments.', path: '/users' },
            { name: 'Audit Logs', desc: 'Inspect authentication attempts, policy revisions, and administrative actions.', path: '/audit-logs' },
            { name: 'Helpdesk', desc: 'Review and triage technical and security policy inquiries submitted by staff.', path: '/helpdesk' },
            { name: 'Notifications', desc: 'Broadcast security advisories, policy updates, and compliance reminders.', path: '/notifications' },
          ],
        };
      case 'COMPLIANCE_OFFICER':
        return {
          title: 'Information Security Compliance & Policy Oversight',
          description:
            'Monitor organization-wide policy acknowledgements, track regulatory compliance, and prepare audit-ready reporting.',
          statCards: [
            { label: 'Published Policies', value: 'Phase 2', detail: 'Policy authoring & versioning', icon: 'book', color: 'emerald' },
            { label: 'Org Compliance', value: 'Tracking', detail: 'Department adherence analytics', icon: 'award', color: 'blue' },
            { label: 'Compliance Reports', value: 'Scheduled', detail: 'ISO 27001 / NIST gap audits', icon: 'chart', color: 'purple' },
            { label: 'Audit Trail', value: 'Continuous', detail: 'Verifiable acknowledgement records', icon: 'shield-check', color: 'teal' },
          ],
          modules: [
            { name: 'Policy Management', desc: 'Draft, publish, and maintain security policies with revision control.', path: '/policies' },
            { name: 'Compliance Tracking', desc: 'Inspect department compliance percentages and outstanding acknowledgements.', path: '/compliance' },
            { name: 'Compliance Reports', desc: 'Export executive-ready summaries and regulatory audit documentation.', path: '/reports' },
            { name: 'Audit Logs', desc: 'Verify timestamped policy acknowledgement signatures and compliance records.', path: '/audit-logs' },
          ],
        };
      case 'TRAINING_ADMIN':
        return {
          title: 'Cyber Awareness Training & Assessment Hub',
          description:
            'Design and deploy interactive security training modules, craft phishing awareness quizzes, and track completion.',
          statCards: [
            { label: 'Active Courses', value: 'Phase 2', detail: 'Interactive training modules', icon: 'academic-cap', color: 'amber' },
            { label: 'Awareness Quizzes', value: 'Phase 2', detail: 'Knowledge checks & scoring', icon: 'clipboard-list', color: 'blue' },
            { label: 'Completion Rate', value: 'Tracking', detail: 'Enterprise learning milestones', icon: 'trending-up', color: 'emerald' },
            { label: 'Learner Alerts', value: 'Active', detail: 'Automatic deadline reminders', icon: 'bell', color: 'purple' },
          ],
          modules: [
            { name: 'Training Modules', desc: 'Curate cybersecurity awareness modules, videos, and guides.', path: '/training' },
            { name: 'Quiz Builder', desc: 'Build assessment questions to validate understanding of security best practices.', path: '/quizzes' },
            { name: 'Training Progress', desc: 'Monitor employee completion statuses across departments.', path: '/training-progress' },
            { name: 'Notifications', desc: 'Dispatch alerts for upcoming training deadlines and recertifications.', path: '/notifications' },
          ],
        };
      case 'EMPLOYEE':
      default:
        return {
          title: 'My Security Awareness & Policy Portal',
          description:
            'Review mandatory corporate information security policies, complete your assigned awareness courses, and test your knowledge.',
          statCards: [
            { label: 'Required Policies', value: 'Pending', detail: 'Mandatory annual reading', icon: 'book', color: 'blue' },
            { label: 'My Training', value: 'Assigned', detail: 'Security awareness courses', icon: 'academic-cap', color: 'emerald' },
            { label: 'Awareness Quizzes', value: 'Upcoming', detail: 'Cyber hygiene assessment', icon: 'clipboard-list', color: 'purple' },
            { label: 'Security Helpdesk', value: 'Available', detail: 'Report suspicious emails or ask questions', icon: 'helpdesk', color: 'amber' },
          ],
          modules: [
            { name: 'Security Policies', desc: 'Read and acknowledge company information security policies.', path: '/policies' },
            { name: 'Awareness Training', desc: 'Complete interactive cyber awareness training modules.', path: '/training' },
            { name: 'Knowledge Quizzes', desc: 'Test your understanding of passwords, phishing, and data handling.', path: '/quizzes' },
            { name: 'My Progress', desc: 'View your completed certifications, quiz scores, and acknowledgements.', path: '/my-progress' },
          ],
        };
    }
  };

  const content = getRoleContent();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${roleBadge}`}>
                {roleLabel}
              </span>
              <span className="text-xs text-slate-400 font-medium">Session Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* User Profile Pill Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex-shrink-0 text-sm space-y-2 md:w-64">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Details</div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-500">Email:</span> <span className="font-mono text-slate-200">{user?.email}</span>
            </div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-500">Dept:</span> <span className="text-slate-200">{user?.department || 'General'}</span>
            </div>
            {user?.phone && (
              <div className="text-xs text-slate-300">
                <span className="text-slate-500">Phone:</span> <span className="text-slate-200">{user.phone}</span>
              </div>
            )}
            <div className="text-xs text-slate-300 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-emerald-400 font-medium">Authentication Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {content.statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <div className="p-2 rounded-lg bg-slate-800 text-blue-400 border border-slate-700/60">
                <Icon name={card.icon} className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
            <div className="text-xs text-slate-400">{card.detail}</div>
          </div>
        ))}
      </div>

      {/* Role Modules Section (Phase 2 Preview) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Your Role Modules</h2>
            <p className="text-xs text-slate-400">Core functionality available according to your assigned permissions</p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
            RBAC Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.modules.map((mod, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between hover:border-blue-900/60 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-semibold text-white">{mod.name}</h3>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60">
                    Phase 2 Module
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{mod.desc}</p>
              </div>
              <div className="mt-3 pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                <span>Route: {mod.path}</span>
                <span className="text-blue-400">Ready in next step →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
