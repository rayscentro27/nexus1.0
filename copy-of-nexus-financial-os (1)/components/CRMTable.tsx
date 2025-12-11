
import React, { useState, useEffect } from 'react';
import { Contact, ClientTask, Invoice, Activity } from '../types';
import { MoreHorizontal, Search, Plus, Filter, Sparkles, Mail, BrainCircuit, X, CheckSquare, Square, PieChart, Info, Truck, Landmark, UserPlus, PlayCircle, MousePointerClick, Upload, FileText, CheckCircle, Globe, Phone, ShieldCheck, AlertCircle, Flame, Clock, DollarSign, Receipt, AlertTriangle, TrendingUp, LayoutList, Kanban, GripVertical, FileSearch, UserCheck, MapPin, BadgeCheck, Briefcase, Target, Edit2, Shield, ArrowUpCircle, Send, Calendar as CalendarIcon, ChevronLeft, ChevronRight, PenTool, Trash2, ArrowRight, MessageSquare, Gavel, CreditCard, RefreshCw, Zap, Users, Mic, MessageCircle, Headset, Calculator, ListChecks, Database, Stethoscope, Crown, Archive, Activity as ActivityIcon, Settings, Save, Smartphone, Snowflake, Thermometer } from 'lucide-react';
import * as geminiService from '../services/geminiService';
import LenderMatch from './LenderMatch';
import DocumentVault from './DocumentVault';
import CashFlowAnalyzer from './CashFlowAnalyzer';
import ActivityTimeline from './ActivityTimeline';
import OfferManager from './OfferManager';
import CreditCardMatcher from './CreditCardMatcher';
import LedgerManager from './LedgerManager';
import MessageCenter from './MessageCenter';
import CreditRepairAI from './CreditRepairAI';
import ComplianceCenter from './ComplianceCenter';
import LeadEnrichmentModal from './LeadEnrichmentModal';
import TierProgressWidget from './TierProgressWidget';
import DealStructure from './DealStructure';
import StipulationCollector from './StipulationCollector';
import PhoneNotification from './PhoneNotification';
import DealDoctor from './DealDoctor';
import SubscriptionManager from './SubscriptionManager';

// ... existing Checklist/Kanban code items remain the same ...
interface ChecklistItemDef { id: string; label: string; type: ClientTask['type']; link?: string; dependencies?: string[]; description?: string; }
const CHECKLIST_ITEMS: Record<string, ChecklistItemDef[]> = {
  phase1_personal: [
    { id: 'watch_video_personal', label: 'Watch: Personal Credit Guide', link: 'https://www.youtube.com/watch?v=EPGPgDS0pg0', type: 'education' },
    { id: 'watch_fix_credit', label: 'Watch: Fix Personal Credit for Funding', link: 'https://www.youtube.com/watch?v=PV7f-fiMmtY', type: 'education' },
    { id: 'watch_delete_strat', label: 'Watch: How to Delete Any Negative Item', link: 'https://www.youtube.com/watch?v=P1ndyImD_d0', type: 'education' },
    { id: 'watch_fb_reel', label: 'Watch: Advanced Credit Tips', link: 'https://www.facebook.com/reel/1859841764886771', type: 'education' },
    { id: 'signup_monitoring', label: 'Sign up for Credit Monitoring (IdentityIQ)', link: 'https://www.identityiq.com', type: 'action' },
    { id: 'report_rent', label: 'Boost Score: Report Rent (Rental Kharma)', link: 'https://www.rentalkharma.com/partner-marvin-wilson/', type: 'action' },
    { id: 'submit_credit_report', label: 'Submit Credit Report', type: 'upload' },
    { id: 'upload_report', label: 'Upload Full Credit Report (PDF)', type: 'upload' },
    { id: 'confirm_pii_match', label: 'Verify: Extracted PII Matches Record', type: 'review' },
    { id: 'verify_personal_info', label: 'Review Name & Address Variations', type: 'review' },
    { id: 'freeze_secondaries_pre', label: 'Pre-Dispute: Freeze Secondary Bureaus (LexisNexis, etc.)', type: 'action' },
    { id: 'dispute_negatives', label: 'Dispute Negative Items (Collections/Lates)', type: 'action' },
    { id: 'send_factual_disputes', label: 'Action: Send Factual Dispute Letters (Certified Mail)', type: 'action' },
    { id: 'remove_inquiries', label: 'Remove Hard Inquiries (>2 years)', type: 'action' },
    { id: 'reduce_utilization', label: 'Pay Down Credit Cards (<30% Utilization)', type: 'action' },
  ],
  phase2_digital: [
    { id: 'register_domain', label: 'Register Business Domain Name', link: 'https://www.godaddy.com', type: 'action' },
    { id: 'setup_email', label: 'Create Professional Business Email', link: 'https://workspace.google.com', type: 'action' },
    { id: 'setup_phone', label: 'Get Business Phone Number (VoIP)', link: 'https://www.ringcentral.com', type: 'action' },
  ],
  phase2_entity: [
    { id: 'llc_step1_search', label: 'Step 1: Check Name Availability', description: 'Search your Secretary of State website to ensure your desired LLC name is free.', link: 'https://www.sos.ca.gov/business-programs/business-entities/cbs-search', type: 'action' },
    { id: 'llc_step2_agent', label: 'Step 2: Choose Registered Agent', description: 'You need a physical address to receive legal mail. Can be you or a service.', type: 'action' },
    { id: 'llc_step3_file', label: 'Step 3: File Articles of Organization', description: 'Submit the official formation documents to the state.', type: 'upload' },
    { id: 'llc_step4_ein', label: 'Step 4: Obtain EIN (Tax ID)', description: 'Get your Federal Tax ID from the IRS website. Mon-Fri 7am-10pm EST only.', link: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online', type: 'action', dependencies: ['llc_step3_file'] },
    { id: 'llc_step5_agreement', label: 'Step 5: Draft Operating Agreement', description: 'Crucial internal document required by banks to prove ownership.', type: 'upload' },
    { id: 'llc_step6_boi', label: 'Step 6: File BOI Report (FinCEN)', description: 'Mandatory Federal requirement for all new LLCs in 2024.', link: 'https://boiefiling.fincen.gov/', type: 'action', dependencies: ['llc_step4_ein'] },
    { id: 'llc_step7_bank', label: 'Step 7: Open Business Bank Account', description: 'Bring your Articles, EIN, and Operating Agreement to the bank.', type: 'action', dependencies: ['llc_step6_boi'] },
  ],
  phase3_compliance: [
    { id: 'watch_biz_credit_2024', label: 'Watch: How to Build Business Credit (2024)', link: 'https://www.youtube.com/watch?v=87PEfXg94_Q', type: 'education' },
    { id: 'get_duns', label: 'Register for D-U-N-S Number', link: 'https://www.dnb.com/duns-number/get-a-duns.html', type: 'action' },
    { id: 'signup_nav', label: 'Create NAV.com Account', link: 'https://app.nav.com/login', type: 'action' },
    { id: 'watch_video_biz', label: 'Watch: Business Credit Roadmap', link: 'https://www.youtube.com/watch?v=ihKIi7tYBw4', type: 'education' },
  ],
  phase4_vendor_uline: [
    { id: 'apply_uline', label: 'Apply for Uline (Net 30)', link: 'https://www.uline.com/Signin/CreateAccount', type: 'action' },
    { id: 'buy_uline', label: 'Place $50+ Order at Uline', type: 'action', dependencies: ['apply_uline'] },
    { id: 'pay_uline', label: 'Pay Uline Invoice (5 Days Early)', type: 'action', dependencies: ['buy_uline'] },
    { id: 'upload_uline_invoice', label: 'Upload Paid Uline Invoice', type: 'upload', dependencies: ['pay_uline'] },
  ],
  phase4_vendor_grainger: [
    { id: 'apply_grainger', label: 'Apply for Grainger (Net 30)', link: 'https://www.grainger.com/registration', type: 'action' },
    { id: 'buy_grainger', label: 'Place $50+ Order at Grainger', type: 'action', dependencies: ['apply_grainger'] },
    { id: 'pay_grainger', label: 'Pay Grainger Invoice (Early)', type: 'action', dependencies: ['buy_grainger'] },
  ],
  phase4_vendor_quill: [
    { id: 'apply_quill', label: 'Apply for Quill (Net 30)', link: 'https://www.quill.com/account/login', type: 'action' },
    { id: 'buy_quill', label: 'Place $50+ Order at Quill', type: 'action', dependencies: ['apply_quill'] },
    { id: 'pay_quill', label: 'Pay Quill Invoice (Early)', type: 'action', dependencies: ['buy_quill'] },
  ],
  phase4_vendor_ceo: [
    { id: 'apply_ceo', label: 'Apply for CEO Creative (Net 30)', link: 'https://theceocreative.com/my-account/', type: 'action' },
    { id: 'buy_ceo', label: 'Place $50+ Order at CEO Creative', type: 'action', dependencies: ['apply_ceo'] },
  ],
  phase4_no_pg: [
    { id: 'apply_sams_club', label: 'Apply: Sam\'s Club Business Mastercard (Synchrony)', type: 'action', link: 'https://www.samsclub.com/content/credit/business' },
    { id: 'apply_amazon_prime', label: 'Apply: Amazon Business Prime (Amex Soft Pull)', type: 'action', link: 'https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/amazon-business-prime-card/' },
    { id: 'apply_gm_biz', label: 'Apply: GM Business Card (Marcus - High Limits)', type: 'action', link: 'https://www.marcus.com/us/en/credit-cards/gm-business-cards' },
  ],
  phase5_funding: [
    { id: 'run_cc_match', label: 'Run Credit Card Matcher', link: 'https://helpmebuildcredit.com/user-cc-results/#', type: 'action' },
    { id: 'freeze_secondary', label: 'Freeze LexisNexis & SageStream', type: 'action' },
    { id: 'watch_paydex_guide', label: 'Watch: Get 80 Paydex Score Fast', link: 'https://www.youtube.com/watch?v=OjH5Nu0fWOQ', type: 'education' },
    { id: 'credit_stacking', label: 'Strategy: Prepare for "Credit Stacking"', type: 'action' },
    { id: 'check_paydex', label: 'Verify Paydex Score is 80+', type: 'review' },
    { id: 'watch_ig_strat', label: 'Watch: Strategic Funding Update', link: 'https://www.instagram.com/p/DNRHkD8yX5N/?hl=en', type: 'education' },
    { id: 'watch_monica_secrets', label: 'Watch: Business Credit Secrets', link: 'https://www.youtube.com/watch?v=1C9o_7xSY-Q', type: 'education' },
  ]
};

const findChecklistItem = (itemId: string): ChecklistItemDef | undefined => {
  const allItems = Object.values(CHECKLIST_ITEMS).flat();
  return allItems.find(item => item.id === itemId);
};

const checkIsStale = (lastContactStr: string) => {
  if (!lastContactStr) return false;
  if (lastContactStr.includes('days ago')) {
    const days = parseInt(lastContactStr.split(' ')[0]);
    return days > 30; 
  }
  const date = new Date(lastContactStr);
  if (!isNaN(date.getTime())) {
    const diffTime = Math.abs(new Date().getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30; 
  }
  return false;
};

// New: Deal Probability AI Scorer
const calculateWinProbability = (contact: Contact) => {
  // If AI Score is present, prioritize it
  if (contact.aiScore !== undefined) return contact.aiScore;

  let score = 10; // Base score
  
  // Status Weight
  if (contact.status === 'Active') score = 40;
  if (contact.status === 'Negotiation') score = 75;
  if (contact.status === 'Closed') score = 100;

  // Modifiers
  if (contact.status !== 'Closed') {
      // Credit
      const credit = contact.creditAnalysis?.score || 0;
      if (credit > 700) score += 10;
      if (credit < 600 && credit > 0) score -= 15;

      // Revenue
      const rev = contact.revenue || 0;
      if (rev > 15000) score += 10;
      if (rev < 5000) score -= 5;

      // Stale Decay
      if (checkIsStale(contact.lastContact)) score -= 20;
      
      // Activity Boost
      if (contact.activities && contact.activities.length > 5) score += 5;
  }

  // Cap
  return Math.min(Math.max(score, 0), 100);
};

const calculateProgress = (checklist: Record<string, boolean>) => { const all = Object.values(CHECKLIST_ITEMS).flat(); const checked = all.filter(i => checklist[i.id]).length; return all.length ? Math.round((checked/all.length)*100) : 0; };

interface KanbanCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ contact, onClick, onDragStart }) => {
  const isStale = checkIsStale(contact.lastContact);
  const progress = calculateProgress(contact.checklist);
  const probability = calculateWinProbability(contact);
  
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, contact.id)}
      onClick={() => onClick(contact)}
      className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all active:cursor-grabbing ${isStale ? 'border-l-4 border-l-red-500 border-y-slate-200 border-r-slate-200' : 'border-slate-200'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{contact.company}</h4>
        {isStale && <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
      </div>
      <p className="text-xs text-slate-500 mb-3 truncate">{contact.name}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-emerald-600 font-bold text-sm">${contact.value.toLocaleString()}</span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
           <Clock size={10} /> {contact.lastContact}
        </div>
      </div>

      <div className="mt-2">
         <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Score</span>
            <span className={`font-bold flex items-center gap-1 ${probability > 70 ? 'text-emerald-500' : 'text-slate-600'}`}>
                {probability > 80 && <Flame size={10} className="text-orange-500 fill-orange-500" />}
                {probability}%
            </span>
         </div>
         <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${probability > 70 ? 'bg-emerald-500' : probability > 40 ? 'bg-blue-500' : 'bg-slate-400'}`} style={{ width: `${probability}%` }}></div>
         </div>
      </div>
    </div>
  );
};

interface MobileContactCardProps {
  contact: Contact;
  onClick: () => void;
  onQuickAction: (type: string, contact: Contact) => void;
}

// NEW: Mobile Contact Card for Responsive View
const MobileContactCard: React.FC<MobileContactCardProps> = ({ contact, onClick, onQuickAction }) => {
    const probability = calculateWinProbability(contact);
    const getStatusColor = (s: string) => {
        switch(s) {
            case 'Lead': return 'bg-blue-100 text-blue-800';
            case 'Active': return 'bg-emerald-100 text-emerald-800';
            case 'Negotiation': return 'bg-amber-100 text-amber-800';
            case 'Closed': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm active:scale-[0.98] transition-transform" onClick={onClick}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                        {contact.name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm">{contact.company}</h4>
                        <p className="text-xs text-slate-500">{contact.name}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(contact.status)}`}>
                    {contact.status}
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Deal Value</p>
                    <p className="font-bold text-slate-800">${contact.value.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">AI Score</p>
                    <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex-1">
                            <div className={`h-full ${probability > 60 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${probability}%`}}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{probability}%</span>
                    </div>
                </div>
            </div>

            <div className="flex border-t border-slate-100 pt-3 gap-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); onQuickAction('call', contact); }}
                    className="flex-1 py-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                >
                    <Phone size={16} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onQuickAction('message', contact); }}
                    className="flex-1 py-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                >
                    <MessageSquare size={16} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onQuickAction('email', contact); }}
                    className="flex-1 py-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                >
                    <Mail size={16} />
                </button>
            </div>
        </div>
    );
};

interface CRMTableProps {
  contacts?: Contact[];
  onUpdateContact?: (contact: Contact) => void;
  onAddContact?: (contact: Partial<Contact>) => void;
  onAssignTask?: (contactId: string, task: ClientTask) => void;
  preSelectedContact?: Contact | null;
  onClearSelection?: () => void;
  onStartDialer?: (queue: Contact[]) => void;
}

interface PipelineStage {
    id: Contact['status'] | string;
    label: string;
    color: string;
}

const CRMTable: React.FC<CRMTableProps> = ({ contacts = [], onUpdateContact, onAddContact, onAssignTask, preSelectedContact, onClearSelection, onStartDialer }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'whatsapp' | 'checklist' | 'repair' | 'financials' | 'underwriting' | 'structuring' | 'stips' | 'compliance' | 'offers' | 'documents' | 'scripts' | 'rescue' | 'membership'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  // Notification State
  const [notify, setNotify] = useState({ show: false, message: '', title: '', type: 'info' as 'info' | 'success' | 'error' });

  // Stale Leads Prompt
  const [staleLeads, setStaleLeads] = useState<Contact[]>([]);
  const [showStaleModal, setShowStaleModal] = useState(false);

  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);
  const [enrichmentMode, setEnrichmentMode] = useState<'create' | 'update'>('create');
  
  const [isAutoPiloting, setIsAutoPiloting] = useState(false);
  const [autoPilotCount, setAutoPilotCount] = useState(0);
  const [scriptScenario, setScriptScenario] = useState('Cold Call');
  const [generatedScript, setGeneratedScript] = useState('');
  const [objectionInput, setObjectionInput] = useState('');
  const [objectionResponse, setObjectionResponse] = useState('');
  const [whatsappDraft, setWhatsappDraft] = useState('');
  const [predictedObjections, setPredictedObjections] = useState<string[]>([]);

  // Pipeline Customization
  const [showStageEditor, setShowStageEditor] = useState(false);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([
    { id: 'Lead', label: 'New Leads', color: 'border-t-blue-500' },
    { id: 'Active', label: 'Underwriting', color: 'border-t-emerald-500' },
    { id: 'Negotiation', label: 'Negotiation', color: 'border-t-amber-500' },
    { id: 'Closed', label: 'Closed / Funded', color: 'border-t-indigo-500' },
  ]);
  const [newStageName, setNewStageName] = useState('');

  // --- AUTOMATION LOGIC ---
  useEffect(() => {
    if (!onUpdateContact || contacts.length === 0) return;

    contacts.forEach(contact => {
        if (contact.status !== 'Closed' && contact.fundingGoal && contact.fundedDeals) {
            const totalFunded = contact.fundedDeals.reduce((sum, deal) => sum + deal.originalAmount, 0);
            if (totalFunded >= contact.fundingGoal.targetAmount) {
                onUpdateContact({
                    ...contact,
                    status: 'Closed',
                    activities: [
                        ...(contact.activities || []),
                        {
                            id: `sys_auto_close_${Date.now()}`,
                            type: 'system',
                            description: `System Auto-Update: Funding Goal Met ($${totalFunded.toLocaleString()} / $${contact.fundingGoal.targetAmount.toLocaleString()}). Status set to Closed.`,
                            date: new Date().toLocaleString(),
                            user: 'System'
                        }
                    ]
                });
                showNotification('Goal Met', `${contact.company} status updated to Closed.`, 'success');
            }
        }
    });

    const stale = contacts.filter(c => c.status !== 'Closed' && checkIsStale(c.lastContact));
    if (stale.length > 0 && !showStaleModal) {
        setStaleLeads(stale);
        setShowStaleModal(true);
    }

  }, [contacts.length]); 

  useEffect(() => {
    if (preSelectedContact) {
      setSelectedContact(preSelectedContact);
    }
  }, [preSelectedContact]);

  const displayContacts = contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.company.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleGenerateEmail = async (c: Contact) => { 
    setIsLoadingAi(true); 
    const res = await geminiService.generateEmailDraft(c, 'Update'); 
    setAiOutput(res); 
    setIsLoadingAi(false); 
    showNotification('Draft Generated', 'AI email draft is ready for review.', 'success');
  };
  
  const handleSendAppLink = (c: Contact) => {
    const appLink = "https://cdn.nexus.funding/apps/latest.apk";
    const msg = `Hi ${c.name.split(' ')[0]}, download our secure mobile app here to track your funding status: ${appLink}`;
    
    // Simulate sending SMS/Email
    alert(`Sent App Link to ${c.phone}:\n"${msg}"`);
    
    // Log activity
    if (onUpdateContact) {
        onUpdateContact({
            ...c,
            activities: [...(c.activities || []), {
                id: `act_app_${Date.now()}`,
                type: 'system',
                description: 'Sent Mobile App Download Link via SMS',
                date: new Date().toLocaleString(),
                user: 'Admin'
            }]
        });
    }
  };

  const handleAnalyzeDeal = async (c: Contact) => { 
    setIsLoadingAi(true); 
    const res = await geminiService.analyzeDealRisks(c); 
    setAiOutput(res); 
    setIsLoadingAi(false); 
    showNotification('Analysis Complete', 'Risk assessment updated.', 'info');
  };
  
  const handleRunAiScoring = async () => {
    if (!onUpdateContact) return;
    setIsLoadingAi(true);
    showNotification('AI Scoring', 'Evaluating leads based on revenue, industry, and engagement...', 'info');
    
    const results = await geminiService.batchScoreLeads(displayContacts);
    
    // Update each contact with the new score
    results.forEach(result => {
        const contact = contacts.find(c => c.id === result.id);
        if (contact) {
            onUpdateContact({
                ...contact,
                aiScore: result.score,
                aiReason: result.reason,
                aiPriority: result.priority
            });
        }
    });
    
    setIsLoadingAi(false);
    showNotification('Scoring Complete', `Updated scores for ${results.length} leads.`, 'success');
  };

  const handleAddActivity = (id: string, act: Activity) => { if(onUpdateContact && selectedContact) onUpdateContact({...selectedContact, activities: [...(selectedContact.activities||[]), act]})};
  
  const toggleChecklistItem = (cid: string, iid: string) => {
    if (!onUpdateContact || !selectedContact) return;
    const currentStatus = selectedContact.checklist[iid] || false;
    const updatedChecklist = { ...selectedContact.checklist, [iid]: !currentStatus };
    const updatedContact = { ...selectedContact, checklist: updatedChecklist };
    onUpdateContact(updatedContact);
    setSelectedContact(updatedContact);
  };

  const handleLenderAssign = (id: string, t: ClientTask) => { if(onAssignTask) {onAssignTask(id, t); showNotification('Task Assigned', `Assigned: ${t.title}`, 'success'); }};
  
  const showNotification = (title: string, message: string, type: 'info'|'success'|'error' = 'info') => {
    setNotify({ show: true, title, message, type });
  };
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedContactId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = (e: React.DragEvent, newStatus: Contact['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedContactId;
    if (id && onUpdateContact) {
       const contactToMove = contacts.find(c => c.id === id);
       if (contactToMove && contactToMove.status !== newStatus) {
         onUpdateContact({ ...contactToMove, status: newStatus });
         showNotification('Pipeline Update', `${contactToMove.company} moved to ${newStatus}`, 'success');
       }
    }
    setDraggedContactId(null);
  };

  const handleAutoPilot = async () => {
    const eligibleContacts = displayContacts.filter(c => ['Lead', 'Active', 'Negotiation'].includes(c.status));
    if (eligibleContacts.length === 0) { showNotification("Error", "No eligible contacts found.", 'error'); return; }
    if (!window.confirm(`Launch AI Auto-Pilot for ${eligibleContacts.length} contacts?`)) return;
    setIsAutoPiloting(true); setAutoPilotCount(0);
    for (let i = 0; i < eligibleContacts.length; i++) {
      const contact = eligibleContacts[i];
      try {
        let topic = "Checking in";
        if (contact.status === 'Lead') topic = "Following up on your funding inquiry";
        if (contact.status === 'Active') topic = "Status update on your application";
        if (contact.status === 'Negotiation') topic = "Next steps to finalize funding";
        const emailContent = await geminiService.generateEmailDraft(contact, topic);
        const newActivity: Activity = { id: `auto_email_${Date.now()}_${contact.id}`, type: 'email', description: `[AI AUTO-PILOT]\nSubject: ${topic}\n\n${emailContent}`, date: new Date().toLocaleString(), user: 'AI Agent' };
        if (onUpdateContact) onUpdateContact({ ...contact, lastContact: 'Just now', activities: [newActivity, ...(contact.activities || [])] });
        setAutoPilotCount(i + 1);
      } catch (err) { console.error("Auto pilot error", err); }
      await new Promise(r => setTimeout(r, 1500)); 
    }
    setIsAutoPiloting(false); showNotification('Campaign Complete', `Sent ${eligibleContacts.length} emails.`, 'success');
  };

  const handleCreateEnrichedLead = (partialLead: Partial<Contact>) => {
    if (onAddContact) {
      onAddContact(partialLead);
      showNotification('Lead Created', `Added ${partialLead.company} to CRM.`, 'success');
    }
  };

  const handleGenerateScript = async () => {
    if (!selectedContact) return;
    setIsLoadingAi(true);
    const script = await geminiService.generateSalesScript(selectedContact, scriptScenario);
    setGeneratedScript(script);
    setIsLoadingAi(false);
  };

  const handleObjection = async () => {
    if (!selectedContact || !objectionInput) return;
    setIsLoadingAi(true);
    const response = await geminiService.generateObjectionResponse(selectedContact, objectionInput);
    setObjectionResponse(response);
    setIsLoadingAi(false);
  };

  const handlePredictObjections = async () => {
    if (!selectedContact) return;
    setIsLoadingAi(true);
    const predictions = await geminiService.predictCommonObjections(selectedContact);
    setPredictedObjections(predictions);
    setIsLoadingAi(false);
  };

  const handleSelectPredictedObjection = async (obj: string) => {
    setObjectionInput(obj);
    setIsLoadingAi(true);
    const response = await geminiService.generateObjectionResponse(selectedContact!, obj);
    setObjectionResponse(response);
    setIsLoadingAi(false);
  };

  const handleGenerateWhatsApp = async () => {
    if (!selectedContact) return;
    setIsLoadingAi(true);
    const context = `Status: ${selectedContact.status}. Last spoke: ${selectedContact.lastContact}. Note: ${selectedContact.notes}`;
    const draft = await geminiService.generateWhatsAppMessage(selectedContact, context);
    setWhatsappDraft(draft);
    setIsLoadingAi(false);
  };

  const sendWhatsApp = () => {
    if (!selectedContact || !whatsappDraft) return;
    const cleanNumber = selectedContact.phone.replace(/\D/g, ''); 
    const encodedMessage = encodeURIComponent(whatsappDraft);
    const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    const newActivity: Activity = { id: `wa_${Date.now()}`, type: 'note', description: `WhatsApp Sent:\n"${whatsappDraft}"`, date: new Date().toLocaleString(), user: 'Admin' };
    handleAddActivity(selectedContact.id, newActivity);
    window.open(url, '_blank');
  };

  const handleLaunchDialer = () => { if (onStartDialer) onStartDialer(displayContacts); };

  const handleSnoozeStale = () => {
    if (!onUpdateContact) return;
    staleLeads.forEach(c => {
        onUpdateContact({
            ...c,
            lastContact: 'Just now',
            activities: [...(c.activities || []), { id: `sys_snooze_${Date.now()}`, type: 'system', description: 'Activity Snoozed (Reset Timer)', date: new Date().toLocaleString(), user: 'Admin' }]
        });
    });
    setShowStaleModal(false);
    showNotification('Leads Snoozed', 'Timers reset for 30 days.', 'info');
  };

  const handleArchiveStale = () => {
    if (!onUpdateContact) return;
    staleLeads.forEach(c => {
        onUpdateContact({
            ...c,
            status: 'Closed',
            activities: [...(c.activities || []), { id: `sys_arch_${Date.now()}`, type: 'system', description: 'Archived due to 30+ days inactivity.', date: new Date().toLocaleString(), user: 'Admin' }]
        });
    });
    setShowStaleModal(false);
    showNotification('Leads Archived', 'Status set to Closed.', 'success');
  };

  const handleQuickAction = (type: string, contact: Contact) => {
      if (type === 'call') {
          // Simulate simple call or trigger dialer for one
          if(onStartDialer) onStartDialer([contact]);
      } else if (type === 'message') {
          setSelectedContact(contact);
          setActiveTab('messages');
      } else if (type === 'email') {
          setSelectedContact(contact);
          setActiveTab('overview');
          handleGenerateEmail(contact);
      }
  };

  // --- Pipeline Customization Functions ---
  const handleAddStage = () => {
    if (newStageName.trim()) {
        const id = newStageName.trim();
        setPipelineStages([...pipelineStages, { id: id as any, label: newStageName, color: 'border-t-slate-500' }]);
        setNewStageName('');
    }
  };

  const handleRemoveStage = (id: string) => {
    if (confirm("Are you sure? Removing a stage will hide it from the board view.")) {
        setPipelineStages(pipelineStages.filter(s => s.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Closed': return 'bg-indigo-100 text-indigo-700';
      case 'Negotiation': return 'bg-amber-100 text-amber-700';
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'Lead': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="h-full flex flex-col relative">
       {/* Toolbar */}
       <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
             <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}><LayoutList size={18} /></button>
                <button onClick={() => setViewMode('board')} className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}><Kanban size={18} /></button>
             </div>
             {viewMode === 'board' && (
                 <button 
                    onClick={() => setShowStageEditor(true)}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    title="Customize Stages"
                 >
                    <Settings size={18} />
                 </button>
             )}
             <div className="text-sm font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
               <Users size={16} className="text-slate-400" /> {displayContacts.length} Contacts
             </div>
          </div>
          <div className="flex gap-3 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            <button 
                onClick={handleRunAiScoring}
                disabled={isLoadingAi}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-purple-600 bg-white border border-purple-200 hover:bg-purple-50 shadow-sm transition-all whitespace-nowrap"
            >
                {isLoadingAi ? <RefreshCw className="animate-spin" size={16}/> : <Thermometer size={16} />} 
                {isLoadingAi ? 'Scoring...' : 'AI Lead Scoring'}
            </button>

            <button 
                onClick={() => {
                    const stale = contacts.filter(c => c.status !== 'Closed' && checkIsStale(c.lastContact));
                    if(stale.length > 0) {
                        setStaleLeads(stale);
                        setShowStaleModal(true);
                    } else {
                        showNotification('Pipeline Healthy', 'No stale leads found.', 'success');
                    }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all whitespace-nowrap"
            >
                <ActivityIcon size={16} className={staleLeads.length > 0 ? "text-amber-500" : "text-emerald-500"} /> Health Check
            </button>

            <button onClick={() => { setEnrichmentMode('create'); setShowEnrichmentModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 shadow-sm transition-all whitespace-nowrap"><Sparkles size={16} /> Smart Add Lead</button>
            <button onClick={handleLaunchDialer} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all whitespace-nowrap"><Headset size={16} /> Start Calling</button>
            <button onClick={handleAutoPilot} disabled={isAutoPiloting} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-md transition-all whitespace-nowrap ${isAutoPiloting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>{isAutoPiloting ? <><RefreshCw className="animate-spin" size={16} /> Sending...</> : <><Zap size={16} /> Run AI Follow-Up Campaign</>}</button>
          </div>
       </div>

       {/* View Container */}
       <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'list' ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
             
             {/* Mobile Card List View (Visible only on mobile) */}
             <div className="block md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {displayContacts.map(c => (
                    <MobileContactCard 
                        key={c.id} 
                        contact={c} 
                        onClick={() => setSelectedContact(c)} 
                        onQuickAction={handleQuickAction} 
                    />
                ))}
                {displayContacts.length === 0 && <div className="text-center text-slate-400 py-10">No contacts found</div>}
             </div>

             {/* Desktop Table View (Visible only on md+) */}
             <div className="hidden md:block flex-1 overflow-y-auto">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 border-b sticky top-0 z-10">
                    <tr>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Company</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">AI Score</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Value</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Last Contact</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {displayContacts.map(c => {
                     const isStale = checkIsStale(c.lastContact);
                     // Prioritize AI Score if exists, else heuristic
                     const score = c.aiScore !== undefined ? c.aiScore : calculateWinProbability(c);
                     
                     return (
                       <tr key={c.id} onClick={() => setSelectedContact(c)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                         <td className="p-4 font-bold text-slate-900">{c.name}</td>
                         <td className="p-4 text-slate-600">{c.company}</td>
                         <td className="p-4">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(c.status)}`}>{c.status}</span>
                         </td>
                         <td className="p-4">
                            <div className="flex items-center gap-2 group relative">
                                <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full ${score > 80 ? 'bg-orange-500' : score > 60 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${score}%`}}></div>
                                </div>
                                <span className={`text-xs font-mono font-bold ${score > 80 ? 'text-orange-500' : 'text-slate-500'} flex items-center gap-1`}>
                                    {score > 80 ? <Flame size={12} fill="currentColor"/> : score < 40 ? <Snowflake size={12} className="text-blue-300"/> : null}
                                    {score}
                                </span>
                                
                                {c.aiReason && (
                                    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                        <strong>AI Reasoning:</strong><br/>
                                        {c.aiReason}
                                    </div>
                                )}
                            </div>
                         </td>
                         <td className="p-4 text-slate-600 font-mono">${c.value.toLocaleString()}</td>
                         <td className="p-4"><div className="flex items-center gap-2"><span className={`text-sm ${isStale ? 'text-red-500 font-bold' : 'text-slate-500'}`}>{c.lastContact}</span>{isStale && <AlertCircle size={14} className="text-red-500" />}</div></td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
             <div className="flex h-full gap-4 min-w-[1000px]">
               {pipelineStages.map(col => {
                 const colContacts = displayContacts.filter(c => c.status === col.id);
                 const totalValue = colContacts.reduce((acc, c) => acc + c.value, 0);
                 return (
                   <div key={col.id} className="flex-1 flex flex-col bg-slate-50 rounded-xl border border-slate-200 h-full" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id as any)}>
                      <div className={`p-4 border-b border-slate-200 border-t-4 rounded-t-xl bg-white ${col.color}`}><div className="flex justify-between items-center mb-1"><h4 className="font-bold text-slate-800">{col.label}</h4><span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">{colContacts.length}</span></div><div className="text-xs text-slate-500 font-medium">Potential: <span className="text-slate-900 font-bold">${totalValue.toLocaleString()}</span></div></div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">{colContacts.map(c => (<KanbanCard key={c.id} contact={c} onClick={setSelectedContact} onDragStart={handleDragStart}/>))}{colContacts.length === 0 && (<div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">Drop here</div>)}</div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}
      </div>

      {selectedContact && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => { setSelectedContact(null); if(onClearSelection) onClearSelection(); }} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">{selectedContact.name.charAt(0)}</div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedContact.name}</h2>
                        <p className="text-sm text-slate-500">{selectedContact.company} • {selectedContact.source}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('whatsapp')} 
                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                        title="Quick WhatsApp"
                    >
                        <MessageCircle size={20} />
                    </button>
                    <button onClick={() => { setSelectedContact(null); if(onClearSelection) onClearSelection(); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex border-b border-slate-200 px-6 overflow-x-auto no-scrollbar">
              {['overview', 'messages', 'whatsapp', 'structuring', 'stips', 'scripts', 'checklist', 'repair', 'financials', 'underwriting', 'compliance', 'offers', 'documents', 'membership', 'rescue'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-3 px-4 text-sm font-medium border-b-2 capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    {tab === 'rescue' ? <span className="flex items-center gap-1 text-red-500"><Stethoscope size={14}/> Rescue</span> : tab === 'membership' ? <span className="flex items-center gap-1 text-pink-500"><Crown size={14}/> Membership</span> : tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                 <div className="space-y-6">
                   <TierProgressWidget contact={selectedContact} />
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => handleGenerateEmail(selectedContact)} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"><Mail className="text-slate-400 group-hover:text-blue-500 mb-2" /><span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">Draft Email</span></button>
                    <button onClick={() => handleSendAppLink(selectedContact)} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"><Smartphone className="text-slate-400 group-hover:text-emerald-500 mb-2" /><span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700">Send App Link</span></button>
                    <button onClick={() => handleAnalyzeDeal(selectedContact)} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"><BrainCircuit className="text-slate-400 group-hover:text-purple-500 mb-2" /><span className="text-xs font-medium text-slate-600 group-hover:text-purple-700">Analyze AI</span></button>
                    <button onClick={() => { setEnrichmentMode('update'); setShowEnrichmentModal(true); }} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                      <Database className="text-slate-400 group-hover:text-indigo-500 mb-2" />
                      <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700">Enrich Lead Data</span>
                    </button>
                  </div>
                  {isLoadingAi && <div className="p-4 bg-slate-50 animate-pulse text-xs text-slate-500 rounded-lg">AI Assistant is thinking...</div>}
                  {aiOutput && <div className="p-4 bg-blue-50 whitespace-pre-line text-sm border border-blue-100 rounded-lg text-slate-700">{aiOutput}</div>}
                  <ActivityTimeline contact={selectedContact} onAddActivity={handleAddActivity} />
                 </div>
              )}
              
              {activeTab === 'structuring' && <DealStructure contact={selectedContact} onUpdateContact={onUpdateContact!} />}
              {activeTab === 'stips' && <StipulationCollector contact={selectedContact} onUpdateContact={onUpdateContact!} />}
              {activeTab === 'rescue' && <DealDoctor contact={selectedContact} onUpdateContact={onUpdateContact!} />}
              {activeTab === 'membership' && <SubscriptionManager contact={selectedContact} onUpdateContact={onUpdateContact!} />}
              
              {activeTab === 'whatsapp' && (
                <div className="space-y-6">
                   <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                     <MessageCircle size={48} className="text-green-600 mx-auto mb-4" />
                     <h3 className="font-bold text-green-900 text-lg">WhatsApp Connect</h3>
                     {!whatsappDraft ? (
                       <button onClick={handleGenerateWhatsApp} disabled={isLoadingAi} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto mt-4">
                         {isLoadingAi ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16} />} Generate AI Message
                       </button>
                     ) : (
                       <div className="space-y-4 text-left mt-4"><div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm relative"><textarea value={whatsappDraft} onChange={(e) => setWhatsappDraft(e.target.value)} className="w-full text-sm text-slate-800 outline-none resize-none h-24"/><div className="absolute bottom-2 right-2 text-xs text-slate-400">{whatsappDraft.length} chars</div></div><button onClick={sendWhatsApp} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2"><Send size={18} /> Send via WhatsApp</button><button onClick={handleGenerateWhatsApp} className="w-full text-xs text-green-600 font-bold hover:underline">Regenerate Draft</button></div>
                     )}
                   </div>
                </div>
              )}

              {activeTab === 'scripts' && (
                <div className="space-y-6">
                  {/* Predicted Objections */}
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
                      <Sparkles size={18} className="text-indigo-600"/> Predicted Objections (AI)
                    </h3>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {predictedObjections.length > 0 ? (
                        predictedObjections.map((obj, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSelectPredictedObjection(obj)}
                            className="text-xs bg-white text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                          >
                            "{obj}"
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-indigo-400 italic">Click analyze to predict objections.</p>
                      )}
                    </div>
                    <button 
                      onClick={handlePredictObjections} 
                      disabled={isLoadingAi}
                      className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 w-fit"
                    >
                      {isLoadingAi ? <RefreshCw className="animate-spin" size={14}/> : <BrainCircuit size={14}/>}
                      Analyze Profile & Predict
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Mic size={18} className="text-blue-600"/> Call Script Generator</h3>
                    <div className="flex gap-2 mb-4">
                      <select value={scriptScenario} onChange={(e) => setScriptScenario(e.target.value)} className="flex-1 p-2 rounded-lg border border-slate-300 text-sm"><option>Cold Call (First Touch)</option><option>Application Follow-up</option><option>Funding Offer Review</option><option>Re-engagement (Stale Lead)</option></select>
                      <button onClick={handleGenerateScript} disabled={isLoadingAi} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Generate</button>
                    </div>
                    {generatedScript && <div className="p-4 bg-white rounded-lg border border-slate-200 text-sm leading-relaxed whitespace-pre-wrap shadow-inner h-64 overflow-y-auto">{generatedScript}</div>}
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><MessageCircle size={18} className="text-red-500"/> Live Objection Handler</h3>
                    <div className="flex gap-2 mb-4"><input type="text" placeholder="Type objection..." value={objectionInput} onChange={(e) => setObjectionInput(e.target.value)} className="flex-1 p-2 rounded-lg border border-slate-300 text-sm" /><button onClick={handleObjection} disabled={isLoadingAi || !objectionInput} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 disabled:opacity-50">Counter</button></div>
                    {objectionResponse && <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-sm text-slate-700 whitespace-pre-wrap">{objectionResponse}</div>}
                  </div>
                </div>
              )}

              {activeTab === 'messages' && <MessageCenter contact={selectedContact} onUpdateContact={onUpdateContact} currentUserRole="admin" />}
              {activeTab === 'checklist' && (
                <div className="space-y-8 animate-fade-in pb-10">
                   <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 items-start"><Info className="text-blue-500 flex-shrink-0 mt-0.5" size={18} /><p className="text-sm text-blue-800">Click the <strong>"Assign"</strong> button <UserPlus size={14} className="inline"/> to push these actionable steps to the client.</p></div>
                   
                   <div><h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3"><PlayCircle size={16} className="text-blue-500" /> Phase 1: Personal Foundation</h3><div className="space-y-2">{CHECKLIST_ITEMS.phase1_personal.map(item => (<div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"><div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleChecklistItem(selectedContact.id, item.id)}>{selectedContact.checklist[item.id] ? <CheckSquare className="text-emerald-500 flex-shrink-0" size={20} /> : <Square className="text-slate-300 flex-shrink-0" size={20} />}<div className="flex flex-col"><span className={`text-sm ${selectedContact.checklist[item.id] ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{item.label}</span></div></div><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); }} title="Assign to client" className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"><UserPlus size={14} /></button></div></div>))}</div></div>
                   
                   <div className="border-t border-slate-100 pt-6">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                        <Briefcase size={16} className="text-indigo-600" /> Phase 2: LLC Creation & Compliance
                      </h3>
                      <div className="space-y-2">
                        {CHECKLIST_ITEMS.phase2_entity.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleChecklistItem(selectedContact.id, item.id)}>
                              {selectedContact.checklist[item.id] ? <CheckSquare className="text-emerald-500 flex-shrink-0" size={20} /> : <Square className="text-slate-300 flex-shrink-0" size={20} />}
                              <div className="flex flex-col">
                                <span className={`text-sm ${selectedContact.checklist[item.id] ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{item.label}</span>
                                {item.description && <span className="text-xs text-slate-400 mt-0.5">{item.description}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={(e) => { e.stopPropagation(); }} title="Assign to client" className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"><UserPlus size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="border-t border-slate-100 pt-6"><h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3"><CreditCard size={16} className="text-purple-600" /> Phase 4.5: No-PG Revolving Accelerator</h3><div className="space-y-2">{CHECKLIST_ITEMS.phase4_no_pg.map(item => (<div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"><div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleChecklistItem(selectedContact.id, item.id)}>{selectedContact.checklist[item.id] ? <CheckSquare className="text-emerald-500 flex-shrink-0" size={20} /> : <Square className="text-slate-300 flex-shrink-0" size={20} />}<div className="flex flex-col"><span className={`text-sm ${selectedContact.checklist[item.id] ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{item.label}</span></div></div></div>))}</div></div>
                   <div className="border-t border-slate-100 pt-6"><h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3"><Landmark size={16} className="text-emerald-500" /> Phase 5: Funding Applications</h3><div className="space-y-2">{CHECKLIST_ITEMS.phase5_funding.map(item => (<div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"><div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleChecklistItem(selectedContact.id, item.id)}>{selectedContact.checklist[item.id] ? <CheckSquare className="text-emerald-500 flex-shrink-0" size={20} /> : <Square className="text-slate-300 flex-shrink-0" size={20} />}<div className="flex flex-col"><span className={`text-sm ${selectedContact.checklist[item.id] ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{item.label}</span></div></div></div>))}</div></div>
                </div>
              )}
              
              {activeTab === 'repair' && <CreditRepairAI contact={selectedContact} onUpdateContact={onUpdateContact!} />}
              {activeTab === 'financials' && <LedgerManager contact={selectedContact} onUpdateContact={onUpdateContact} />}
              {activeTab === 'compliance' && <ComplianceCenter contact={selectedContact} onUpdateContact={onUpdateContact} />}
              {activeTab === 'underwriting' && <div className="space-y-8"><CashFlowAnalyzer contact={selectedContact} onUpdateContact={onUpdateContact} /><LenderMatch contact={selectedContact} onAssignTask={handleLenderAssign} /><CreditCardMatcher contact={selectedContact} onAssignTask={handleLenderAssign} /></div>}
              {activeTab === 'offers' && <OfferManager contact={selectedContact} onUpdateContact={onUpdateContact} isAdmin={true} />}
              {activeTab === 'documents' && <DocumentVault contact={selectedContact} onUpdateContact={onUpdateContact} />}
            </div>
          </div>
        </div>
      )}
      
      {showEnrichmentModal && (
        <LeadEnrichmentModal 
          existingName={enrichmentMode === 'update' ? selectedContact?.company : ''}
          onClose={() => { setShowEnrichmentModal(false); setEnrichmentMode('create'); }}
          onCreateLead={(leadData) => {
            if (enrichmentMode === 'update' && selectedContact) {
                const updatedContact = {
                    ...selectedContact,
                    ...leadData,
                    id: selectedContact.id,
                    value: selectedContact.value,
                    status: selectedContact.status,
                    businessProfile: { 
                        ...selectedContact.businessProfile, 
                        legalName: leadData.businessProfile?.legalName || selectedContact.businessProfile?.legalName || '',
                        address: leadData.businessProfile?.address || selectedContact.businessProfile?.address || '',
                        industry: leadData.businessProfile?.industry || selectedContact.businessProfile?.industry || '',
                        website: leadData.businessProfile?.website || selectedContact.businessProfile?.website || '',
                        riskLevel: selectedContact.businessProfile?.riskLevel || 'Low',
                        taxId: selectedContact.businessProfile?.taxId || '',
                        structure: selectedContact.businessProfile?.structure || 'LLC',
                        ownershipPercentage: selectedContact.businessProfile?.ownershipPercentage || 100,
                        establishedDate: selectedContact.businessProfile?.establishedDate || '',
                        city: leadData.businessProfile?.city || selectedContact.businessProfile?.city || '',
                        state: leadData.businessProfile?.state || selectedContact.businessProfile?.state || '',
                        zip: leadData.businessProfile?.zip || selectedContact.businessProfile?.zip || ''
                    },
                    notes: (selectedContact.notes || '') + (leadData.notes ? `\n\n[Enrichment Update]:\n${leadData.notes}` : '')
                };
                if (onUpdateContact) onUpdateContact(updatedContact as Contact);
                setSelectedContact(updatedContact as Contact);
                showNotification('Enrichment Complete', 'Lead data merged from web sources.', 'success');
            } else {
                handleCreateEnrichedLead(leadData); 
            }
            setEnrichmentMode('create'); 
          }}
        />
      )}

      {/* STALE LEAD MODAL */}
      {showStaleModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
                <div className="bg-amber-100 p-6 border-b border-amber-200">
                    <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                        <AlertTriangle className="text-amber-700" size={24} /> Pipeline Health Alert
                    </h3>
                    <p className="text-amber-800 text-sm mt-2">
                        You have {staleLeads.length} leads with no activity for over 30 days. This affects your pipeline accuracy.
                    </p>
                </div>
                <div className="p-6">
                    <p className="text-sm font-bold text-slate-700 mb-2">Contacts Affected:</p>
                    <ul className="mb-6 space-y-1 max-h-40 overflow-y-auto bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm text-slate-600">
                        {staleLeads.map(c => <li key={c.id}>• {c.company} ({c.name})</li>)}
                    </ul>
                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            onClick={handleArchiveStale}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Archive size={18} /> Mark as Lost/Closed
                        </button>
                        <button 
                            onClick={handleSnoozeStale}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <Clock size={18} /> Snooze (Reset Timer)
                        </button>
                        <button 
                            onClick={() => setShowStaleModal(false)}
                            className="text-xs text-slate-400 hover:text-slate-600 text-center mt-2"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* STAGE EDITOR MODAL */}
      {showStageEditor && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in">
                <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><Settings size={18}/> Customize Pipeline</h3>
                    <button onClick={() => setShowStageEditor(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
                </div>
                <div className="p-4 space-y-3">
                    {pipelineStages.map(stage => (
                        <div key={stage.id} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
                            <span className="font-bold text-sm text-slate-700">{stage.label}</span>
                            <button onClick={() => handleRemoveStage(stage.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                        <input 
                            className="flex-1 border rounded p-2 text-sm" 
                            placeholder="New Stage Name"
                            value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                        />
                        <button onClick={handleAddStage} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"><Plus size={18}/></button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Phone Style Notification */}
      <PhoneNotification 
        show={notify.show} 
        title={notify.title}
        message={notify.message} 
        type={notify.type} 
        onClose={() => setNotify({...notify, show: false})} 
      />
    </div>
  );
};

export default CRMTable;
