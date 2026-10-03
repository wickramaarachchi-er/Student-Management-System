/**
 * components/common/EmptyState.jsx
 * Standard empty state card for views with no data records.
 */
import Icon from './Icon.jsx';

export default function EmptyState({ title = 'No data found', description = 'There are no records to display at this time.', icon = 'clipboard-list', action }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center flex flex-col items-center justify-center my-4">
      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-md leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
