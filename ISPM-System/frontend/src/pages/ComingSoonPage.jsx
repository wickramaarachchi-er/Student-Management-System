/**
 * pages/ComingSoonPage.jsx
 * Clean placeholder page for future system modules.
 * Informs the user which module this is and that it will be implemented in the next phase.
 */
import { Link } from 'react-router-dom';
import Icon from '../components/common/Icon.jsx';

export default function ComingSoonPage({ title, description, icon = 'shield-check' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto mb-5 flex items-center justify-center">
        <Icon name={icon} className="w-8 h-8 text-blue-400" />
      </div>

      <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 mb-3">
        Phase 2 Module
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">{title || 'Module Coming Soon'}</h1>
      <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
        {description ||
          'This functional module will be implemented in the upcoming development phase in accordance with the system specification.'}
      </p>

      <div className="flex justify-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
        >
          <Icon name="dashboard" className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
