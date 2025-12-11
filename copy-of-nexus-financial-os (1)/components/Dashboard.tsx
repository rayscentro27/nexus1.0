
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Sparkles, RefreshCw, Calendar, Phone, CheckSquare, Clock, PieChart, FileText, AlertCircle, ArrowRight, Shield, Briefcase, Wallet, Star, Zap, Server, Globe, Map, Navigation } from 'lucide-react';
import * as geminiService from '../services/geminiService';
import { Contact, Activity as ActivityType } from '../types';

interface DashboardProps {
  contacts?: Contact[];
}

// Helper to determine if a lead is stale
const isStale = (lastContactStr: string) => {
  if (!lastContactStr) return false;
  
  // Handle "X days ago"
  if (lastContactStr.includes('days ago')) {
    const days = parseInt(lastContactStr.split(' ')[0]);
    return days > 14;
  }

  // Handle Date strings
  const date = new Date(lastContactStr);
  if (!isNaN(date.getTime())) {
    const diffTime = Math.abs(new Date().getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 14;
  }
  
  return false;
};

const StatCard = ({ title, value, change, icon, color, subtext }: any) => (
  <div className={`p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full transition-all hover:shadow-lg bg-white relative overflow-hidden group`}>
    <div className={`absolute top-0 right-0 p-3 opacity-10 rounded-bl-3xl ${color.replace('text-', 'bg-')}`}>
       {React.cloneElement(icon, { size: 48 })}
    </div>
    <div>
      <div className="flex justify-between items-start mb-2">
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${color}`}>
          {icon}
        </div>
        {change && (
          <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp size={12} /> {change}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-black text-slate-900 mt-2">{value}</h3>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
    </div>
    {subtext && <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400 font-medium">{subtext}</div>}
  </div>
);

const ActionCard = ({ title, count, description, icon, color, borderColor }: any) => (
  <div className={`p-5 rounded-2xl border ${borderColor} bg-white shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all group`}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${color} group-hover:scale-110 duration-200`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-lg">{count}</h4>
        <p className="text-sm font-medium text-slate-500">{title}</p>
      </div>
    </div>
    <ArrowRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
  </div>
);

const TourOverlay = ({ onClose }: { onClose: () => void }) => {
    const [step, setStep] = useState(1);
    
    const steps = [
        { title: "Welcome to Nexus", desc: "Your all-in-one financial operating system. Let's take a quick tour.", target: null },
        { title: "The Dashboard", desc: "This is your command center. Track revenue, pending tasks, and AI insights here.", target: "dashboard-area" },
        { title: "CRM & Pipeline", desc: "Manage your leads and deals. Drag and drop contacts to move them through stages.", target: "crm-link" },
        { title: "AI Assistant", desc: "Use the 'Ask AI' button anytime to get help with underwriting or drafting emails.", target: "ai-btn" }
    ];

    const currentStep = steps[step - 1];

    return (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 bg-blue-50 rounded-bl-full opacity-50 -mr-10 -mt-10"></div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">{currentStep.title}</h3>
                <p className="text-slate-600 mb-8 relative z-10">{currentStep.desc}</p>
                
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i + 1 === step ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        {step < steps.length ? (
                            <button onClick={() => setStep(step + 1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Next</button>
                        ) : (
                            <button onClick={onClose} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700">Finish</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ contacts = [] }) => {
  const [briefing, setBriefing] = useState<string>('');
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(true);
  const [showTour, setShowTour] = useState(false);

  // --- OPERATIONAL METRICS ---
  const pendingDocCount = contacts.reduce((acc, c) => acc + (c.documents?.filter(d => d.status === 'Pending Review').length || 0), 0);
  const pendingCommissionTotal = contacts.reduce((acc, c) => acc + (c.referralData?.commissionPending || 0), 0);
  const totalPartnerRevenue = contacts.reduce((acc, c) => acc + (c.referralData?.leads.filter(l => l.status === 'Funded').length || 0) * 5000, 0);

  // --- SALES METRICS ---
  const activeLeads = contacts.filter(c => c.status === 'Lead' || c.status === 'Negotiation' || c.status === 'Active');
  const closedDeals = contacts.filter(c => c.status === 'Closed');
  
  const totalPipelineValue = activeLeads.reduce((acc, c) => acc + c.value, 0);
  const totalClosedValue = closedDeals.reduce((acc, c) => acc + c.value, 0);
  const potentialRevenue = totalPipelineValue * 0.10; // Assuming 10% fee

  // Chart Data: Leads by Status
  const statusCounts = [
    { name: 'Lead', count: contacts.filter(c => c.status === 'Lead').length, color: '#3b82f6' }, // Blue
    { name: 'Negotiation', count: contacts.filter(c => c.status === 'Negotiation').length, color: '#f59e0b' }, // Amber/Orange
    { name: 'Active', count: contacts.filter(c => c.status === 'Active').length, color: '#10b981' }, // Emerald
    { name: 'Closed', count: contacts.filter(c => c.status === 'Closed').length, color: '#6366f1' }, // Indigo
  ];

  const generateAgenda = () => {
    const agendaItems: any[] = [];
    contacts.forEach(c => {
      if (c.activities) {
        c.activities.forEach(act => {
          if (act.type === 'meeting' || act.type === 'call') {
             agendaItems.push({
               id: `act_${act.id}`,
               time: act.date.split(' ')[1] || 'Today',
               type: act.type,
               title: `${act.type === 'call' ? 'Call' : 'Meeting'}: ${c.name}`,
               description: act.description,
               priority: 'high'
             });
          }
        });
      }
    });
    const pendingDocs = contacts.filter(c => c.documents?.some(d => d.status === 'Pending Review'));
    pendingDocs.forEach(c => {
      agendaItems.push({
        id: `doc_${c.id}`,
        time: 'Urgent',
        type: 'review',
        title: `Review Documents: ${c.name}`,
        description: `${c.company} has uploaded files waiting for verification.`,
        priority: 'high'
      });
    });
    const staleLeads = contacts.filter(c => c.status !== 'Closed' && isStale(c.lastContact));
    staleLeads.forEach(c => {
      agendaItems.push({
        id: `stale_${c.id}`,
        time: 'Follow-up',
        type: 'call',
        title: `Re-engage ${c.name}`,
        description: `Last contact was ${c.lastContact}. Risk of churn.`,
        priority: 'medium'
      });
    });
    if (agendaItems.length === 0) {
      agendaItems.push({
        id: 'default',
        time: '09:00 AM',
        type: 'email',
        title: 'Prospecting Block',
        description: 'Send outreach emails to new potential leads.',
        priority: 'low'
      });
    }
    return agendaItems.sort((a,b) => (a.priority === 'high' ? -1 : 1)).slice(0, 6); 
  };

  const agenda = generateAgenda();

  // --- GLOBAL ACTIVITY FEED ---
  const getAllActivities = () => {
    let allActivities: (ActivityType & { contactName: string, company: string })[] = [];
    contacts.forEach(c => {
      if (c.activities) {
        const enriched = c.activities.map(a => ({ ...a, contactName: c.name, company: c.company }));
        allActivities = [...allActivities, ...enriched];
      }
    });
    return allActivities.reverse().slice(0, 5);
  };

  const recentActivities = getAllActivities();

  useEffect(() => {
    const fetchBriefing = async () => {
      // Simulate slight delay for effect
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      const result = await geminiService.generateDailyBriefing(contacts);
      setBriefing(result);
      setIsLoadingBriefing(false);
    };

    if (contacts.length > 0) {
      fetchBriefing();
    } else {
      setBriefing("Welcome to Nexus. Add your first lead to generate an AI briefing.");
      setIsLoadingBriefing(false);
    }
  }, [contacts]);

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {showTour && <TourOverlay onClose={() => setShowTour(false)} />}

      {/* 0. SYSTEM STATUS & WELCOME */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm" id="dashboard-area">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Status: Online</span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
               <Server size={14} className="text-blue-500"/> Database: Connected
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
               <Globe size={14} className="text-purple-500"/> AI Network: Active
            </div>
         </div>
         <button onClick={() => setShowTour(true)} className="text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1">
            <Navigation size={12} /> Start Tour
         </button>
      </div>

      {/* 1. OPERATIONAL ACTION CENTER */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="text-blue-600" /> Operational Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard 
            title="Pending Documents" 
            count={pendingDocCount} 
            icon={<Shield size={24} className="text-amber-600" />} 
            color="bg-amber-50"
            borderColor="border-amber-200"
          />
          <ActionCard 
            title="Pending Payouts" 
            count={`$${pendingCommissionTotal.toLocaleString()}`} 
            icon={<Wallet size={24} className="text-blue-600" />} 
            color="bg-blue-50"
            borderColor="border-blue-200"
          />
          <ActionCard 
            title="Partner Revenue" 
            count={`$${totalPartnerRevenue.toLocaleString()}`} 
            icon={<Briefcase size={24} className="text-emerald-600" />} 
            color="bg-emerald-50"
            borderColor="border-emerald-200"
          />
        </div>
      </div>

      {/* 2. EXECUTIVE BRIEFING */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-10 -translate-y-10">
          <Sparkles size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 border-b border-white/20 pb-4">
             <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
               <Sparkles size={24} className="text-yellow-300 fill-yellow-300" />
             </div>
             <div>
               <h3 className="font-bold text-xl">AI Morning Briefing</h3>
               <p className="text-xs text-slate-300 opacity-90">Strategic analysis of your current pipeline.</p>
             </div>
          </div>
          
          {isLoadingBriefing ? (
            <div className="flex items-center gap-3 py-6 opacity-80">
              <RefreshCw className="animate-spin" size={24} />
              <span>Analyzing CRM data & generating strategy...</span>
            </div>
          ) : (
             <div className="prose prose-invert prose-sm max-w-none">
               <div className="whitespace-pre-line leading-relaxed font-light text-slate-100 text-base">
                 {briefing}
               </div>
             </div>
          )}
        </div>
      </div>

      {/* 3. SALES & PIPELINE METRICS */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Sales Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Pipeline Value" 
            value={`$${totalPipelineValue.toLocaleString()}`} 
            change="+12.5%" 
            icon={<DollarSign size={24} />} 
            color="text-blue-600"
            subtext="Total potential deal value"
          />
          <StatCard 
            title="Est. Revenue (10%)" 
            value={`$${potentialRevenue.toLocaleString()}`} 
            change="+8.2%" 
            icon={<TrendingUp size={24} />} 
            color="text-emerald-500"
            subtext="Projected success fees"
          />
          <StatCard 
            title="Active Leads" 
            value={activeLeads.length.toString()} 
            change="Dynamic" 
            icon={<Users size={24} />} 
            color="text-orange-500"
            subtext="Leads currently in engagement"
          />
          <StatCard 
            title="Closed Funding" 
            value={`$${totalClosedValue.toLocaleString()}`} 
            change="+24%" 
            icon={<CheckSquare size={24} />} 
            color="text-indigo-500"
            subtext="Total funded amount to date"
          />
        </div>
      </div>

      {/* 4. CHARTS & AGENDA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Pipeline Distribution Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-blue-500" /> Pipeline Distribution
          </h3>
          <div className="h-[250px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Global Activity Feed */}
          <div className="border-t border-slate-100 pt-4 mt-auto">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Live Stream</h4>
            <div className="space-y-3">
              {recentActivities.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm group hover:bg-slate-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${act.type === 'system' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                      {act.type === 'call' ? <Phone size={14}/> : act.type === 'email' ? <FileText size={14}/> : <Activity size={14}/>}
                    </div>
                    <div>
                      <p className="font-medium flex gap-2 items-center">
                        {act.contactName} 
                        <span className="text-slate-400 text-xs font-normal">({act.company})</span>
                      </p>
                      <p className="text-slate-500 text-xs truncate max-w-[300px]">{act.description}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">{act.date.split(' ')[0]}</div>
                </div>
              ))}
              {recentActivities.length === 0 && <div className="text-slate-400 text-sm">No recent activity.</div>}
            </div>
          </div>
        </div>

        {/* Dynamic Agenda (Tasks) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Priority Agenda</h3>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
              {agenda.length} Items
            </span>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {agenda.map((item) => (
              <div key={item.id} className="flex gap-4 items-start group">
                <div className="w-14 text-right flex-shrink-0 pt-1">
                  <span className={`text-xs font-bold ${item.priority === 'high' ? 'text-red-500' : 'text-slate-500'}`}>
                    {item.time}
                  </span>
                </div>
                <div className="relative pb-4 border-l-2 border-slate-100 pl-4 flex-1">
                  {/* Dot */}
                  <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                    item.type === 'call' ? 'bg-blue-500' : 
                    item.type === 'meeting' ? 'bg-orange-500' : 
                    item.type === 'review' ? 'bg-indigo-500' : 'bg-slate-400'
                  }`}>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 group-hover:border-blue-200 transition-colors cursor-pointer hover:bg-white hover:shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                      {item.title}
                      {item.priority === 'high' && <AlertCircle size={12} className="text-red-500" />}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-3 text-sm text-blue-600 bg-blue-50 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
            View Calendar <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
