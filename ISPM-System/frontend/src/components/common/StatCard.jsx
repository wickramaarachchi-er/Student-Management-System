/**
 * components/common/StatCard.jsx
 * Reusable enterprise metric card for executive/role dashboards.
 */
import Icon from './Icon.jsx';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  trend,
  trendType = 'neutral', // 'positive' | 'warning' | 'negative' | 'neutral'
  badge,
  onClick,
}) {
  const trendColors = {
    positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    negative: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    neutral: 'text-slate-400 bg-slate-800/60 border-slate-700/50',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between min-h-[135px] ${
        onClick ? 'cursor-pointer hover:bg-slate-900' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-slate-400 block">{title}</span>
          <div className="text-3xl font-extrabold text-white tracking-tight mt-2">
            {value ?? '0'}
          </div>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon name={icon} className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 gap-2">
          {subtitle && <span className="text-slate-400 font-medium truncate">{subtitle}</span>}
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-blue-950/60 text-blue-300 border-blue-800/50 shrink-0">
              {badge}
            </span>
          )}
          {trend && (
            <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold shrink-0 ${trendColors[trendType]}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


