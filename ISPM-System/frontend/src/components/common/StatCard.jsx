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
  iconBg = 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  trend,
  trendType = 'neutral', // 'positive' | 'warning' | 'negative' | 'neutral'
  badge,
  onClick,
}) {
  const trendColors = {
    positive: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    warning: 'text-[#fcd34d] bg-[#d97706]/20 border-[#d97706]/40',
    negative: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
    neutral: 'text-slate-300 bg-slate-800/60 border-slate-700/50',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-[#060e22] border border-[#142347] rounded-2xl p-5 sm:p-6 shadow-lg hover:border-[#1e3a75] transition-all flex flex-col justify-between min-h-[145px] ${
        onClick ? 'cursor-pointer hover:bg-[#091533]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs sm:text-sm font-medium text-slate-400 block">{title}</span>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            {value ?? '0'}
          </div>
        </div>
        {icon && (
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon name={icon} className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend || badge) && (
        <div className="mt-5 pt-3.5 border-t border-[#142347] flex items-center justify-between text-xs text-slate-400 gap-2">
          {subtitle && <span className="text-slate-400 font-medium truncate">{subtitle}</span>}
          {badge && (
            <span className="text-[11px] px-2 py-0.5 rounded border font-bold bg-blue-950/60 text-blue-300 border-blue-800/50 shrink-0">
              {badge}
            </span>
          )}
          {trend && (
            <span className={`px-2 py-0.5 rounded border text-[11px] font-bold shrink-0 ${trendColors[trendType] || trendColors.neutral}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


