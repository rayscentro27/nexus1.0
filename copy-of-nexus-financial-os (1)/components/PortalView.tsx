
import React, { useState, useRef } from 'react';
import { CheckCircle, Clock, FileText, MessageSquare, PlayCircle, ExternalLink, CheckSquare, Square, Target, Calendar, Wallet as WalletIcon, Edit2, Save, X, Receipt, CreditCard, HelpCircle, Upload, Shield, Loader, FileSearch, Lock, ChevronRight, Info, LayoutDashboard, GraduationCap, BookOpen, Play, Gauge, TrendingUp, Users, Bell, Building2, Award, Gavel, Percent, Video, Download, MessageCircle, LogOut, Smartphone } from 'lucide-react';
import { Contact, ClientTask, FundingGoal, CreditAnalysis, Invoice, ClientDocument, AgencyBranding, Course } from '../types';
import { processCreditReport } from '../services/creditIntegration';
import DocumentVault from './DocumentVault';
import ReferralHub from './ReferralHub';
import BusinessProfile from './BusinessProfile';
import OfferManager from './OfferManager';
import WalletView from './Wallet';
import BankConnect from './BankConnect';
import MessageCenter from './MessageCenter';
import SubscriptionManager from './SubscriptionManager'; 
import CreditRepairAI from './CreditRepairAI';
import TierProgressWidget from './TierProgressWidget';
import BusinessPlanGenerator from './BusinessPlanGenerator';
import LoyaltyLevelWidget from './LoyaltyLevelWidget';

// Mock default courses if none passed
const DEFAULT_COURSES: Course[] = [
  { 
    id: 'course_1', 
    title: 'Funding Mastery 101', 
    description: 'The complete guide to getting your business funded.',
    modules: [
        { 
            id: 'mod_1', 
            title: 'Phase 1: Personal Foundation', 
            desc: 'Optimizing your personal credit profile.',
            lessons: [
            { id: 'l1', title: 'Personal Credit Guide', duration: '12 min', completed: true, link: 'https://www.youtube.com/watch?v=EPGPgDS0pg0' },
            { id: 'l2', title: 'How to Fix Credit Fast', duration: '18 min', completed: false, link: 'https://www.youtube.com/watch?v=PV7f-fiMmtY' }
            ]
        }
    ]
  }
]; 

interface PortalViewProps { 
  contact?: Contact; 
  onUpdateContact?: (contact: Contact) => void;
  branding?: AgencyBranding;
  onLogout?: () => void;
  isAdminPreview?: boolean;
  availableCourses?: Course[];
}

const FundingProbabilityWidget = ({ contact }: { contact: Contact }) => {
  // Simple Mock Algorithm
  const score = contact.creditAnalysis?.score || 0;
  const revenue = contact.revenue || 0;
  const docs = contact.documents?.length || 0;
  
  let probability = 10;
  if (score > 600) probability += 20;
  if (score > 680) probability += 20;
  if (revenue > 5000) probability += 20;
  if (docs > 2) probability += 20;
  if (contact.businessProfile?.taxId) probability += 10;

  const color = probability > 70 ? 'text-emerald-500' : probability > 40 ? 'text-amber-500' : 'text-red-500';
  const bgColor = probability > 70 ? 'bg-emerald-100' : probability > 40 ? 'bg-amber-100' : 'bg-red-100';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center h-full">
       <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Gauge size={18} /> Funding Odds</h3>
       <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90">
             <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-100" />
             <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className={color} strokeDasharray={351} strokeDashoffset={351 - (351 * probability) / 100} strokeLinecap="round" />
          </svg>
          <span className={`absolute text-2xl font-bold ${color}`}>{probability}%</span>
       </div>
       <p className="text-xs text-slate-500">Based on your current profile data.</p>
       {probability < 80 && (
         <div className={`mt-4 text-xs font-medium px-3 py-1 rounded-full ${bgColor} ${color.replace('text-', 'text-opacity-80 text-')}`}>
            Tip: Upload more docs to boost score.
         </div>
       )}
    </div>
  );
};

const FundingGoalWidget = ({ contact, onUpdate }: { contact: Contact, onUpdate: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(contact.fundingGoal?.targetAmount || 50000);

  const handleSave = () => {
    onUpdate({
        ...contact,
        fundingGoal: { ...contact.fundingGoal, targetAmount: amount }
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
       <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
             <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Funding Goal</p>
             <button onClick={() => setIsEditing(!isEditing)} className="text-slate-400 hover:text-white"><Edit2 size={14} /></button>
          </div>
          
          {isEditing ? (
             <div className="flex gap-2 items-center">
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded p-1 text-lg w-32 font-bold text-white" />
                <button onClick={handleSave} className="bg-blue-600 p-1.5 rounded"><Save size={14} /></button>
             </div>
          ) : (
             <h3 className="text-3xl font-bold text-white mb-1">${amount.toLocaleString()}</h3>
          )}
          
          <p className="text-xs text-blue-400 font-medium mb-4">{contact.fundingGoal?.fundingType || 'Capital'}</p>
          
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
             {/* Mock progress based on offers */}
             <div className="bg-blue-500 h-full" style={{ width: '25%' }}></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
             <span>Start</span>
             <span>Funded</span>
          </div>
       </div>
       <Target className="absolute right-4 bottom-4 text-slate-800 opacity-50" size={80} />
    </div>
  );
};

const FundingJourneyWidget = ({ contact }: { contact: Contact }) => {
  const steps = [
    { id: 'Lead', label: 'Application', desc: 'Profile Setup' },
    { id: 'Active', label: 'Underwriting', desc: 'Analyzing Cash Flow' },
    { id: 'Negotiation', label: 'Approval', desc: 'Select Offer' },
    { id: 'Closed', label: 'Funded', desc: 'Capital Deployed' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === contact.status) !== -1 
    ? steps.findIndex(s => s.id === contact.status) 
    : 0; // Default to start if unknown

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
        <TrendingUp className="text-blue-600" /> Funding Journey
      </h3>
      <div className="relative flex justify-between items-center mb-8 px-2">
        {/* Progress Line Background */}
        <div className="absolute left-0 top-4 w-full h-1 bg-slate-100 -z-0"></div>
        {/* Progress Line Fill */}
        <div 
            className="absolute left-0 top-4 h-1 bg-blue-600 -z-0 transition-all duration-1000"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors bg-white ${
                isCompleted 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-slate-300 text-slate-300'
              } ${isCurrent ? 'ring-4 ring-blue-50' : ''}`}>
                {isCompleted ? <CheckCircle size={16} fill={isCurrent ? "none" : "currentColor"} className={isCurrent ? "" : "text-blue-600"} /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <div className="mt-2 text-center absolute top-10 w-32">
                <p className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : 'text-slate-500'}`}>{step.label}</p>
                <p className="text-xs text-slate-400 hidden sm:block">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Spacer for absolute text above */}
      <div className="h-4"></div>

      {/* Dynamic Next Step Message */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
         <div className="p-2 bg-blue-100 text-blue-600 rounded-full mt-0.5">
            <Info size={16} />
         </div>
         <div>
            <h4 className="text-sm font-bold text-slate-800">Current Status: {steps[currentStepIndex]?.label || 'Onboarding'}</h4>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {contact.status === 'Lead' && "Complete your business profile and upload required documents to move to Underwriting."}
              {contact.status === 'Active' && "Our underwriting team is analyzing your data. We may request additional stipulations. Please check your tasks."}
              {contact.status === 'Negotiation' && "Congratulations! You have funding offers available. Go to the 'Offers' tab to review and sign your term sheet."}
              {contact.status === 'Closed' && "Funds have been deployed. Manage your repayment schedule and track renewal eligibility in the 'Wallet' tab."}
            </p>
         </div>
      </div>
    </div>
  );
};

const PortalView: React.FC<PortalViewProps> = ({ contact, onUpdateContact, branding, onLogout, isAdminPreview, availableCourses = DEFAULT_COURSES }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'repair' | 'classroom' | 'invoices' | 'vault' | 'partners' | 'offers' | 'wallet' | 'advisor' | 'membership' | 'business_plan'>('dashboard');
  const [showLiveChat, setShowLiveChat] = useState(false);
  
  if (!contact) return <div>Loading...</div>;
  const isFunded = contact.status === 'Closed' || contact.offers?.some(o => o.status === 'Accepted');

  const pendingTasks = contact.clientTasks.filter(t => t.status === 'pending');

  const invoices = contact.invoices || [
    { id: 'inv_sample_1', amount: 1250, date: '2024-02-01', dueDate: '2024-02-15', status: 'Paid', description: 'Success Fee - Initial Draw' }
  ];

  // Default Branding
  const agencyName = branding?.name || 'Nexus Funding';
  const brandColor = branding?.primaryColor || '#2563eb'; // Default Blue

  return (
    <div className="max-w-6xl mx-auto pb-10 relative font-sans">
       
       {/* White Label Header */}
       <div className="mb-8 bg-slate-900 text-white -mx-6 md:-mx-0 md:rounded-b-xl px-6 py-4 flex justify-between items-center shadow-lg" style={{ backgroundColor: brandColor }}>
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Building2 size={24} className="text-white" />
             </div>
             <span className="text-xl font-bold tracking-wide">{agencyName} <span className="opacity-70 font-normal">Portal</span></span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium opacity-90 hidden sm:block">Welcome, {contact.name.split(' ')[0]}</span>
             {onLogout && (
               <button 
                 onClick={onLogout} 
                 className="flex items-center gap-2 bg-black/20 hover:bg-black/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-white/10"
               >
                 {isAdminPreview ? <LayoutDashboard size={14}/> : <LogOut size={14} />}
                 {isAdminPreview ? 'Back to Admin' : 'Sign Out'}
               </button>
             )}
          </div>
       </div>

       <div className="mb-8 px-2 md:px-0">
        <h1 className="text-3xl font-bold text-slate-900 hidden">Client Portal</h1>
        <div className="flex gap-1 mt-2 border-b border-slate-200 overflow-x-auto pb-1 no-scrollbar">
           {['dashboard', 'profile', 'business_plan', 'repair', 'classroom', 'vault', 'invoices', 'partners', 'offers'].map(tab => (
             <button 
                key={tab} 
                onClick={() => setActiveTab(tab as any)} 
                className={`px-4 py-2 text-sm font-bold border-b-2 capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                style={{ borderColor: activeTab === tab ? brandColor : 'transparent', color: activeTab === tab ? brandColor : undefined }}
             >
               {tab.replace('_', ' ')}
             </button>
           ))}
           {isFunded && <button onClick={() => setActiveTab('wallet')} className={`px-4 py-2 text-sm font-bold border-b-2 capitalize whitespace-nowrap ${activeTab === 'wallet' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-emerald-600'}`}>Wallet</button>}
           <button onClick={() => setActiveTab('advisor')} className={`px-4 py-2 text-sm font-bold border-b-2 capitalize whitespace-nowrap ${activeTab === 'advisor' ? '' : 'border-transparent text-slate-500'}`} style={{ borderColor: activeTab === 'advisor' ? brandColor : 'transparent', color: activeTab === 'advisor' ? brandColor : undefined }}>Advisor</button>
           <button onClick={() => setActiveTab('membership')} className={`px-4 py-2 text-sm font-bold border-b-2 capitalize whitespace-nowrap flex items-center gap-2 ${activeTab === 'membership' ? 'border-pink-500 text-pink-500' : 'border-transparent text-pink-500'}`}><CreditCard size={16} /> Membership</button>
        </div>
       </div>

       {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in px-2 md:px-0">
             <div className="lg:col-span-2 space-y-8">
                <FundingJourneyWidget contact={contact} />
                <TierProgressWidget contact={contact} />
                
                {/* Mobile App Download Card */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 text-white shadow-lg flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Smartphone size={20} className="text-blue-300" /> Get the Mobile App
                        </h3>
                        <p className="text-blue-200 text-sm mb-4 max-w-sm">Manage your funding, upload documents, and chat with your advisor on the go. Available for Android.</p>
                        <button onClick={() => alert("Downloading APK...")} className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm">
                            <Download size={16} /> Download APK
                        </button>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-y-4 translate-x-4">
                        <Smartphone size={140} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><CheckSquare size={20} style={{ color: brandColor }}/> Your Tasks</h3>
                  <div className="space-y-3">
                    {pendingTasks.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">You're all caught up!</p>
                    ) : (
                      pendingTasks.map(t => (
                        <div key={t.id} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors flex justify-between items-center group">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{t.title}</p>
                            {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
                          </div>
                          {t.link && <a href={t.link} target="_blank" rel="noreferrer" className="text-xs font-bold hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: brandColor }}>Action <ChevronRight size={12}/></a>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
             </div>
             <div className="space-y-6">
                <LoyaltyLevelWidget contact={contact} />
                <FundingGoalWidget contact={contact} onUpdate={onUpdateContact} />
                <BankConnect contact={contact} onUpdateContact={onUpdateContact!} />
                <FundingProbabilityWidget contact={contact} />
             </div>
          </div>
       )}
       
       {activeTab === 'classroom' && (
         <div className="animate-fade-in px-2 md:px-0">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 text-white mb-8 relative overflow-hidden" style={{ background: `linear-gradient(to right, ${brandColor}, #1e293b)` }}>
               <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2">Funding University</h2>
                  <p className="opacity-80">Watch these modules to increase your credit score and funding odds.</p>
               </div>
               <div className="absolute right-0 top-0 opacity-20 p-6"><GraduationCap size={140} /></div>
            </div>

            <div className="space-y-6">
               {availableCourses.map(course => (
                  <div key={course.id} className="space-y-4">
                      {course.modules.map(module => (
                        <div key={module.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-bold text-slate-800 text-lg">{module.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{module.desc}</p>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {module.lessons.map(lesson => (
                                <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lesson.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`} style={!lesson.completed ? { backgroundColor: `${brandColor}20`, color: brandColor } : {}}>
                                            {lesson.completed ? <CheckCircle size={20} /> : <Play size={20} className="ml-1" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">{lesson.title}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} /> {lesson.duration}</p>
                                        </div>
                                    </div>
                                    <a href={lesson.link} target="_blank" rel="noreferrer" className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:border-slate-300 transition-colors">
                                        Watch Video
                                    </a>
                                </div>
                                ))}
                            </div>
                        </div>
                      ))}
                  </div>
               ))}
            </div>
         </div>
       )}

       {activeTab === 'invoices' && (
         <div className="animate-fade-in px-2 md:px-0">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Receipt style={{ color: brandColor }} /> Billing & Invoices</h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               {invoices.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                     <CheckCircle size={48} className="mx-auto mb-3 opacity-20" />
                     <p>No invoices due.</p>
                  </div>
               ) : (
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                           <th className="px-6 py-4">Description</th>
                           <th className="px-6 py-4">Date</th>
                           <th className="px-6 py-4">Due Date</th>
                           <th className="px-6 py-4">Amount</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {invoices.map(inv => (
                           <tr key={inv.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">{inv.description}</td>
                              <td className="px-6 py-4 text-slate-500 text-sm">{inv.date}</td>
                              <td className="px-6 py-4 text-slate-500 text-sm">{inv.dueDate}</td>
                              <td className="px-6 py-4 font-bold text-slate-800">${inv.amount.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 {inv.status !== 'Paid' && (
                                    <button onClick={() => alert("Redirecting to Stripe...")} className="text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90" style={{ backgroundColor: brandColor }}>Pay Now</button>
                                 )}
                                 {inv.status === 'Paid' && (
                                    <button className="text-slate-400 hover:text-slate-600"><Download size={18} /></button>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </div>
       )}
       
       {activeTab === 'repair' && <CreditRepairAI contact={contact} onUpdateContact={onUpdateContact!} />}
       {activeTab === 'membership' && <SubscriptionManager contact={contact} onUpdateContact={onUpdateContact!} />}
       
       {activeTab === 'advisor' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in px-2 md:px-0">
            {/* Chat Interface */}
            <MessageCenter contact={contact} onUpdateContact={onUpdateContact} currentUserRole="client" />
            
            {/* Booking Calendar Integration (Cal.com) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
               <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={18} style={{ color: brandColor }}/> Book a Strategy Call</h3>
               </div>
               <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
                  <Calendar size={64} className="text-slate-300 mb-4" />
                  <h4 className="text-xl font-bold text-slate-800 mb-2">Schedule with your Advisor</h4>
                  <p className="text-slate-500 mb-6 max-w-sm">Pick a time for a 1-on-1 funding strategy session. Free for Pro members.</p>
                  <button className="text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 shadow-lg transition-transform hover:scale-105 flex items-center gap-2" style={{ backgroundColor: brandColor }}>
                     Open Booking Calendar <ExternalLink size={16} />
                  </button>
                  <p className="text-xs text-slate-400 mt-4">Powered by Cal.com</p>
               </div>
            </div>
         </div>
       )}

       {activeTab === 'offers' && <OfferManager contact={contact} onUpdateContact={onUpdateContact} />}
       {activeTab === 'wallet' && <WalletView contact={contact} />}
       {activeTab === 'profile' && <BusinessProfile contact={contact} onUpdateContact={onUpdateContact} />}
       {activeTab === 'vault' && <DocumentVault contact={contact} onUpdateContact={onUpdateContact} readOnly={true} />}
       {activeTab === 'partners' && <ReferralHub contact={contact} />}
       {activeTab === 'business_plan' && <BusinessPlanGenerator contact={contact} />}

       {/* Floating Support Widget (Simulating Crisp) */}
       <div className="fixed bottom-6 right-6 z-50">
          {showLiveChat ? (
             <div className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col animate-slide-in-right overflow-hidden">
                <div className="p-4 text-white flex justify-between items-center" style={{ backgroundColor: brandColor }}>
                   <div className="flex items-center gap-2">
                      <div className="relative">
                         <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold" style={{ color: brandColor }}>N</div>
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2" style={{ borderColor: brandColor }}></div>
                      </div>
                      <div>
                         <h4 className="font-bold text-sm">Support</h4>
                         <p className="text-[10px] opacity-80">Online | Replies in 2m</p>
                      </div>
                   </div>
                   <button onClick={() => setShowLiveChat(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={18}/></button>
                </div>
                <div className="flex-1 bg-slate-50 p-4 overflow-y-auto">
                   <div className="flex gap-2 mb-4">
                      <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border border-slate-200">S</div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 border border-slate-200">
                         Hi there! How can we help you with your funding application today?
                      </div>
                   </div>
                </div>
                <div className="p-3 bg-white border-t border-slate-200">
                   <input type="text" placeholder="Type a message..." className="w-full bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 outline-none" style={{ '--tw-ring-color': brandColor } as any} />
                </div>
             </div>
          ) : (
             <button 
               onClick={() => setShowLiveChat(true)}
               className="text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-transform hover:scale-110 flex items-center justify-center"
               style={{ backgroundColor: brandColor }}
             >
                <MessageCircle size={28} />
             </button>
          )}
       </div>
       
       <div className="text-center py-8 text-xs text-slate-400">
          Powered by Nexus Financial OS
       </div>
    </div>
  );
};

export default PortalView;
