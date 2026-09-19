import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-medium bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                  className={`p-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col gap-1 cursor-pointer ${
                    !notif.isRead ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-1"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-1 pt-1">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5 font-medium"
                      >
                        View <ExternalLink size={10} />
                      </Link>
                    )}
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

export default NotificationDropdown;
