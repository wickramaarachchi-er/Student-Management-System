/**
 * components/common/Pagination.jsx
 * Standard pagination control component for tables and log views.
 */
export default function Pagination({ page, totalPages, totalItems, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400">
      <div>
        Showing page <span className="font-semibold text-slate-200">{page}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalPages}</span>
        {totalItems !== undefined && (
          <span>
            {' '}
            (<span className="font-semibold text-slate-200">{totalItems}</span> total records)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
