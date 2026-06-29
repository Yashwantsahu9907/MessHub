import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, Check, Calendar, User, Clock, CheckCircle } from 'lucide-react';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
      case 'membership_approved':
      case 'MEMBERSHIP_APPROVED':
        return <CheckCircle size={15} className="text-emerald-500" />;
      case 'warning':
      case 'payment_reminder':
      case 'PAYMENT_REMINDER':
        return <Clock size={15} className="text-amber-500" />;
      case 'info':
      case 'join_request':
      case 'JOIN_REQUEST':
        return <User size={15} className="text-indigo-500" />;
      default:
        return <Bell size={15} className="text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500 dark:text-gray-400 transition focus:outline-none"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-scale-up transition-all duration-300">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/50">
            <h3 className="font-extrabold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-650 hover:text-indigo-750 dark:text-indigo-400 dark:hover:text-indigo-300 font-extrabold transition flex items-center gap-1 focus:outline-none"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-850">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                <Bell size={28} className="mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">All caught up!</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No pending notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-850/30 transition cursor-pointer relative ${
                    !notif.isRead ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-105 dark:border-gray-850">
                      {getIcon(notif.type || notif.title)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className={`text-xs ${!notif.isRead ? 'font-extrabold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 font-medium'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1 font-bold">
                      <Calendar size={10} />
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
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
