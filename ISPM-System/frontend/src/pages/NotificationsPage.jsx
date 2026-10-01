/**
 * pages/NotificationsPage.jsx
 * Functional Notifications view for all authenticated roles.
 * Displays user's in-app notifications, unread counts, and mark-as-read controls.
 */
import { useState, useEffect } from 'react';
import {
  getNotificationsRequest,
  getUnreadCountRequest,
  markAsReadRequest,
  markAllAsReadRequest,
} from '../services/notification.service.js';
import Icon from '../components/common/Icon.jsx';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRead, setFilterRead] = useState(''); // '' (all), 'false' (unread), 'true' (read)
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
          prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await markAllAsReadRequest();
      if (res.ok && res.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'POLICY_PUBLISHED':
      case 'POLICY_ACKNOWLEDGEMENT_DUE':
        return <Icon name="book-open" className="w-5 h-5 text-indigo-600" />;
      case 'TRAINING_ASSIGNED':
      case 'TRAINING_DUE':
        return <Icon name="academic-cap" className="w-5 h-5 text-emerald-600" />;
      case 'TICKET_UPDATE':
        return <Icon name="helpdesk" className="w-5 h-5 text-amber-600" />;
      case 'QUIZ_PASSED':
        return <Icon name="check-circle" className="w-5 h-5 text-emerald-600" />;
      case 'QUIZ_FAILED':
        return <Icon name="x-circle" className="w-5 h-5 text-rose-600" />;
      default:
        return <Icon name="bell" className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Icon name="bell" className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-800">In-App Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              System alerts, policy update notices, training assignments, and helpdesk updates
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50 flex-shrink-0"
          >
            <Icon name="check" className="w-4 h-4" />
            <span>{markingAll ? 'Updating...' : 'Mark All as Read'}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Notification List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">My Notification History</h2>

          {/* Filter Controls */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setFilterRead('')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                filterRead === ''
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRead('false')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                filterRead === 'false'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilterRead('true')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                filterRead === 'true'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Icon name="bell" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No notifications</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You have no notifications matching the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                  n.isRead
                    ? 'bg-white hover:bg-slate-50/60'
                    : 'bg-indigo-50/40 hover:bg-indigo-50/70 cursor-pointer border-l-4 border-indigo-600'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-800">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <span className="text-[11px] text-slate-400 font-medium inline-block mt-1">
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
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg transition-all flex-shrink-0 shadow-2xs"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
