/**
 * pages/HelpdeskPage.jsx
 * Functional Security Helpdesk & Support Query module for Employees and System Admins.
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

export default function HelpdeskPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SYSTEM_ADMIN';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Create Ticket Modal (Employee)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubject, setCreateSubject] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createPriority, setCreatePriority] = useState('MEDIUM');
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Ticket Details Modal
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
      const res = await getTicketsRequest({
        status: statusFilter,
        priority: priorityFilter,
        search,
      });

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

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, priorityFilter]);

  const handleOpenDetails = async (id) => {
    setSelectedTicketId(id);
    setLoadingDetails(true);
    setResponseText('');
    setResponseError('');
    try {
      const res = await getTicketDetailsRequest(id);
      if (res.ok && res.data?.success) {
        setTicketDetails(res.data.data.ticket);
      } else {
        setError(res.data?.message || 'Failed to retrieve ticket details.');
      }
    } catch {
      setError('Error loading ticket conversation details.');
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
    if (!responseText.trim()) {
      setResponseError('Response message cannot be empty.');
      return;
    }

    setSendingResponse(true);
    try {
      const res = await addTicketResponseRequest(selectedTicketId, responseText.trim());
      if (res.ok && res.data?.success) {
        setResponseText('');
        // Refresh ticket conversation
        const detailsRes = await getTicketDetailsRequest(selectedTicketId);
        if (detailsRes.ok && detailsRes.data?.success) {
          setTicketDetails(detailsRes.data.data.ticket);
        }
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
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">OPEN</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">RESOLVED</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">CLOSED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Icon name="helpdesk" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Security Helpdesk & Support Queries</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin
                ? 'Manage security inquiries, respond to support requests, and update ticket statuses'
                : 'Submit security inquiries or policy clarification requests directly to System Administrators'}
            </p>
          </div>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center space-x-2 flex-shrink-0"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>Submit Security Query</span>
          </button>
        )}
      </div>

      {/* Filter Bar & Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-slate-800">
            {isAdmin ? 'All Support Tickets' : 'My Support Tickets'}
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search subject or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none w-56"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Tickets Roster Table */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Icon name="helpdesk" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No support tickets found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {isAdmin
                ? 'No user support tickets match the current filter criteria.'
                : 'You have not submitted any helpdesk queries yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Ticket Subject & Details</th>
                  {isAdmin && <th className="py-3.5 px-6">Submitted By</th>}
                  <th className="py-3.5 px-6 text-center">Priority</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-bold text-slate-800 text-sm">{t.subject}</div>
                      <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">{t.description}</p>
                    </td>

                    {isAdmin && (
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">
                          {t.creator?.firstName} {t.creator?.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400">{t.creator?.email} ({t.creator?.department || 'General'})</div>
                      </td>
                    )}

                    <td className="py-4 px-6 text-center">{getPriorityBadge(t.priority)}</td>
                    <td className="py-4 px-6 text-center">{getStatusBadge(t.status)}</td>
                    <td className="py-4 px-6 text-right text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenDetails(t.id)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-all inline-flex items-center space-x-1"
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

      {/* Create Ticket Modal (Employee) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Submit Security Support Ticket</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Inquiry Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phishing Email Verification or Policy Clarification"
                  value={createSubject}
                  onChange={(e) => setCreateSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={createPriority}
                  onChange={(e) => setCreatePriority(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                >
                  <option value="LOW">Low – General Query</option>
                  <option value="MEDIUM">Medium – Policy Clarification</option>
                  <option value="HIGH">High – Suspicious Activity / Phishing</option>
                  <option value="CRITICAL">Critical – System Security Incident</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your security query, issue details, or observation..."
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details & Conversation Drawer/Modal */}
      {selectedTicketId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-800">
                    {ticketDetails?.subject || 'Ticket Details'}
                  </h3>
                  {ticketDetails && getStatusBadge(ticketDetails.status)}
                  {ticketDetails && getPriorityBadge(ticketDetails.priority)}
                </div>
                {ticketDetails?.creator && (
                  <p className="text-xs text-slate-500 mt-1">
                    Submitted by <b>{ticketDetails.creator.firstName} {ticketDetails.creator.lastName}</b> ({ticketDetails.creator.email}) on {new Date(ticketDetails.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedTicketId(null);
                  setTicketDetails(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Status Update Dropdown */}
            {isAdmin && ticketDetails && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Update Workflow Status:</span>
                <select
                  disabled={updatingStatus}
                  value={ticketDetails.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            )}

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {loadingDetails ? (
                <div className="p-8 flex items-center justify-center text-slate-400">
                  <Icon name="refresh" className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
                  <span>Loading message thread...</span>
                </div>
              ) : ticketDetails ? (
                <>
                  {/* Original Inquiry */}
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 space-y-1">
                    <div className="flex justify-between font-bold text-indigo-950">
                      <span>Initial Inquiry by {ticketDetails.creator?.firstName} {ticketDetails.creator?.lastName}</span>
                      <span className="text-[11px] text-indigo-600 font-normal">{new Date(ticketDetails.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ticketDetails.description}</p>
                  </div>

                  {/* Responses */}
                  {ticketDetails.responses?.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs italic">
                      No responses posted yet.
                    </div>
                  ) : (
                    ticketDetails.responses.map((resp) => {
                      const isSelf = resp.responderId === user.id;
                      const isResponderAdmin = resp.responder?.role === 'SYSTEM_ADMIN';

                      return (
                        <div
                          key={resp.id}
                          className={`p-4 rounded-xl border space-y-1 ${
                            isResponderAdmin
                              ? 'bg-slate-900 text-white border-slate-800 ml-6'
                              : 'bg-slate-50 text-slate-800 border-slate-200 mr-6'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold flex items-center space-x-1.5">
                              <span>{resp.responder?.firstName} {resp.responder?.lastName}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-mono ${isResponderAdmin ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                {resp.responder?.role}
                              </span>
                            </span>
                            <span className={isResponderAdmin ? 'text-slate-400' : 'text-slate-500'}>
                              {new Date(resp.createdAt).toLocaleString()}
                            </span>
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
            <form onSubmit={handleSendResponse} className="border-t border-slate-100 pt-3 space-y-2">
              {responseError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {responseError}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={isAdmin ? "Type administrator response..." : "Type follow-up response..."}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingResponse}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center space-x-1"
                >
                  <Icon name="send" className="w-3.5 h-3.5" />
                  <span>{sendingResponse ? 'Sending...' : 'Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
