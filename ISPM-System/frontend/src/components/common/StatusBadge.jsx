/**
 * components/common/StatusBadge.jsx
 * Unified status badge renderer for compliance, role, ticket, policy, and training states.
 */
export default function StatusBadge({ status, type = 'general', customLabel, className = '' }) {
  let style = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let label = customLabel || status;

  if (!status) return null;

  const statusKey = String(status).toUpperCase();

  // Roles
  if (type === 'role' || ['SYSTEM_ADMIN', 'COMPLIANCE_OFFICER', 'TRAINING_ADMIN', 'EMPLOYEE'].includes(statusKey)) {
    const roleMap = {
      SYSTEM_ADMIN: { label: 'System Administrator', style: 'bg-purple-950/60 text-purple-300 border-purple-800/50' },
      COMPLIANCE_OFFICER: { label: 'Compliance Officer', style: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' },
      TRAINING_ADMIN: { label: 'Training Administrator', style: 'bg-amber-950/60 text-amber-300 border-amber-800/50' },
      EMPLOYEE: { label: 'Employee', style: 'bg-blue-950/60 text-blue-300 border-blue-800/50' },
    };
    if (roleMap[statusKey]) {
      label = customLabel || roleMap[statusKey].label;
      style = roleMap[statusKey].style;
    }
  }
  // Compliance / Success states
  else if (['COMPLIANT', 'PASSED', 'ACKNOWLEDGED', 'RESOLVED', 'ACTIVE', 'PUBLISHED', 'COMPLETED'].includes(statusKey)) {
    style = 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50';
    if (!customLabel) {
      if (statusKey === 'COMPLIANT') label = 'Fully Compliant';
      else if (statusKey === 'PASSED') label = 'Passed';
      else if (statusKey === 'ACKNOWLEDGED') label = 'Acknowledged';
      else if (statusKey === 'RESOLVED') label = 'Resolved';
      else if (statusKey === 'ACTIVE') label = 'Active';
      else if (statusKey === 'PUBLISHED') label = 'Published';
      else if (statusKey === 'COMPLETED') label = 'Completed';
    }
  }
  // Pending / Progress / Open states
  else if (['PARTIALLY_COMPLIANT', 'IN_PROGRESS', 'OPEN', 'DRAFT', 'PENDING'].includes(statusKey)) {
    if (statusKey === 'IN_PROGRESS') {
      style = 'bg-blue-950/50 text-blue-300 border-blue-800/50';
    } else {
      style = 'bg-amber-950/50 text-amber-300 border-amber-800/50';
    }
    if (!customLabel) {
      if (statusKey === 'PARTIALLY_COMPLIANT') label = 'Partially Compliant';
      else if (statusKey === 'IN_PROGRESS') label = 'In Progress';
      else if (statusKey === 'OPEN') label = 'Open';
      else if (statusKey === 'DRAFT') label = 'Draft';
      else if (statusKey === 'PENDING') label = 'Pending';
    }
  }
  // Failed / Inactive / Non-compliant / Closed
  else if (['NON_COMPLIANT', 'FAILED', 'INACTIVE', 'ARCHIVED', 'CLOSED', 'OVERDUE', 'HIGH', 'CRITICAL'].includes(statusKey)) {
    if (statusKey === 'CLOSED' || statusKey === 'ARCHIVED') {
      style = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
    } else {
      style = 'bg-rose-950/50 text-rose-300 border-rose-800/50';
    }
    if (!customLabel) {
      if (statusKey === 'NON_COMPLIANT') label = 'Non-Compliant';
      else if (statusKey === 'FAILED') label = 'Failed';
      else if (statusKey === 'INACTIVE') label = 'Inactive';
      else if (statusKey === 'ARCHIVED') label = 'Archived';
      else if (statusKey === 'CLOSED') label = 'Closed';
      else if (statusKey === 'OVERDUE') label = 'Overdue';
    }
  }
  // Not started / Action required
  else if (['NOT_STARTED', 'NOT_ACKNOWLEDGED', 'UNASSIGNED'].includes(statusKey)) {
    style = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
    if (!customLabel) {
      if (statusKey === 'NOT_STARTED') label = 'Not Started';
      else if (statusKey === 'NOT_ACKNOWLEDGED') label = 'Action Required';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

