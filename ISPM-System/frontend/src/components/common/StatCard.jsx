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
      className={`bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700/80 transition-all ${
        onClick ? 'cursor-pointer hover:bg-slate-850' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {icon && (
          <div className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon name={icon} className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-3xl font-extrabold text-slate-100 tracking-tight">{value ?? '0'}</div>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-blue-950/60 text-blue-300 border-blue-800/50">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 font-medium">{subtitle}</span>}
          {trend && (
            <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${trendColors[trendType]}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
