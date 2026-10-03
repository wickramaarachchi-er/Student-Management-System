/**
 * pages/TrainingPage.jsx
 * Unified Security Awareness Training page with role-specific views.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listTrainingRequest, publishTrainingRequest } from '../services/training.service.js';
import Icon from '../components/common/Icon.jsx';
import { Link } from 'react-router-dom';
import './TrainingPage.css';
import './EmployeeTrainingPage.css';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

import CreateTrainingModal from '../components/training/CreateTrainingModal.jsx';
import EditTrainingModal from '../components/training/EditTrainingModal.jsx';
import TrainingDetailModal from '../components/training/TrainingDetailModal.jsx';
import TrainingProgressModal from '../components/training/TrainingProgressModal.jsx';
import ArchiveTrainingModal from '../components/training/ArchiveTrainingModal.jsx';

export default function TrainingPage() {
  const { user } = useAuth();
  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [learningFilter, setLearningFilter] = useState('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [detailModuleId, setDetailModuleId] = useState(null);
  const [progressModuleId, setProgressModuleId] = useState(null);
  const [archivingModule, setArchivingModule] = useState(null);

  // Quick action feedback
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await listTrainingRequest(params);
      if (res.ok && res.data?.success) {
        setModules(res.data.data.modules || []);
      } else {
        setError(res.data?.message || 'Failed to load training modules.');
      }
    } catch {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handlePublish = async (mod) => {
    try {
      const res = await publishTrainingRequest(mod.id);
      if (res.ok && res.data?.success) {
        showToast(`"${mod.title}" has been published and is now live for employees.`);
        fetchModules();
      } else {
        showToast(res.data?.message || 'Failed to publish module.');
      }
    } catch {
      showToast('Network error while publishing module.');
    }
  };

  const learningStatus = mod => mod.userProgress?.status || 'NOT_STARTED';
  const filteredModules = modules.filter(mod => learningFilter === 'ALL' || learningStatus(mod) === learningFilter);
  const completedCount = modules.filter(mod => learningStatus(mod) === 'COMPLETED').length;
  const inProgressCount = modules.filter(mod => learningStatus(mod) === 'IN_PROGRESS').length;
  const notStartedCount = modules.filter(mod => learningStatus(mod) === 'NOT_STARTED').length;

  return (
    <div className={isEmployee ? "employee-training-page" : isTrainingAdmin ? "training-page space-y-6" : "space-y-6"}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-semibold rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="check" className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button aria-label="Dismiss notification" onClick={() => setToastMessage('')} className="text-emerald-400 hover:text-emerald-200 cursor-pointer">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {isEmployee ? <header className="et-header"><div><span className="et-eyebrow">MY WORKSPACE / LEARNING</span><h1>Security awareness training</h1><p>Build your security knowledge, one course at a time.</p></div><div className="et-header-actions"><Link to="/my-progress">My progress <span aria-hidden="true">&#8594;</span></Link><button type="button" onClick={fetchModules} disabled={loading}><Icon name="refresh" className="w-4 h-4" />{loading ? 'Refreshing...' : 'Refresh'}</button></div></header> : <header className="training-header">
        <div><span className="training-eyebrow">TRAINING / CATALOG</span><h1>{isTrainingAdmin ? 'Training catalog' : 'Security Awareness Training'}</h1><p>{isTrainingAdmin ? 'Create meaningful learning experiences. Build, publish, and manage your security curriculum.' : 'Explore your security awareness courses and continue learning.'}</p></div>
        {isTrainingAdmin && <button id="add-training-btn" className="training-primary" onClick={() => setIsCreateOpen(true)}><Icon name="plus" className="w-4 h-4" />Add training module</button>}
      </header>}
      {isTrainingAdmin && <section className="training-intro"><span className="training-intro-icon"><Icon name="academic-cap" className="w-6 h-6" /></span><div><h2>Knowledge that keeps your team secure.</h2><p>Shape your curriculum, review drafts, and follow employee learning progress.</p></div><Link to="/training-progress">Learner progress <span aria-hidden="true">&#8599;</span></Link></section>}

      {isTrainingAdmin && !loading && !error && <section className="training-summary" aria-label="Current catalog results">
        <article><span className="training-summary-icon blue"><Icon name="academic-cap" className="w-5 h-5" /></span><span>Training modules</span><strong>{modules.length}</strong><p>{searchTerm || statusFilter !== 'all' ? 'Matching current filters' : 'In your curriculum'}</p></article>
        <article><span className="training-summary-icon mint"><Icon name="check" className="w-5 h-5" /></span><span>Published modules</span><strong>{modules.filter(mod => mod.isPublished).length}</strong><p><i className="summary-live" />Available for employees</p></article>
        <article><span className="training-summary-icon amber"><Icon name="pencil" className="w-5 h-5" /></span><span>Draft modules</span><strong>{modules.filter(mod => !mod.isPublished).length}</strong><p><i className="summary-draft" />Ready for your review</p></article>
      </section>}

      {isEmployee && !loading && !error && <section className="et-summary" aria-label="Learning summary for current search">
        {[{label:'Available courses',value:modules.length,icon:'book',tone:'blue',detail:'Matching your current search'},{label:'Completed',value:completedCount,icon:'check',tone:'green',detail:'Courses you have finished'},{label:'In progress',value:inProgressCount,icon:'trending-up',tone:'amber',detail:'Continue where you left off'},{label:'Not started',value:notStartedCount,icon:'academic-cap',tone:'violet',detail:'Ready for you to explore'}].map(stat=><article key={stat.label}><span className={'et-stat-icon '+stat.tone}><Icon name={stat.icon} className="w-5 h-5" /></span><h2>{stat.label}</h2><strong>{stat.value}</strong><p>{stat.detail}</p></article>)}
      </section>}

      <div className={isEmployee ? 'et-collection' : isTrainingAdmin ? 'training-collection' : undefined}>
      {isTrainingAdmin && <div className="training-collection-header"><div><h2>Your curriculum</h2><p>Browse your modules and manage their publication.</p></div><button type="button" onClick={fetchModules} disabled={loading} className="training-refresh"><Icon name="refresh" className="w-4 h-4" />{loading ? 'Refreshing...' : 'Refresh'}</button></div>}
      {isEmployee && <div className="et-collection-heading"><div><h2>Your learning library</h2><p>Open a course to read its content and record your completion.</p></div><div className="et-tabs" role="group" aria-label="Filter courses by learning status">{[{value:'ALL',label:'All courses'},{value:'NOT_STARTED',label:'Not started'},{value:'IN_PROGRESS',label:'In progress'},{value:'COMPLETED',label:'Completed'}].map(tab=><button type="button" key={tab.value} aria-pressed={learningFilter===tab.value} onClick={()=>setLearningFilter(tab.value)}>{tab.label}</button>)}</div></div>}
      {/* Filter / Search Bar */}
      <div className="training-toolbar bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            aria-label="Search training modules"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search modules by title or keyword..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {isTrainingAdmin && (
          <div className="flex items-center gap-2">
            <label htmlFor="training-status" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</label>
            <select
              id="training-status" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Modules</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content View */}
      {loading ? (
        <LoadingState message="Loading training modules..." rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchModules} />
      ) : modules.length === 0 ? (
        <EmptyState
          title="No training modules found"
          description={
            isTrainingAdmin
              ? (searchTerm || statusFilter !== 'all' ? 'Try another keyword or choose All Modules to broaden your results.' : 'Add a training module to start building your security curriculum.')
              : searchTerm ? 'Try another keyword to find your course.' : 'There are no active security training courses assigned at this time.'
          }
          icon="academic-cap"
        />
      ) : isTrainingAdmin ? (
        <section className="training-catalog" aria-label="Training modules">
          <div className="training-result-count" role="status">{modules.length} {modules.length === 1 ? 'module' : 'modules'}{searchTerm || statusFilter !== 'all' ? ' matching your filters' : ' in your catalog'}</div>
          <div className="training-table-scroll"><table className="training-table"><caption className="sr-only">Training curriculum, publication status, employee progress, authors, and management actions</caption><thead><tr><th scope="col">Course module</th><th scope="col">Status</th><th scope="col">Employee progress</th><th scope="col">Created / Author</th><th scope="col">Actions</th></tr></thead><tbody>
            {modules.map(mod => <tr key={mod.id} data-module-card={mod.id}>
              <td className="training-module-cell"><button className="training-module-title" onClick={() => setDetailModuleId(mod.id)}>{mod.title}</button><p>{mod.description || 'No description provided. Edit this module to add a learning objective.'}</p><div className="training-resource"><Icon name="book" className="w-3.5 h-3.5" />{mod.resourceUrl ? 'Learning resources attached' : 'Training content'}</div></td>
              <td><span className={'training-status ' + (mod.isPublished ? 'published' : 'draft')}><i />{mod.isPublished ? 'Published' : 'Draft'}</span></td>
              <td><div className="training-table-progress"><span><i className="completed" />Completed <strong>{mod.stats?.completed || 0}</strong></span><span><i className="in-progress" />In progress <strong>{mod.stats?.inProgress || 0}</strong></span><button onClick={() => setProgressModuleId(mod.id)}>View report <span aria-hidden="true">&#8599;</span></button></div></td>
              <td><div className="training-author"><span className="training-avatar">{mod.creator?.firstName?.charAt(0) || 'S'}{mod.creator?.lastName?.charAt(0) || ''}</span><div><strong>{mod.creator ? mod.creator.firstName + ' ' + mod.creator.lastName : 'System'}</strong><span>{new Date(mod.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div></div></td>
              <td><div className="training-course-actions"><button onClick={() => setDetailModuleId(mod.id)} className="training-icon-button" aria-label={'View ' + mod.title} title="View curriculum"><Icon name="eye" className="w-4 h-4" /></button><button onClick={() => setEditingModule(mod)} className="training-edit" aria-label={'Edit ' + mod.title} title="Edit module"><Icon name="pencil" className="w-4 h-4" /></button>{!mod.isPublished ? <button onClick={() => handlePublish(mod)} className="training-publish" aria-label={'Publish ' + mod.title} title="Publish"><Icon name="check" className="w-4 h-4" /><span>Publish</span></button> : <button onClick={() => setArchivingModule(mod)} className="training-deactivate" aria-label={'Deactivate ' + mod.title} title="Deactivate"><Icon name="power" className="w-4 h-4" /><span>Deactivate</span></button>}</div></td>
            </tr>)}
          </tbody></table></div>
        </section>
      ) : (
        <section className="et-catalog" aria-label="Available training courses">
          <p className="et-result-count" role="status">{filteredModules.length} {filteredModules.length===1?'course':'courses'} in this view</p>
          {filteredModules.length===0 ? <div className="et-empty"><Icon name="academic-cap" className="w-6 h-6" /><h3>No courses with this status</h3><p>Choose another status to explore your learning library.</p><button type="button" onClick={()=>setLearningFilter('ALL')}>View all courses</button></div> : <div className="et-card-grid">{filteredModules.map(mod=>{
            const status=learningStatus(mod);
            const completed=status==='COMPLETED';
            const active=status==='IN_PROGRESS';
            const tone=completed?'completed':active?'active':'new';
            return <article key={mod.id} data-module-card={mod.id} className={'et-course-card '+tone}>
              <div className="et-course-top"><span className="et-course-icon"><Icon name="academic-cap" className="w-6 h-6" /></span><span className={'et-status '+tone}><Icon name={completed?'check':active?'trending-up':'book'} className="w-3 h-3" />{completed?'Completed':active?'In progress':'Not started'}</span></div>
              <h3>{mod.title}</h3><p className="et-course-description">{mod.description||'Explore essential security practices and strengthen your awareness.'}</p>
              <div className="et-course-meta"><span><Icon name="book" className="w-3.5 h-3.5" />{mod.resourceUrl?'Resources included':'Course content'}</span>{completed&&mod.userProgress?.completedAt&&<span>Completed {new Date(mod.userProgress.completedAt).toLocaleDateString()}</span>}</div>
              <div className="et-course-footer"><span>{completed?'Revisit whenever you need':active?'Continue your learning':'Ready when you are'}</span><button type="button" data-action-btn={mod.id} aria-label={(completed?'Review ':active?'Resume ':'Start ')+mod.title} onClick={()=>setDetailModuleId(mod.id)} className={completed?'et-secondary':'et-primary'}>{completed?'Review course':active?'Resume course':'Start training'}<span aria-hidden="true">&#8594;</span></button></div>
            </article>;
          })}</div>}
        </section>
      )}

      </div>

      {/* Modals */}
      <CreateTrainingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newMod) => {
          showToast(`Training module "${newMod.title}" created successfully as Draft.`);
          fetchModules();
        }}
      />

      <EditTrainingModal
        isOpen={!!editingModule}
        onClose={() => setEditingModule(null)}
        trainingModule={editingModule}
        onUpdated={(updMod) => {
          showToast(`Training module "${updMod.title}" updated successfully.`);
          fetchModules();
        }}
      />

      <TrainingDetailModal
        isOpen={!!detailModuleId}
        onClose={() => setDetailModuleId(null)}
        moduleId={detailModuleId}
        userRole={user?.role}
        onProgressUpdated={() => {
          fetchModules();
        }}
      />

      <TrainingProgressModal
        isOpen={!!progressModuleId}
        onClose={() => setProgressModuleId(null)}
        moduleId={progressModuleId}
      />

      <ArchiveTrainingModal
        isOpen={!!archivingModule}
        onClose={() => setArchivingModule(null)}
        trainingModule={archivingModule}
        onArchived={(archMod) => {
          showToast(`Training module "${archMod.title}" has been deactivated.`);
          fetchModules();
        }}
      />
    </div>
  );
}
