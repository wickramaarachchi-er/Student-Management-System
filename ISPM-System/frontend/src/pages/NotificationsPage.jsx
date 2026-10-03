/**
 * pages/NotificationsPage.jsx
 * Polished notification centre for all authenticated roles.
 */
import { useState, useEffect } from 'react';
import {
  getNotificationsRequest,
  getUnreadCountRequest,
  markAsReadRequest,
  markAllAsReadRequest,
} from '../services/notification.service.js';
import { useAuth } from '../hooks/useAuth.js';
import './AdminActivityPages.css';
import './TrainingNotificationsPage.css';
import './EmployeeNotificationsPage.css';
import Icon from '../components/common/Icon.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const TYPE_META = {
  POLICY_PUBLISHED: { label: 'Policy', icon: 'book', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  POLICY_ACKNOWLEDGEMENT_DUE: { label: 'Policy', icon: 'book', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  TRAINING_ASSIGNED: { label: 'Training', icon: 'academic-cap', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  TRAINING_DUE: { label: 'Training', icon: 'academic-cap', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  TICKET_UPDATE: { label: 'Helpdesk', icon: 'helpdesk', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  QUIZ_PASSED: { label: 'Quiz', icon: 'award', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  QUIZ_FAILED: { label: 'Quiz', icon: 'clipboard-list', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  SYSTEM: { label: 'System', icon: 'shield', color: 'bg-slate-700/60 text-slate-300 border-slate-700/40' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SYSTEM_ADMIN';
  const isComplianceOfficer = user?.role === 'COMPLIANCE_OFFICER';
  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRead, setFilterRead] = useState('');
  const [inboxSearch, setInboxSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const fetchNotificationsData = async () => {
    setLoading(true);
    setError('');
    try {
      const [listRes, countRes] = await Promise.all([
        getNotificationsRequest({ read: filterRead }),
        getUnreadCountRequest(),
      ]);

      if (listRes.ok && listRes.data?.success) {
        setNotifications(listRes.data.data.notifications || []);
      } else {
        setError(listRes.data?.message || 'Failed to retrieve notifications.');
      }

      if (countRes.ok && countRes.data?.success) {
        setUnreadCount(countRes.data.data.unreadCount || 0);
      }
    } catch {
      setError('A network error occurred while loading notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsData();
  }, [filterRead]);

  const handleMarkOneRead = async (id) => {
    if (markingId || markingAll) return;
    setMarkingId(id);
    setActionError('');
    try {
      const res = await markAsReadRequest(id);
      if (res.ok && res.data?.success) {
        setNotifications((prev) =>
          filterRead === 'false' ? prev.filter(n => n.id !== id) : prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        setActionError(res.data?.message || 'Could not mark this notification as read. Please try again.');
      }
    } catch {
      setActionError('A network error occurred. Please try marking the notification as read again.');
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll || markingId) return;
    setActionError('');
    setMarkingAll(true);
    try {
      const res = await markAllAsReadRequest();
      if (res.ok && res.data?.success) {
        setNotifications((prev) => filterRead === 'false' ? [] : prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else {
        setActionError(res.data?.message || 'Could not mark notifications as read. Please try again.');
      }
    } catch {
      setActionError('A network error occurred. Please try marking all notifications as read again.');
    } finally {
      setMarkingAll(false);
    }
  };

  const visibleNotifications = isEmployee ? notifications.filter(notification => {
    const category = (TYPE_META[notification.type] || TYPE_META.SYSTEM).label;
    const query = inboxSearch.trim().toLowerCase();
    return (categoryFilter === 'All categories' || category === categoryFilter)
      && (!query || `${notification.title || ''} ${notification.message || ''}`.toLowerCase().includes(query));
  }) : notifications;

  return (
    <div className={isEmployee ? 'training-notifications employee-notifications' : isAdmin || isComplianceOfficer ? "admin-activity notifications-centre" : "space-y-6"}>
      {isEmployee ? <header className="training-notifications-header">
        <div>
          <span className="training-notifications-eyebrow">MY WORKSPACE / NOTIFICATIONS</span>
          <h1>My notifications</h1>
          <p>Keep track of your policy reminders, learning updates, and support replies.</p>
        </div>
        <div className="training-notifications-actions">
          <button type="button" className="training-notifications-refresh" onClick={fetchNotificationsData} disabled={loading || markingAll || Boolean(markingId)}><Icon name="bell" className="w-4 h-4" />Refresh inbox</button>
          {unreadCount > 0 && <button type="button" className="training-notifications-primary" onClick={handleMarkAllRead} disabled={loading || markingAll || Boolean(markingId)}><Icon name="check" className="w-4 h-4" />{markingAll ? 'Updating...' : 'Mark all as read'}</button>}
        </div>
      </header> : <PageHeader
        title="Notifications"
        description="System alerts, policy update notices, training assignments, and helpdesk status updates."
        icon="bell"
        action={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-950 disabled:opacity-60 cursor-pointer"
            >
              <Icon name="check" className="w-4 h-4" />
              <span>{markingAll ? 'Updating...' : 'Mark All as Read'}</span>
            </button>
          ) : null
        }
      />}

      {actionError && <div className="notification-action-error" role="alert">{actionError}</div>}

      {/* Unread Badge Summary */}
      {unreadCount > 0 && (!(isTrainingAdmin || isEmployee) || (!loading && !error)) && (
        <div className="activity-unread-summary bg-blue-950/40 border border-blue-800/60 rounded-xl px-5 py-3.5 flex items-center gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-bold text-blue-200">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </span>
          <span className="text-blue-300/70 text-xs">{isEmployee ? 'Review the updates below and mark them as read when finished.' : 'Click any unread notification to mark it read.'}</span>
        </div>
      )}

      {/* Filter Tabs + Notification List */}
      <div className="activity-card bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Filter Tabs */}
        <div className="activity-card-heading px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div><h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">{isEmployee ? 'Your notification inbox' : 'Notification history'}</h2>{(isTrainingAdmin || isEmployee) && <p className="training-notifications-list-hint">Your latest alerts, with unread updates highlighted.</p>}</div>
          <div className="notification-filters flex items-center gap-2 text-xs" role="group" aria-label="Filter notifications">
            {[
              { value: '', label: 'All' },
              { value: 'false', label: 'Unread' },
              { value: 'true', label: 'Read' },
            ].map((tab) => (
              <button
                key={tab.value}
                aria-pressed={filterRead === tab.value}
                onClick={() => setFilterRead(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterRead === tab.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isEmployee && <div className="employee-inbox-toolbar">
          <div className="employee-inbox-search"><Icon name="search" className="w-4 h-4" /><input type="search" aria-label="Search notifications" placeholder="Search your notifications..." value={inboxSearch} onChange={event => setInboxSearch(event.target.value)} /></div>
          <select aria-label="Filter notification category" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}>{['All categories', 'Policy', 'Training', 'Quiz', 'Helpdesk', 'System'].map(category => <option key={category} value={category}>{category}</option>)}</select>
          {(inboxSearch || categoryFilter !== 'All categories') && <button type="button" className="employee-inbox-clear" onClick={() => { setInboxSearch(''); setCategoryFilter('All categories'); }}>Clear filters</button>}
        </div>}

        {loading ? (
          <div className="p-6">
            <LoadingState message="Loading notification history..." />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={fetchNotificationsData} />
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={isEmployee && (inboxSearch || categoryFilter !== 'All categories') ? 'No matching notifications' : isEmployee && filterRead === 'false' ? 'No unread notifications' : 'No notifications'}
              description={isEmployee ? inboxSearch || categoryFilter !== 'All categories' ? 'Try another keyword or clear your inbox filters.' : filterRead === 'false' ? 'You are caught up. Switch to All to revisit previous updates.' : filterRead === 'true' ? 'Notifications you mark as read will appear here.' : 'New policy reminders, training updates, and support replies will appear here.' : 'You have no notifications matching the selected filter criteria.'}
              icon="bell"
            />
          </div>
        ) : (
          <div className={isEmployee ? 'employee-notification-list' : 'divide-y divide-slate-800/70'} role={isEmployee ? 'list' : undefined}>
            {visibleNotifications.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.SYSTEM;
              return (
                <div
                  key={n.id}
                  role={isEmployee ? 'listitem' : undefined}
                  onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                  className={`notification-row ${n.isRead ? "notification-read" : "notification-unread"} p-5 flex items-start justify-between gap-4 transition-all ${
                    n.isRead
                      ? 'bg-transparent hover:bg-slate-800/20'
                      : 'bg-blue-950/20 hover:bg-blue-950/30 cursor-pointer border-l-2 border-blue-500'
                  }`}
                >
                  <div className="notification-content flex items-start gap-4 min-w-0">
                    {/* Type Icon */}
                    <div className={`notification-icon w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon name={meta.icon} className="w-5 h-5" />
                    </div>

                    <div className="notification-copy min-w-0 flex-1">
                      <div className="notification-title flex items-center gap-2 flex-wrap mb-1">
                        <span className={`notification-category text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${meta.color}`}>
                          {meta.label}
                        </span>
                        <h4 className={`text-sm font-bold truncate ${n.isRead ? 'text-slate-300' : 'text-slate-100'}`}>
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                      <time dateTime={n.createdAt} className="notification-date text-[11px] text-slate-500 font-medium mt-1.5 block">
                        {new Date(n.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>

                  {isEmployee && n.isRead && <span className="employee-notification-read-status"><Icon name="check" className="w-3.5 h-3.5" />Read</span>}
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkOneRead(n.id);
                      }}
                      aria-label={`Mark ${n.title} as read`}
                      disabled={markingAll || Boolean(markingId)}
                      className="notification-mark-read px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-blue-600 hover:border-blue-500 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
                    >
                      {markingId === n.id ? 'Updating...' : 'Mark read'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {(isAdmin || isTrainingAdmin || isEmployee) && !loading && !error && <div className="activity-footer" role="status">Showing {visibleNotifications.length} notification{visibleNotifications.length === 1 ? '' : 's'} in this view</div>}
      </div>
    </div>
  );
}
