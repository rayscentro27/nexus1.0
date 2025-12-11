
import React from 'react';
import { LayoutDashboard, Users, Inbox, Phone, Menu } from 'lucide-react';
import { ViewMode } from '../types';

interface MobileNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onToggleSidebar: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onViewChange, onToggleSidebar }) => {
  const navItems = [
    { id: ViewMode.DASHBOARD, label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: ViewMode.CRM, label: 'CRM', icon: <Users size={20} /> },
    { id: ViewMode.INBOX, label: 'Inbox', icon: <Inbox size={20} /> },
    { id: ViewMode.POWER_DIALER, label: 'Dialer', icon: <Phone size={20} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-3 pb-6 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentView === item.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === item.id ? 'bg-blue-50' : ''}`}>
            {item.icon}
          </div>
          <span className="text-[10px] font-bold">{item.label}</span>
        </button>
      ))}
      <button
        onClick={onToggleSidebar}
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <div className="p-1">
          <Menu size={20} />
        </div>
        <span className="text-[10px] font-bold">Menu</span>
      </button>
    </div>
  );
};

export default MobileNav;
