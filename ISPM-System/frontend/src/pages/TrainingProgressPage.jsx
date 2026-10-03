/**
 * pages/TrainingProgressPage.jsx
 * Training Progress Oversight page for TRAINING_ADMIN.
 */
import { useState, useEffect, useCallback } from 'react';
import { listTrainingRequest } from '../services/training.service.js';
import Icon from '../components/common/Icon.jsx';
import './TrainingProgressPage.css';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import TrainingProgressModal from '../components/training/TrainingProgressModal.jsx';

export default function TrainingProgressPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listTrainingRequest({ search: searchTerm });
      if (res.ok && res.data?.success) {
        setModules(res.data.data.modules || []);
      } else {
        setError(res.data?.message || 'Failed to load progress records.');
      }
    } catch {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const totals = modules.reduce((sum, mod) => ({
    completed: sum.completed + (mod.stats?.completed || 0),
    inProgress: sum.inProgress + (mod.stats?.inProgress || 0),
  }), { completed: 0, inProgress: 0 });
  const summaryCards = [
    { label: 'Training modules', value: modules.length, icon: 'book', tone: 'blue', detail: 'Published and draft courses' },
    { label: 'Published modules', value: modules.filter(mod => mod.isPublished).length, icon: 'academic-cap', tone: 'violet', detail: 'Available for employees' },
    { label: 'Course completions', value: totals.completed, icon: 'check', tone: 'green', detail: 'Completed employee-course records' },
    { label: 'In progress', value: totals.inProgress, icon: 'trending-up', tone: 'amber', detail: 'Employee-course records underway' },
  ];

  return (
    <div className="progress-oversight">
      <header className="oversight-header">
        <div>
          <span className="oversight-eyebrow">TRAINING / PROGRESS</span>
          <h1>Training progress oversight</h1>
          <p>Track course engagement and completions, then explore each employee roster.</p>
        </div>
        <button type="button" className="oversight-refresh" onClick={fetchModules} disabled={loading}>
          <Icon name="refresh" className="w-4 h-4" />{loading ? 'Refreshing...' : 'Refresh overview'}
        </button>
      </header>

      {!loading && !error && <section className="oversight-summary" aria-label="Training summary for displayed modules">
        {summaryCards.map(card => <article key={card.label}>
          <span className={'oversight-stat-icon ' + card.tone}><Icon name={card.icon} className="w-5 h-5" /></span>
          <h2>{card.label}</h2><strong>{card.value}</strong><p>{card.detail}</p>
        </article>)}
      </section>}

      <section className="oversight-panel" aria-labelledby="oversight-courses-title">
        <div className="oversight-panel-heading">
          <div><h2 id="oversight-courses-title">Course completion overview</h2><p>Review engagement and open a roster for individual progress.</p></div>
          {!loading && !error && <span className="oversight-count">{modules.length} module{modules.length !== 1 ? 's' : ''}</span>}
        </div>
        <div className="oversight-toolbar">
          <div className="oversight-search">
            <Icon name="search" className="w-4 h-4" />
            <input type="search" aria-label="Search training modules" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search training modules by name..." />
          </div>
          <p>{searchTerm ? 'Summary reflects your search results.' : 'Summary reflects all displayed modules.'}</p>
        </div>

        {loading ? <div className="oversight-state"><LoadingState message="Loading training progress reports..." /></div>
          : error ? <div className="oversight-state"><ErrorState message={error} onRetry={fetchModules} /></div>
          : modules.length === 0 ? <div className="oversight-state"><EmptyState title="No training modules found" description={searchTerm ? 'Try another course name or clear your search.' : 'Training modules will appear here once they are created.'} icon="academic-cap" /></div>
          : <div className="oversight-table-scroll"><table className="oversight-table">
            <caption className="sr-only">Training modules, publication status, recorded completions, active progress, and employee roster reports</caption>
            <thead><tr><th scope="col">Training module</th><th scope="col">Status</th><th scope="col">Completed</th><th scope="col">In progress</th><th scope="col">Report</th></tr></thead>
            <tbody>{modules.map(mod => {
              const completed = mod.stats?.completed || 0;
              const inProgress = mod.stats?.inProgress || 0;
              return <tr key={mod.id}>
                <td className="oversight-course"><div><span className="oversight-course-icon"><Icon name="academic-cap" className="w-4 h-4" /></span><div><h3>{mod.title}</h3><p>{mod.description || 'Cybersecurity training course'}</p></div></div></td>
                <td data-label="Status"><span className={'oversight-status ' + (mod.isPublished ? 'published' : 'draft')}><i aria-hidden="true" />{mod.isPublished ? 'Published' : 'Draft'}</span></td>
                <td data-label="Completed"><strong className="oversight-completed">{completed}</strong><span className="oversight-cell-detail">employee{completed !== 1 ? 's' : ''}</span></td>
                <td data-label="In progress"><strong className="oversight-active">{inProgress}</strong><span className="oversight-cell-detail">active</span></td>
                <td data-label="Report"><button type="button" className="oversight-roster" aria-label={'View employee roster for ' + mod.title} onClick={() => setSelectedModuleId(mod.id)}><Icon name="users" className="w-4 h-4" />View roster</button></td>
              </tr>;
            })}</tbody>
          </table></div>}
      </section>

      <TrainingProgressModal isOpen={!!selectedModuleId} onClose={() => setSelectedModuleId(null)} moduleId={selectedModuleId} />
    </div>
  );
}
