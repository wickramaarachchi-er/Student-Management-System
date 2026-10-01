/**
 * components/common/LoadingState.jsx
 * Tasteful skeleton and spinner state for loading content sections.
 */
export default function LoadingState({ message = 'Loading security data...', rows = 3 }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-8 flex flex-col items-center justify-center my-4 space-y-4">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-400">{message}</p>
      
      {/* Skeleton placeholders */}
      <div className="w-full max-w-xl space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-800/60 rounded animate-pulse w-full" style={{ opacity: 1 - i * 0.25 }} />
        ))}
      </div>
    </div>
  );
}
