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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRead, setFilterRead] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

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
    try {
      const res = await markAsReadRequest(id);
      if (res.ok && res.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // silently fail — non-critical
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await markAllAsReadRequest();
      if (res.ok && res.data?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      // silently fail
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications Centre"
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
      />

      {/* Unread Badge Summary */}
      {unreadCount > 0 && (
        <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl px-5 py-3.5 flex items-center gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-bold text-blue-200">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </span>
          <span className="text-blue-300/70 text-xs">Click any unread notification to mark it read.</span>
        </div>
      )}

      {/* Filter Tabs + Notification List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Filter Tabs */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Notification History
          </h2>
          <div className="flex items-center gap-2 text-xs">
            {[
              { value: '', label: 'All' },
              { value: 'false', label: 'Unread' },
              { value: 'true', label: 'Read' },
            ].map((tab) => (
              <button
                key={tab.value}
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

        {loading ? (
          <div className="p-6">
            <LoadingState message="Loading notification history..." />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={fetchNotificationsData} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No notifications"
              description="You have no notifications matching the selected filter criteria."
              icon="bell"
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.SYSTEM;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                  className={`p-5 flex items-start justify-between gap-4 transition-all ${
                    n.isRead
                      ? 'bg-transparent hover:bg-slate-800/20'
                      : 'bg-blue-950/20 hover:bg-blue-950/30 cursor-pointer border-l-2 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Type Icon */}
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon name={meta.icon} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${meta.color}`}>
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
                      <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkOneRead(n.id);
                      }}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-blue-600 hover:border-blue-500 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
