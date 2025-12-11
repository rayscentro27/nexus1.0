
import React, { useState } from 'react';
import { LayoutDashboard, Users, Globe, Settings, LogOut, Hexagon, Library, LogIn, Briefcase, FileCheck, Menu, X, Megaphone, Inbox, Calendar, GitBranch, Mic, Phone, Map, LayoutTemplate, PieChart, Send, Star, Receipt, CreditCard, Wallet, ShieldAlert, Tv, BookOpen, FileText, GraduationCap, Handshake, Target, RefreshCw } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  pendingDocCount?: number; 
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, pendingDocCount = 0, onLogout }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNav = (view: ViewMode) => {
    onViewChange(view);
    setIsMobileOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`fixed top-0 left-0 h-screen w-64 bg-[#0f172a] text-white flex flex-col shadow-xl z-50 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10 pl-16 md:pl-6 bg-slate-900">
          <Hexagon className="text-blue-500 fill-blue-500" size={28} />
          <span className="text-xl font-bold tracking-wide">Nexus<span className="text-blue-500">OS</span></span>
          <span className="text-[10px] text-slate-500 mt-1 ml-auto font-mono">v1.0</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          
          <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Workspace</div>
          <SidebarItem id={ViewMode.DASHBOARD} label="Dashboard" icon={<LayoutDashboard size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.INBOX} label="Unified Inbox" icon={<Inbox size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.CALENDAR} label="Smart Calendar" icon={<Calendar size={18} />} currentView={currentView} onViewChange={handleNav} />

          <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-1">Sales & Deals</div>
          <SidebarItem id={ViewMode.CRM} label="CRM Pipeline" icon={<Users size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.POWER_DIALER} label="Power Dialer" icon={<Phone size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.SALES_TRAINER} label="AI Sales Coach" icon={<Mic size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.LEADERBOARD} label="Sales Floor TV" icon={<Tv size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.FUNDING_FLOW} label="PG Funding Flow" icon={<CreditCard size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.GRANTS} label="Grant Discovery" icon={<BookOpen size={18} />} currentView={currentView} onViewChange={handleNav} />
          
          <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-1">Marketing</div>
          <SidebarItem id={ViewMode.MARKETING} label="Campaigns" icon={<Megaphone size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.LEAD_MAP} label="Lead Scout" icon={<Map size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.MARKET_INTEL} label="Market Intel" icon={<Target size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.FORM_BUILDER} label="Lead Gen Forms" icon={<LayoutTemplate size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.REPUTATION} label="Reputation Mgr" icon={<Star size={18} />} currentView={currentView} onViewChange={handleNav} />

          <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-1">Operations</div>
          <button 
            onClick={() => handleNav(ViewMode.REVIEW_QUEUE)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${currentView === ViewMode.REVIEW_QUEUE ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <FileCheck size={18} className={currentView === ViewMode.REVIEW_QUEUE ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
              </div>
              <span className="font-medium text-sm">Review Queue</span>
            </div>
            {pendingDocCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                {pendingDocCount}
              </span>
            )}
          </button>
          
          <SidebarItem id={ViewMode.LENDERS} label="Lender Marketplace" icon={<Briefcase size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.SUBMITTER} label="App Submitter" icon={<Send size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.CREDIT_MEMO} label="Credit Memo Builder" icon={<FileText size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.DOC_GENERATOR} label="Doc Generator" icon={<FileText size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.SERVICING} label="Loan Servicing" icon={<Briefcase size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.SYNDICATION} label="Syndication" icon={<PieChart size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.RENEWALS} label="Renewal Tracker" icon={<RefreshCw size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.PARTNERS} label="Partner Portal" icon={<Handshake size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.RISK_MONITOR} label="Risk Monitor" icon={<ShieldAlert size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.AUTOMATION} label="Automations" icon={<GitBranch size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.EXPENSES} label="Expenses" icon={<Receipt size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.COMMISSIONS} label="Commissions" icon={<Wallet size={18} />} currentView={currentView} onViewChange={handleNav} />

          <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-1">Admin</div>
          <SidebarItem id={ViewMode.COURSE_BUILDER} label="LMS Course Builder" icon={<GraduationCap size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.RESOURCES} label="Resources" icon={<Library size={18} />} currentView={currentView} onViewChange={handleNav} />
          <SidebarItem id={ViewMode.SETTINGS} label="Settings" icon={<Settings size={18} />} currentView={currentView} onViewChange={handleNav} />
        </nav>
        
        <div className="p-4 border-t border-white/10 bg-slate-900">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 transition-colors w-full rounded-lg hover:bg-white/5 font-medium text-sm group"
          >
            <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
    </>
  );
};

const SidebarItem = ({ id, label, icon, currentView, onViewChange }: any) => (
  <button 
    onClick={() => onViewChange(id)}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${currentView === id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
  >
    <div className="flex-shrink-0">
      {React.cloneElement(icon, { className: currentView === id ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors' })}
    </div>
    <span className="font-medium text-sm truncate">{label}</span>
  </button>
);

export default Sidebar;
