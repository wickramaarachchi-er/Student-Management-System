/**
 * components/common/ErrorState.jsx
 * Alert box for API or network errors with optional retry trigger.
 */
import Icon from './Icon.jsx';

export default function ErrorState({ title = 'System Error', message = 'Failed to load data. Please try again.', onRetry }) {
  return (
    <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-6 text-slate-200 my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
          <Icon name="close" className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-rose-200">{title}</h3>
          <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-100 border border-rose-700/60 text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5"
        >
          <Icon name="refresh" className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
