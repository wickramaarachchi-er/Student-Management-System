/**
 * components/common/PageHeader.jsx
 * Standard page header with title, descriptive subtitle, and optional action buttons.
 */
import Icon from './Icon.jsx';

export default function PageHeader({ title, description, icon, action, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#142347]">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shrink-0 mt-0.5">
            <Icon name={icon} className="w-6 h-6" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight leading-snug">{title}</h1>
          {description && (
            <p className="text-sm text-slate-400 mt-0.5 max-w-3xl leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {(action || children) && (
        <div className="flex items-center gap-3 shrink-0">
          {action}
          {children}
        </div>
      )}
    </div>
  );
}
