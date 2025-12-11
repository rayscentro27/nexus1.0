import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CRMTable from './components/CRMTable';
import PortalView from './components/PortalView';
import AdminResources from './components/AdminResources';
import SignUp from './components/SignUp';
import Settings from './components/Settings';
import AICommandCenter from './components/AICommandCenter';
import DocumentQueue from './components/DocumentQueue';
import PartnerManager from './components/PartnerManager'; 
import MarketingCampaigns from './components/MarketingCampaigns';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import ClientLandingPage from './components/ClientLandingPage';
import UnifiedInbox from './components/UnifiedInbox';
import PowerDialer from './components/PowerDialer';
import SalesTrainer from './components/SalesTrainer';
import VoiceReceptionist from './components/VoiceReceptionist';
import LeadDiscoveryMap from './components/LeadDiscoveryMap';
import FormBuilder from './components/FormBuilder';
import MarketIntelligence from './components/MarketIntelligence';
import LenderMarketplace from './components/LenderMarketplace';
import DocumentGenerator from './components/DocumentGenerator';
import RenewalTracker from './components/RenewalTracker';
import SmartCalendar from './components/SmartCalendar';
import WorkflowAutomation from './components/WorkflowAutomation';
import SyndicationManager from './components/SyndicationManager';
import ApplicationSubmitter from './components/ApplicationSubmitter';
import CommandPalette from './components/CommandPalette';
import MobileNav from './components/MobileNav';
import NotificationCenter from './components/NotificationCenter'; 
import ReputationManager from './components/ReputationManager';
import PGFundingFlow from './components/PGFundingFlow';
import ExpenseTracker from './components/ExpenseTracker';
import CommissionManager from './components/CommissionManager';
import RiskMonitor from './components/RiskMonitor';
import SalesLeaderboard from './components/SalesLeaderboard';
import GrantManager from './components/GrantManager';
import CourseBuilder from './components/CourseBuilder';
import LoanServicing from './components/LoanServicing';
import CreditMemoBuilder from './components/CreditMemoBuilder';
import { ViewMode, Contact, ClientTask, User as AppUser, Notification, AgencyBranding, Course } from './types';
import { Bell, Search, Menu } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { useAuth } from './contexts/AuthContext';

// Mock Data Initialization
const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Alice Freeman',
    email: 'alice@techcorp.com',
    phone: '(555) 123-4567',
    company: 'TechCorp Solutions',
    status: 'Negotiation',
    lastContact: '2 hours ago',
    value: 150000,
    revenue: 45000,
    timeInBusiness: 24,
    source: 'LinkedIn',
    notes: 'Looking for expansion capital. Strong cash flow.',
    checklist: {},
    clientTasks: [
      { id: 't1', title: 'Upload Bank Statements', status: 'pending', date: '2023-10-25', type: 'upload' },
      { id: 't2', title: 'Sign NDA', status: 'completed', date: '2023-10-20', type: 'action' }
    ],
    documents: [
      { id: 'd1', name: 'Bank_Stmt_Oct.pdf', type: 'Financial', status: 'Pending Review', uploadDate: '2023-10-24', required: true }
    ],
    fundingGoal: { targetAmount: 150000, targetDate: '2023-11-15', fundingType: 'Business Line of Credit' }
  },
  {
    id: '2',
    name: 'Bob Builder',
    email: 'bob@buildit.com',
    phone: '(555) 987-6543',
    company: 'BuildIt Construction',
    status: 'Active',
    lastContact: '1 day ago',
    value: 75000,
    revenue: 28000,
    timeInBusiness: 12,
    source: 'Referral',
    notes: 'Needs equipment financing for new excavator.',
    checklist: {},
    clientTasks: [],
    fundingGoal: { targetAmount: 75000, targetDate: '2023-12-01', fundingType: 'Equipment Financing' }
  },
  {
    id: '3',
    name: 'Charlie Retail',
    email: 'charlie@shop.com',
    phone: '(555) 555-5555',
    company: 'Downtown Retail',
    status: 'Lead',
    lastContact: '3 days ago',
    value: 25000,
    revenue: 12000,
    timeInBusiness: 6,
    source: 'Cold Call',
    notes: 'Seasonal inventory needs.',
    checklist: {},
    clientTasks: [],
    fundingGoal: { targetAmount: 25000, targetDate: '2023-11-01', fundingType: 'SBA Loan' }
  }
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'New Lead', message: 'Sarah from Marketing added a new lead.', date: '10 min ago', read: false, type: 'info' },
  { id: 'n2', title: 'Document Uploaded', message: 'TechCorp uploaded Oct Bank Statements.', date: '1 hour ago', read: false, type: 'success' },
  { id: 'n3', title: 'System Alert', message: 'Twilio balance is low.', date: '2 hours ago', read: true, type: 'alert' }
];

export const App = () => {
  const { user, profile, loading, debugLogin } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.LANDING);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // App-wide state
  const [branding, setBranding] = useState<AgencyBranding>({ name: 'Nexus Funding', primaryColor: '#2563eb' });
  const [courses, setCourses] = useState<Course[]>([]);

  // Initialize view based on auth status
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (profile?.role === 'client') {
          setCurrentView(ViewMode.PORTAL);
        } else {
          // If already on a specific dashboard view, keep it, otherwise default to dashboard
          if (currentView === ViewMode.LANDING || currentView === ViewMode.LOGIN || currentView === ViewMode.SIGNUP) {
             setCurrentView(ViewMode.DASHBOARD);
          }
        }
      } else if (currentView !== ViewMode.SIGNUP && currentView !== ViewMode.LOGIN && currentView !== ViewMode.CLIENT_LANDING) {
        setCurrentView(ViewMode.LANDING);
      }
    }
  }, [user, loading, profile, currentView]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const addContact = (newContact: Partial<Contact>) => {
    const contact: Contact = {
      id: `c_${Date.now()}`,
      name: newContact.name || 'New Lead',
      company: newContact.company || 'Unknown Company',
      email: newContact.email || '',
      phone: newContact.phone || '',
      status: 'Lead',
      lastContact: 'Just now',
      value: 0,
      source: 'Manual',
      checklist: {},
      clientTasks: [],
      ...newContact
    };
    setContacts(prev => [contact, ...prev]);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    // Force reload to clear all states cleanly
    window.location.reload();
  };

  const handleSeedData = () => {
    setContacts([...MOCK_CONTACTS, ...MOCK_CONTACTS.map(c => ({...c, id: c.id + '_copy', name: c.name + ' (Copy)'}))]);
  };

  const handleResetData = () => {
    setContacts([]);
  };

  // Render logic based on role and view
  const renderContent = () => {
    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    // Public Routes
    if (currentView === ViewMode.LANDING) return <LandingPage onNavigate={setCurrentView} />;
    if (currentView === ViewMode.CLIENT_LANDING) return <ClientLandingPage onNavigate={setCurrentView} />;
    if (currentView === ViewMode.LOGIN) return <Login onLogin={(u) => debugLogin(u)} onBack={() => setCurrentView(ViewMode.LANDING)} />;
    if (currentView === ViewMode.SIGNUP) return <SignUp onRegister={(c) => { addContact(c); setCurrentView(ViewMode.LOGIN); }} />;

    // Client Portal
    if (profile?.role === 'client' || currentView === ViewMode.PORTAL) {
      // Find the contact associated with the logged in user (mock logic)
      const myContact = contacts.find(c => c.email === user?.email) || contacts[0]; 
      return (
        <PortalView 
          contact={myContact} 
          onUpdateContact={updateContact} 
          branding={branding} 
          onLogout={handleLogout}
          availableCourses={courses}
        />
      );
    }

    // Admin Views
    switch (currentView) {
      case ViewMode.DASHBOARD: return <Dashboard contacts={contacts} />;
      case ViewMode.CRM: return <CRMTable contacts={contacts} onUpdateContact={updateContact} onAddContact={addContact} />;
      case ViewMode.INBOX: return <UnifiedInbox contacts={contacts} />;
      case ViewMode.RESOURCES: return <AdminResources />;
      case ViewMode.SETTINGS: return <Settings onDataChange={(type) => type === 'seed' ? handleSeedData() : handleResetData()} />;
      case ViewMode.REVIEW_QUEUE: return <DocumentQueue contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.PARTNERS: return <PartnerManager contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.MARKETING: return <MarketingCampaigns contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.POWER_DIALER: return <PowerDialer queue={contacts} onUpdateContact={updateContact} onClose={() => setCurrentView(ViewMode.CRM)} />;
      case ViewMode.SALES_TRAINER: return <SalesTrainer />;
      case ViewMode.VOICE_RECEPTIONIST: return <VoiceReceptionist />;
      case ViewMode.LEAD_MAP: return <LeadDiscoveryMap onAddLead={addContact} />;
      case ViewMode.FORM_BUILDER: return <FormBuilder onAddLead={addContact} />;
      case ViewMode.MARKET_INTEL: return <MarketIntelligence />;
      case ViewMode.LENDERS: return <LenderMarketplace />;
      case ViewMode.DOC_GENERATOR: return <DocumentGenerator contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.RENEWALS: return <RenewalTracker contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.CALENDAR: return <SmartCalendar contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.AUTOMATION: return <WorkflowAutomation />;
      case ViewMode.SYNDICATION: return <SyndicationManager contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.SUBMITTER: return <ApplicationSubmitter contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.REPUTATION: return <ReputationManager />;
      case ViewMode.FUNDING_FLOW: return <PGFundingFlow />;
      case ViewMode.EXPENSES: return <ExpenseTracker />;
      case ViewMode.COMMISSIONS: return <CommissionManager contacts={contacts} />;
      case ViewMode.RISK_MONITOR: return <RiskMonitor />;
      case ViewMode.LEADERBOARD: return <SalesLeaderboard contacts={contacts} onClose={() => setCurrentView(ViewMode.DASHBOARD)} />;
      case ViewMode.GRANTS: return <GrantManager contacts={contacts} onUpdateContact={updateContact} />;
      case ViewMode.COURSE_BUILDER: return <CourseBuilder courses={courses} onUpdateCourses={setCourses} />;
      case ViewMode.SERVICING: return <LoanServicing />;
      case ViewMode.CREDIT_MEMO: return <CreditMemoBuilder contacts={contacts} onUpdateContact={updateContact} />;
      default: return <Dashboard contacts={contacts} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar (Admin Only) */}
      {user && profile?.role !== 'client' && currentView !== ViewMode.LANDING && (
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          pendingDocCount={contacts.reduce((acc, c) => acc + (c.documents?.filter(d => d.status === 'Pending Review').length || 0), 0)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${user && profile?.role !== 'client' ? 'md:ml-64' : ''}`}>
        
        {/* Admin Top Bar */}
        {user && profile?.role !== 'client' && (
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-20 sticky top-0">
             
             {/* Mobile Menu Toggle */}
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden mr-4 text-slate-500">
                <Menu size={24} />
             </button>

             {/* Search / Command */}
             <div 
               onClick={() => setShowCommandPalette(true)}
               className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 transition-colors px-4 py-2 rounded-xl cursor-pointer text-slate-500 text-sm w-full max-w-md"
             >
                <Search size={16} />
                <span className="hidden sm:inline">Search clients, tools, or commands...</span>
                <span className="hidden sm:inline-block ml-auto text-xs bg-white px-2 py-0.5 rounded border border-slate-300">⌘K</span>
             </div>

             {/* Right Actions */}
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                >
                   <Bell size={20} />
                   {notifications.filter(n => !n.read).length > 0 && (
                     <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                   )}
                </button>
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer shadow-md">
                   {user.email?.charAt(0).toUpperCase()}
                </div>
             </div>
          </header>
        )}

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar relative">
           {renderContent()}
        </div>

        {/* Global Components */}
        <CommandPalette 
          isOpen={showCommandPalette} 
          onClose={() => setShowCommandPalette(false)}
          contacts={contacts}
          onNavigate={setCurrentView}
          onSelectContact={(c) => { setCurrentView(ViewMode.CRM); /* Logic to select c */ }}
        />

        <NotificationCenter 
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
          onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))}
          onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
        />

        <AICommandCenter contacts={contacts} onUpdateContact={updateContact} />

        {/* Mobile Navigation (Admin Only) */}
        {user && profile?.role !== 'client' && (
           <MobileNav 
             currentView={currentView} 
             onViewChange={setCurrentView}
             onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
           />
        )}

      </main>
    </div>
  );
};