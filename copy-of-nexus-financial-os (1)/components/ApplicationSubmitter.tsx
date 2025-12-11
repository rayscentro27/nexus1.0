
import React, { useState } from 'react';
import { Contact, Lender, ApplicationSubmission } from '../types';
import { Send, CheckCircle, Clock, AlertTriangle, FileText, Upload, RefreshCw, Briefcase, ChevronRight, Play } from 'lucide-react';
import * as geminiService from '../services/geminiService';

// Mock Lenders for local use if not passed via props or context
const MOCK_LENDERS: Lender[] = [
  { id: 'l_bluevine', name: 'Bluevine', logo: '🟦', type: 'Fintech', minScore: 625, minRevenue: 10000, minTimeInBusinessMonths: 6, maxAmount: 250000, description: 'Fast LOC', applicationLink: '#' },
  { id: 'l_chase', name: 'Chase Ink', logo: '🏦', type: 'Bank', minScore: 700, minRevenue: 0, minTimeInBusinessMonths: 0, maxAmount: 100000, description: 'Business Credit Card', applicationLink: '#' },
  { id: 'l_ondeck', name: 'OnDeck', logo: '🟧', type: 'Fintech', minScore: 600, minRevenue: 8500, minTimeInBusinessMonths: 12, maxAmount: 150000, description: 'Term Loans', applicationLink: '#' },
  { id: 'l_kapitus', name: 'Kapitus', logo: '🟩', type: 'Fintech', minScore: 550, minRevenue: 25000, minTimeInBusinessMonths: 24, maxAmount: 500000, description: 'Flexible Funding', applicationLink: '#' }
];

interface ApplicationSubmitterProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
}

const ApplicationSubmitter: React.FC<ApplicationSubmitterProps> = ({ contacts, onUpdateContact }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'tracker'>('new');
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedLenderIds, setSelectedLenderIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPackets, setGeneratedPackets] = useState<ApplicationSubmission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tracker State (derived from contacts)
  const allSubmissions = contacts.flatMap(c => c.submissions || []);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const handleToggleLender = (id: string) => {
    if (selectedLenderIds.includes(id)) {
      setSelectedLenderIds(selectedLenderIds.filter(lid => lid !== id));
    } else {
      setSelectedLenderIds([...selectedLenderIds, id]);
    }
  };

  const handleGeneratePackets = async () => {
    if (!selectedContact || selectedLenderIds.length === 0) return;
    setIsGenerating(true);
    
    const newPackets: ApplicationSubmission[] = [];
    
    for (const lenderId of selectedLenderIds) {
      const lender = MOCK_LENDERS.find(l => l.id === lenderId);
      if (lender) {
        const coverLetter = await geminiService.generateApplicationCoverLetter(selectedContact, lender.name);
        newPackets.push({
          id: `sub_${Date.now()}_${lenderId}`,
          contactId: selectedContact.id,
          contactName: selectedContact.company,
          lenderId: lender.id,
          lenderName: lender.name,
          status: 'Draft',
          dateSent: new Date().toLocaleDateString(),
          coverLetter: coverLetter
        });
      }
    }
    
    setGeneratedPackets(newPackets);
    setIsGenerating(false);
    setStep(3);
  };

  const handleSubmitAll = () => {
    if (!selectedContact) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
        // Mark all as sent
        const sentPackets = generatedPackets.map(p => ({ ...p, status: 'Sent' as const }));
        
        // Update Contact
        onUpdateContact({
            ...selectedContact,
            submissions: [...(selectedContact.submissions || []), ...sentPackets],
            status: 'Active', // Move to active underwriting
            activities: [
                ...(selectedContact.activities || []),
                {
                    id: `act_sub_${Date.now()}`,
                    type: 'system',
                    description: `Submitted applications to ${selectedLenderIds.length} lenders via Broker Bot.`,
                    date: new Date().toLocaleString(),
                    user: 'Admin'
                }
            ]
        });

        setIsSubmitting(false);
        alert("Applications blasted successfully!");
        
        // Reset
        setStep(1);
        setSelectedContactId('');
        setSelectedLenderIds([]);
        setGeneratedPackets([]);
        setActiveTab('tracker');
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Send className="text-blue-600" size={32} /> Application Submitter
          </h1>
          <p className="text-slate-500 mt-2">AI-powered multi-lender submission engine.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
           <button onClick={() => setActiveTab('new')} className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'new' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>New Submission</button>
           <button onClick={() => setActiveTab('tracker')} className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'tracker' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Tracker Dashboard</button>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
           
           {/* Steps Sidebar / Topbar */}
           <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6">
              <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-4 md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar">
                 <div className={`flex items-center gap-2 md:gap-3 flex-shrink-0 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>1</div>
                    <span className="font-bold text-sm hidden md:inline">Select Deal</span>
                    <span className="font-bold text-sm md:hidden">Select</span>
                 </div>
                 <div className={`w-8 md:w-0.5 h-0.5 md:h-8 bg-slate-300 md:ml-4 flex-shrink-0 ${step > 1 ? 'bg-blue-600' : ''}`}></div>
                 <div className={`flex items-center gap-2 md:gap-3 flex-shrink-0 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>2</div>
                    <span className="font-bold text-sm hidden md:inline">Choose Lenders</span>
                    <span className="font-bold text-sm md:hidden">Lenders</span>
                 </div>
                 <div className={`w-8 md:w-0.5 h-0.5 md:h-8 bg-slate-300 md:ml-4 flex-shrink-0 ${step > 2 ? 'bg-blue-600' : ''}`}></div>
                 <div className={`flex items-center gap-2 md:gap-3 flex-shrink-0 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>3</div>
                    <span className="font-bold text-sm hidden md:inline">Review Packets</span>
                    <span className="font-bold text-sm md:hidden">Review</span>
                 </div>
              </div>
           </div>

           {/* Step Content */}
           <div className="flex-1 p-4 md:p-8 overflow-y-auto">
              
              {/* STEP 1 */}
              {step === 1 && (
                 <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800">Select a Deal to Submit</h2>
                    <div className="grid grid-cols-1 gap-4">
                       {contacts.filter(c => ['Lead', 'Active', 'Negotiation'].includes(c.status)).map(contact => (
                          <div 
                            key={contact.id}
                            onClick={() => setSelectedContactId(contact.id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedContactId === contact.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 hover:border-blue-300'}`}
                          >
                             <div>
                                <h3 className="font-bold text-slate-900">{contact.company}</h3>
                                <p className="text-sm text-slate-500">{contact.name} • ${contact.revenue?.toLocaleString()}/mo Revenue</p>
                             </div>
                             <div className="text-right">
                                <span className="text-xs font-bold bg-slate-200 px-2 py-1 rounded text-slate-600">{contact.status}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                    <div className="flex justify-end pt-6">
                       <button 
                         disabled={!selectedContactId}
                         onClick={() => setStep(2)}
                         className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-all"
                       >
                          Next Step <ChevronRight size={18} />
                       </button>
                    </div>
                 </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                 <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800">Select Lenders</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {MOCK_LENDERS.map(lender => (
                          <div 
                            key={lender.id}
                            onClick={() => handleToggleLender(lender.id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedLenderIds.includes(lender.id) ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-200 hover:border-emerald-300'}`}
                          >
                             <div className="text-2xl">{lender.logo}</div>
                             <div className="flex-1">
                                <h3 className="font-bold text-slate-900">{lender.name}</h3>
                                <p className="text-xs text-slate-500">{lender.type}</p>
                             </div>
                             {selectedLenderIds.includes(lender.id) && <CheckCircle size={20} className="text-emerald-600" />}
                          </div>
                       ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-slate-100 mt-6 gap-3">
                       <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 font-bold order-2 sm:order-1">Back</button>
                       <button 
                         disabled={selectedLenderIds.length === 0 || isGenerating}
                         onClick={handleGeneratePackets}
                         className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all order-1 sm:order-2"
                       >
                          {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Briefcase size={18} />}
                          {isGenerating ? 'Generating Packets...' : 'Generate AI Packets'}
                       </button>
                    </div>
                 </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                 <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-800">Review & Submit</h2>
                    <p className="text-slate-500 text-sm">Review the AI-generated cover letters before blasting.</p>
                    
                    <div className="space-y-4">
                       {generatedPackets.map((packet, idx) => (
                          <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">{MOCK_LENDERS.find(l=>l.id===packet.lenderId)?.logo} {packet.lenderName}</h4>
                                <span className="text-xs font-bold text-slate-400 uppercase bg-white border border-slate-200 px-2 py-1 rounded">Draft</span>
                             </div>
                             <textarea 
                               className="w-full h-32 p-3 text-sm text-slate-600 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                               defaultValue={packet.coverLetter}
                             />
                          </div>
                       ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-slate-100 mt-6 gap-3">
                       <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-800 font-bold order-2 sm:order-1">Back</button>
                       <button 
                         onClick={handleSubmitAll}
                         disabled={isSubmitting}
                         className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-emerald-200 order-1 sm:order-2"
                       >
                          {isSubmitting ? <RefreshCw className="animate-spin" size={18}/> : <Send size={18} />}
                          {isSubmitting ? 'Blasting...' : `Submit ${generatedPackets.length} Applications`}
                       </button>
                    </div>
                 </div>
              )}

           </div>
        </div>
      )}

      {activeTab === 'tracker' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-slate-500"/> Submission Pipeline</h3>
           </div>
           
           {allSubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No active submissions.</div>
           ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                      <tr>
                         <th className="px-6 py-4 whitespace-nowrap">Applicant</th>
                         <th className="px-6 py-4 whitespace-nowrap">Lender</th>
                         <th className="px-6 py-4 whitespace-nowrap">Date Sent</th>
                         <th className="px-6 py-4 whitespace-nowrap">Status</th>
                         <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {allSubmissions.map(sub => (
                         <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{sub.contactName}</td>
                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{sub.lenderName}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{sub.dateSent}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  sub.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                                  sub.status === 'Underwriting' ? 'bg-amber-100 text-amber-700' :
                                  sub.status === 'Offer' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-slate-100 text-slate-600'
                               }`}>
                                  {sub.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                               <button className="text-blue-600 font-bold text-xs hover:underline">Update Status</button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           )}
        </div>
      )}

    </div>
  );
};

export default ApplicationSubmitter;
