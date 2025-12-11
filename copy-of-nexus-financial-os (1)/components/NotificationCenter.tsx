
import React from 'react';
import { X, Check, Bell, FileText, User, DollarSign, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Notification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkRead,
  onMarkAllRead 
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'alert': return <AlertCircle size={18} className="text-red-500" />;
      case 'info': default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-100';
      case 'alert': return 'bg-red-50 border-red-100';
      case 'info': default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-slate-700" />
            <h2 className="font-bold text-slate-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
                <button 
                    onClick={onMarkAllRead}
                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors mr-2"
                >
                    Mark all read
                </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Bell size={48} className="mb-4 opacity-20" />
                <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-4 rounded-xl border transition-all relative group ${notif.read ? 'bg-white border-slate-100 opacity-60' : `${getBgColor(notif.type)} shadow-sm`}`}
                onClick={() => onMarkRead(notif.id)}
              >
                <div className="flex gap-3">
                   <div className="mt-0.5">{getIcon(notif.type)}</div>
                   <div className="flex-1">
                      <h4 className={`text-sm font-bold ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2">{notif.date}</p>
                   </div>
                </div>
                {!notif.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
};

export default NotificationCenter;
