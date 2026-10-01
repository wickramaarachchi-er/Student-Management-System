/**
 * pages/HelpdeskPage.jsx
 * Security Helpdesk & Support Query module for Employees and System Admins.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import {
  getTicketsRequest,
  getTicketDetailsRequest,
  createTicketRequest,
  addTicketResponseRequest,
  updateTicketStatusRequest,
} from '../services/helpdesk.service.js';
import Icon from '../components/common/Icon.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const PRIORITY_STYLES = {
  CRITICAL: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  HIGH:     'bg-orange-500/10 text-orange-300 border-orange-500/30',
  MEDIUM:   'bg-blue-500/10 text-blue-300 border-blue-500/30',
  LOW:      'bg-slate-700/60 text-slate-300 border-slate-700/40',
};

const INPUT_CLASS = 'px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500';

function PriorityBadge({ priority }) {
  const cls = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wide ${cls}`}>
      {priority}
    </span>
  );
}

export default function HelpdeskPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SYSTEM_ADMIN';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubject, setCreateSubject] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createPriority, setCreatePriority] = useState('MEDIUM');
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseError, setResponseError] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTicketsRequest({ status: statusFilter, priority: priorityFilter, search });
      if (res.ok && res.data?.success) {
        setTickets(res.data.data.tickets || []);
      } else {
        setError(res.data?.message || 'Failed to load helpdesk tickets.');
      }
    } catch {
      setError('A network error occurred while loading tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [search, statusFilter, priorityFilter]);

  const handleOpenDetails = async (id) => {
    setSelectedTicketId(id);
    setLoadingDetails(true);
    setResponseText('');
    setResponseError('');
    try {
      const res = await getTicketDetailsRequest(id);
      if (res.ok && res.data?.success) setTicketDetails(res.data.data.ticket);
    } catch {
      // silently fail
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!createSubject.trim() || !createDescription.trim()) {
      setCreateError('Please provide both a subject and description.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createTicketRequest({
        subject: createSubject.trim(),
        description: createDescription.trim(),
        priority: createPriority,
      });
      if (res.ok && res.data?.success) {
        setShowCreateModal(false);
        setCreateSubject('');
        setCreateDescription('');
        setCreatePriority('MEDIUM');
        fetchTickets();
      } else {
        setCreateError(res.data?.message || 'Failed to submit helpdesk ticket.');
      }
    } catch {
      setCreateError('Network error while submitting ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    setResponseError('');
    if (!responseText.trim()) { setResponseError('Response message cannot be empty.'); return; }
    setSendingResponse(true);
    try {
      const res = await addTicketResponseRequest(selectedTicketId, responseText.trim());
      if (res.ok && res.data?.success) {
        setResponseText('');
        const detailsRes = await getTicketDetailsRequest(selectedTicketId);
        if (detailsRes.ok && detailsRes.data?.success) setTicketDetails(detailsRes.data.data.ticket);
        fetchTickets();
      } else {
        setResponseError(res.data?.message || 'Failed to post response.');
      }
    } catch {
      setResponseError('Network error while sending response.');
    } finally {
      setSendingResponse(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!isAdmin || !selectedTicketId) return;
    setUpdatingStatus(true);
    try {
      const res = await updateTicketStatusRequest(selectedTicketId, newStatus);
      if (res.ok && res.data?.success) {
        setTicketDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
        fetchTickets();
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingStatus(false);
    }
  };

  const MODAL_INPUT = 'w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Helpdesk & Support"
        description={
          isAdmin
            ? 'Manage security inquiries, respond to support requests, and update ticket workflow statuses.'
            : 'Submit security inquiries or policy clarification requests directly to System Administrators.'
        }
        icon="helpdesk"
        action={
          !isAdmin ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-950 cursor-pointer"
            >
              <Icon name="plus" className="w-4 h-4" />
              <span>Submit Security Query</span>
            </button>
          ) : null
        }
      />

      {/* Filter Bar + Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            {isAdmin ? 'All Support Tickets' : 'My Support Tickets'}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search subject or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT_CLASS} w-52`}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={INPUT_CLASS}>
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={INPUT_CLASS}>
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-6"><LoadingState message="Loading helpdesk tickets…" /></div>
        ) : error ? (
          <div className="p-6"><ErrorState message={error} onRetry={fetchTickets} /></div>
        ) : tickets.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No support tickets found"
              description={isAdmin ? 'No user support tickets match the current filter criteria.' : 'You have not submitted any helpdesk queries yet.'}
              icon="helpdesk"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Ticket Subject & Details</th>
                  {isAdmin && <th className="py-3.5 px-5">Submitted By</th>}
                  <th className="py-3.5 px-5">Priority</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Date</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 max-w-md">
                      <div className="font-bold text-slate-100 text-sm">{t.subject}</div>
                      <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{t.description}</p>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-100">{t.creator?.firstName} {t.creator?.lastName}</div>
                        <div className="text-[11px] text-slate-400">{t.creator?.email} · {t.creator?.department || 'General'}</div>
                      </td>
                    )}
                    <td className="py-4 px-5"><PriorityBadge priority={t.priority} /></td>
                    <td className="py-4 px-5"><StatusBadge status={t.status} /></td>
                    <td className="py-4 px-5 text-right text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleOpenDetails(t.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Icon name="chat" className="w-3.5 h-3.5" />
                        <span>View ({t._count?.responses ?? 0})</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Submit Security Support Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300">{createError}</div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Subject / Inquiry Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phishing Email Verification or Policy Clarification"
                  value={createSubject}
                  onChange={(e) => setCreateSubject(e.target.value)}
                  className={MODAL_INPUT}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Priority Level</label>
                <select value={createPriority} onChange={(e) => setCreatePriority(e.target.value)} className={MODAL_INPUT}>
                  <option value="LOW">Low – General Query</option>
                  <option value="MEDIUM">Medium – Policy Clarification</option>
                  <option value="HIGH">High – Suspicious Activity / Phishing</option>
                  <option value="CRITICAL">Critical – System Security Incident</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your security query, issue details, or observation…"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className={MODAL_INPUT + ' resize-none'}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Submitting…' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicketId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] gap-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-100">{ticketDetails?.subject || 'Ticket Details'}</h3>
                  {ticketDetails && <StatusBadge status={ticketDetails.status} />}
                  {ticketDetails && <PriorityBadge priority={ticketDetails.priority} />}
                </div>
                {ticketDetails?.creator && (
                  <p className="text-xs text-slate-400">
                    Submitted by <b className="text-slate-300">{ticketDetails.creator.firstName} {ticketDetails.creator.lastName}</b> ({ticketDetails.creator.email}) on {new Date(ticketDetails.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => { setSelectedTicketId(null); setTicketDetails(null); }}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Status Update */}
            {isAdmin && ticketDetails && (
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Update Ticket Status:</span>
                <select
                  disabled={updatingStatus}
                  value={ticketDetails.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-xs font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            )}

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {loadingDetails ? (
                <div className="p-6"><LoadingState message="Loading message thread…" /></div>
              ) : ticketDetails ? (
                <>
                  {/* Original inquiry */}
                  <div className="bg-blue-950/30 border border-blue-800/50 rounded-xl p-4 space-y-1">
                    <div className="flex justify-between font-bold text-blue-200 text-[11px]">
                      <span>Initial Inquiry — {ticketDetails.creator?.firstName} {ticketDetails.creator?.lastName}</span>
                      <span className="text-blue-300/70 font-normal">{new Date(ticketDetails.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{ticketDetails.description}</p>
                  </div>

                  {ticketDetails.responses?.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 text-xs italic">No responses posted yet.</div>
                  ) : (
                    ticketDetails.responses.map((resp) => {
                      const isResponderAdmin = resp.responder?.role === 'SYSTEM_ADMIN';
                      return (
                        <div
                          key={resp.id}
                          className={`p-4 rounded-xl border space-y-1 ${
                            isResponderAdmin
                              ? 'bg-slate-950/70 text-slate-100 border-slate-700 ml-6'
                              : 'bg-slate-800/40 text-slate-200 border-slate-700/60 mr-6'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold flex items-center gap-1.5">
                              <span>{resp.responder?.firstName} {resp.responder?.lastName}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${isResponderAdmin ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                {isResponderAdmin ? 'Admin' : 'User'}
                              </span>
                            </span>
                            <span className="text-slate-400">{new Date(resp.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{resp.responseText}</p>
                        </div>
                      );
                    })
                  )}
                </>
              ) : null}
            </div>

            {/* Reply Box */}
            <form onSubmit={handleSendResponse} className="border-t border-slate-800 pt-3 space-y-2">
              {responseError && (
                <div className="p-2 bg-rose-950/50 border border-rose-800/60 rounded-lg text-xs text-rose-300">{responseError}</div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={isAdmin ? 'Type administrator response…' : 'Type follow-up response…'}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={sendingResponse}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="send" className="w-3.5 h-3.5" />
                  <span>{sendingResponse ? 'Sending…' : 'Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
