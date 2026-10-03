/**
 * pages/QuizzesPage.jsx
 * Unified Knowledge Assessments & Quizzes page with role-specific views.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listQuizzesRequest } from '../services/quiz.service.js';
import Icon from '../components/common/Icon.jsx';
import './QuizzesPage.css';
import './EmployeeQuizzesPage.css';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

import CreateQuizModal from '../components/quizzes/CreateQuizModal.jsx';
import EditQuizModal from '../components/quizzes/EditQuizModal.jsx';
import ManageQuestionsModal from '../components/quizzes/ManageQuestionsModal.jsx';
import QuizTakingModal from '../components/quizzes/QuizTakingModal.jsx';
import QuizResultsReportModal from '../components/quizzes/QuizResultsReportModal.jsx';

export default function QuizzesPage() {
  const { user } = useAuth();
  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assessmentFilter, setAssessmentFilter] = useState('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [questionsQuiz, setQuestionsQuiz] = useState(null);
  const [reportQuiz, setReportQuiz] = useState(null);
  const [takingQuizId, setTakingQuizId] = useState(null);

  // Quick action feedback
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await listQuizzesRequest(params);
      if (res.ok && res.data?.success) {
        setQuizzes(res.data.data.quizzes || []);
      } else {
        setError(res.data?.message || 'Failed to load quizzes.');
      }
    } catch {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const assessmentState = quiz => {
    const trainingCompleted = Boolean(quiz.isTrainingCompleted ?? quiz.isPrerequisiteMet);
    const passed = Boolean(quiz.isPassed ?? quiz.latestAttempt?.isPassed);
    const canAttempt = Boolean(quiz.canAttempt ?? (trainingCompleted && quiz.questionCount > 0));
    return { trainingCompleted, passed, canAttempt, status: passed ? 'PASSED' : canAttempt ? 'READY' : 'LOCKED' };
  };
  const filteredQuizzes = quizzes.filter(quiz => assessmentFilter === 'ALL' || assessmentState(quiz).status === assessmentFilter);

  return (
    <div className={isEmployee ? "employee-quizzes-page" : isTrainingAdmin ? "quiz-page space-y-6" : "space-y-6"}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl shadow-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <Icon name="check" className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button aria-label="Dismiss notification" onClick={() => setToastMessage('')} className="text-emerald-500 hover:text-emerald-700">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {isEmployee ? <header className="eq-header"><div><span className="eq-eyebrow">MY WORKSPACE / ASSESSMENTS</span><h1>Security knowledge quizzes</h1><p>Put your learning into practice and track your assessment results.</p></div><div className="eq-header-actions"><Link to="/my-progress">My progress <span aria-hidden="true">&#8594;</span></Link><button type="button" onClick={fetchQuizzes} disabled={loading}><Icon name="refresh" className="w-4 h-4" />{loading?'Refreshing...':'Refresh'}</button></div></header> : <header className="quiz-page-header"><div><span className="quiz-eyebrow">TRAINING / ASSESSMENTS</span><h1>{isTrainingAdmin ? 'Quiz management' : 'Security knowledge quizzes'}</h1><p>{isTrainingAdmin ? 'Manage assessments, questions, and your team’s results.' : 'Validate your understanding of security practices through interactive quizzes.'}</p></div>{isTrainingAdmin && <button id="add-quiz-btn" className="quiz-primary" onClick={() => setIsCreateOpen(true)}><Icon name="plus" className="w-4 h-4" />Create new quiz</button>}</header>}
      {isTrainingAdmin && !loading && !error && <section className="quiz-summary" aria-label="Current quiz results">
        {[{ label: 'Assessments', value: quizzes.length, icon: 'clipboard-list', tone: 'blue', detail: searchTerm ? 'Matching your search' : 'In your assessment catalog' }, { label: 'Questions', value: quizzes.reduce((sum, quiz) => sum + (quiz.questionCount || 0), 0), icon: 'book', tone: 'violet', detail: 'Across the displayed assessments' }, { label: 'Recorded attempts', value: quizzes.reduce((sum, quiz) => sum + (quiz.attemptCount || 0), 0), icon: 'chart', tone: 'mint', detail: 'Across the displayed assessments' }].map(stat => <article key={stat.label}><span className={'quiz-summary-icon ' + stat.tone}><Icon name={stat.icon} className="w-5 h-5" /></span><span>{stat.label}</span><strong>{stat.value}</strong><p>{stat.detail}</p></article>)}
      </section>}
      {isEmployee && !loading && !error && <section className="eq-summary" aria-label="Assessment summary for current search">{[{label:'Assessments',value:quizzes.length,icon:'clipboard-list',tone:'blue',detail:'Matching your current search'},{label:'Passed',value:quizzes.filter(q=>assessmentState(q).passed).length,icon:'award',tone:'green',detail:'Knowledge requirements achieved'},{label:'Ready to attempt',value:quizzes.filter(q=>assessmentState(q).status==='READY').length,icon:'check',tone:'violet',detail:'Available for your next step'},{label:'Currently locked',value:quizzes.filter(q=>assessmentState(q).status==='LOCKED').length,icon:'lock',tone:'amber',detail:'See course or availability details'}].map(stat=><article key={stat.label}><span className={'eq-stat-icon '+stat.tone}><Icon name={stat.icon} className="w-5 h-5" /></span><h2>{stat.label}</h2><strong>{stat.value}</strong><p>{stat.detail}</p></article>)}</section>}
      <div className={isEmployee ? 'eq-collection' : isTrainingAdmin ? 'quiz-collection' : undefined}>
      {isEmployee && <div className="eq-collection-heading"><div><h2>Your assessment library</h2><p>Complete the linked training before attempting its quiz.</p></div><div className="eq-tabs" role="group" aria-label="Filter assessment status">{[{value:'ALL',label:'All quizzes'},{value:'READY',label:'Ready'},{value:'PASSED',label:'Passed'},{value:'LOCKED',label:'Locked'}].map(tab=><button type="button" key={tab.value} aria-pressed={assessmentFilter===tab.value} onClick={()=>setAssessmentFilter(tab.value)}>{tab.label}</button>)}</div></div>}
      {isTrainingAdmin && <div className="quiz-collection-header"><div><h2>Your assessments</h2><p>Configure pass marks, organize questions, and review results.</p></div><button type="button" className="quiz-refresh" onClick={fetchQuizzes} disabled={loading}><Icon name="refresh" className="w-4 h-4" />{loading ? 'Refreshing...' : 'Refresh'}</button></div>}
      {/* Search Bar */}
      <div className="quiz-toolbar bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="relative">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search" aria-label="Search quizzes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quizzes by title or keyword..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <LoadingState message="Loading assessments..." rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchQuizzes} />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes found"
          description={
            isTrainingAdmin
              ? (searchTerm ? 'Try a different keyword to find your assessment.' : 'Create a quiz and link it to a training module to get started.')
              : searchTerm ? 'Try a different keyword to find your assessment.' : 'There are no active security knowledge quizzes available at this time.'
          }
          icon="clipboard"
        />
      ) : isTrainingAdmin ? (
        <section aria-label="Quiz catalog"><div className="quiz-results-count" role="status">{quizzes.length} {quizzes.length === 1 ? 'assessment' : 'assessments'}{searchTerm ? ' matching your search' : ' in your catalog'}</div><div className="quiz-table-scroll"><table className="quiz-table"><caption className="sr-only">Quiz settings, linked training, question counts, attempts, and management actions</caption><thead><tr><th scope="col">Assessment</th><th scope="col">Training module</th><th scope="col">Pass mark</th><th scope="col">Questions</th><th scope="col">Attempts</th><th scope="col">Actions</th></tr></thead><tbody>
          {quizzes.map(quiz => <tr key={quiz.id}>
            <td className="quiz-title-cell"><button onClick={() => setEditingQuiz(quiz)}>{quiz.title}</button><p>{quiz.description || 'No instructions provided.'}</p></td>
            <td><div className="quiz-linked-module"><Icon name="academic-cap" className="w-4 h-4" /><span>{quiz.trainingModule?.title || 'No linked module'}</span></div><span className={'quiz-module-status ' + (quiz.trainingModule?.isPublished ? 'published' : 'draft')}><i />{quiz.trainingModule?.isPublished ? 'Published' : 'Draft'}</span></td>
            <td><span className="quiz-pass-mark">{quiz.passingScore}%</span></td>
            <td><span className="quiz-number">{quiz.questionCount || 0}</span><span className="quiz-cell-caption">questions</span></td>
            <td><span className="quiz-number">{quiz.attemptCount || 0}</span><span className="quiz-cell-caption">attempts</span></td>
            <td><div className="quiz-table-actions"><button id={'manage-questions-' + quiz.id} className="quiz-questions-button" onClick={() => setQuestionsQuiz(quiz)} aria-label={'Manage questions for ' + quiz.title} title="Manage questions and options"><Icon name="clipboard-list" className="w-4 h-4" /></button><button onClick={() => setEditingQuiz(quiz)} aria-label={'Edit ' + quiz.title} title="Edit settings"><Icon name="pencil" className="w-4 h-4" /></button><button onClick={() => setReportQuiz(quiz)} aria-label={'View attempt report for ' + quiz.title} title="View attempt report"><Icon name="chart" className="w-4 h-4" /></button></div></td>
          </tr>)}
        </tbody></table></div></section>
      ) : (
        <section className="eq-catalog" aria-label="Quiz catalog"><p className="eq-result-count" role="status">{filteredQuizzes.length} {filteredQuizzes.length===1?'assessment':'assessments'} in this view</p>
          {filteredQuizzes.length===0 ? <div className="eq-empty"><Icon name="clipboard-list" className="w-6 h-6" /><h3>No assessments with this status</h3><p>Choose another status to explore your quizzes.</p><button type="button" onClick={()=>setAssessmentFilter('ALL')}>View all quizzes</button></div> : <div className="eq-card-grid">{filteredQuizzes.map(quiz=>{
            const state=assessmentState(quiz);
            const latest=quiz.latestAttempt;
            const tone=state.passed?'passed':state.canAttempt?'ready':'locked';
            return <article key={quiz.id} data-quiz-card={quiz.id} className={'eq-quiz-card '+tone}><div className="eq-card-top"><span className="eq-card-icon"><Icon name="clipboard-list" className="w-6 h-6" /></span><span className={'eq-status '+tone}><Icon name={state.passed?'check':state.canAttempt?'award':'lock'} className="w-3 h-3" />{state.passed?'Passed':state.canAttempt?latest?'Retry available':'Ready to attempt':state.trainingCompleted?'Unavailable':'Training required'}</span></div><h3>{quiz.title}</h3><p className="eq-description">{quiz.description||'Test your understanding of the security practices covered in this course.'}</p>
              {quiz.trainingModule&&<Link to="/training" className="eq-linked-course"><Icon name="academic-cap" className="w-4 h-4" /><span>{quiz.trainingModule.title}</span></Link>}
              <div className="eq-card-facts"><div><span>Questions</span><strong>{quiz.questionCount||0}</strong></div><div><span>Pass mark</span><strong>{quiz.passingScore}%</strong></div><div><span>Latest score</span><strong>{latest?.score!=null?latest.score+'%':'Not attempted'}</strong></div></div>
              {!state.canAttempt&&!state.passed&&<p className="eq-prerequisite">{!state.trainingCompleted?'Finish the linked training to unlock this assessment.':'This assessment is currently unavailable.'}</p>}
              <div className="eq-card-footer"><span>{state.passed?'Requirement achieved':latest?'Latest attempt: '+(latest.isPassed?'passed':'not passed'):'Build confidence in your knowledge'}</span>{state.canAttempt?<button type="button" data-start-quiz-btn={quiz.id} aria-label={(state.passed?'Retake ':latest?'Retry ':'Start ')+quiz.title} className={state.passed?'eq-secondary':'eq-primary'} onClick={()=>setTakingQuizId(quiz.id)}>{state.passed?'Retake quiz':latest?'Retry quiz':'Start assessment'}<span aria-hidden="true">&#8594;</span></button>:!state.trainingCompleted?<Link to="/training" className="eq-training-link">Go to training <span aria-hidden="true">&#8594;</span></Link>:<button type="button" disabled className="eq-disabled"><Icon name="lock" className="w-4 h-4" />Unavailable</button>}</div>
            </article>;
          })}</div>}
        </section>
      )}

      </div>

      {/* MODALS */}
      {isCreateOpen && (
        <CreateQuizModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            showToast('Quiz created successfully!');
            fetchQuizzes();
          }}
        />
      )}

      {editingQuiz && (
        <EditQuizModal
          isOpen={Boolean(editingQuiz)}
          quiz={editingQuiz}
          onClose={() => setEditingQuiz(null)}
          onUpdated={() => {
            setEditingQuiz(null);
            showToast('Quiz settings updated successfully!');
            fetchQuizzes();
          }}
        />
      )}

      {questionsQuiz && (
        <ManageQuestionsModal
          isOpen={Boolean(questionsQuiz)}
          quizId={questionsQuiz.id}
          onClose={() => setQuestionsQuiz(null)}
          onQuestionsChanged={() => {
            fetchQuizzes();
          }}
        />
      )}

      {reportQuiz && (
        <QuizResultsReportModal
          isOpen={Boolean(reportQuiz)}
          quizId={reportQuiz.id}
          onClose={() => setReportQuiz(null)}
        />
      )}

      {takingQuizId && (
        <QuizTakingModal
          isOpen={Boolean(takingQuizId)}
          quizId={takingQuizId}
          onClose={() => {
            setTakingQuizId(null);
            fetchQuizzes();
          }}
          onQuizSubmitted={() => {
            fetchQuizzes();
          }}
          onCompleted={() => {
            setTakingQuizId(null);
            showToast('Assessment submitted successfully!');
            fetchQuizzes();
          }}
        />
      )}
    </div>
  );
}
