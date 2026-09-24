import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { GET_FORCE_LOGOUT_REQUEST } from '../../../api/Urls';
import Axios from '../../../api/Axios';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  // Calculate unread items count
  //const unreadCount = notifications.filter((n) => !n.isRead).length;
  // 1. Initial Fetch from Backend Database
  useEffect(() => {
    const fetchNotificationsFromDB = async () => {
      try {
        setLoading(true);
        const response = await Axios.get(GET_FORCE_LOGOUT_REQUEST);
        const requests = response.data.data ?? [];
        setNotifications(requests.map((request) => ({
          ...request,
          title: 'Force logout request',
          message: `${request.user?.userName ?? request.user?.email ?? 'A user'} requested a forced logout.`,
          isRead: request.status !== 'PENDING',
          time: request.requestedAt ? new Date(request.requestedAt).toLocaleString() : '',
        })));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationsFromDB();
  }, []);

  // 2. Real-Time Runtime Listener (e.g. WebSockets / Socket.io / SSE)
  //useEffect(() => {
    /* 
    // Example with Socket.io / WebSockets:
    socket.on('notification_received', (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });
    return () => socket.off('notification_received');
    */

    // Simulated Real-Time Database Push every 12 seconds for demonstration
//     const interval = setInterval(() => {
//       const incomingNotif = {
//         id: Date.now().toString(),
//         title: 'Real-time Alert',
//         message: 'New user registration completed.',
//         isRead: false,
//         time: 'Just now',
//       };
//       setNotifications((prev) => [incomingNotif, ...prev]);
//     }, 12000);

//     return () => clearInterval(interval);
//   }, []);

  // 3. Close Popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler: Mark Single Notification as Read (Updates State & DB)
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      // Sync update with Database
      // await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark notification as read in DB:', error);
    }
  };

  // Handler: Mark All as Read (Updates State & DB)
  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      // Sync update with Database
      // await fetch('/api/notifications/mark-all-read', { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark all as read in DB:', error);
    }
  };

  // Handler: Delete Notification
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      // Delete from Database
      // await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete notification in DB:', error);
    }
  };

  return (
    // <div className="relative inline-block text-left" ref={dropdownRef}>
    <div className='bg-stone-200 p-2 rounded-4xl hover:cursor-pointer hover:bg-slate-800  text-stone-800 hover:text-blue-400' ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 hover:cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Runtime Badge Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500  text-[11px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popup Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden transform transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                No notifications found
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, item.isRead)}
                  className={`group relative flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                    item.isRead
                      ? 'bg-white hover:bg-gray-50/80'
                      : 'bg-blue-50/40 hover:bg-blue-50/70'
                  }`}
                >
                  {/* Indicator Dot */}
                  <div className="mt-1.5 shrink-0">
                    <span
                      className={`block w-2 h-2 rounded-full ${
                        item.isRead ? 'bg-transparent' : 'bg-blue-600'
                      }`}
                    />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-xs font-semibold truncate ${item.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded-md transition-opacity"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
