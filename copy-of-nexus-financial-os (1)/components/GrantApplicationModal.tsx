
import React, { useState } from 'react';
import { Contact, Grant } from '../types';
import { X, Sparkles, Save, RefreshCw, Copy, CheckCircle, Briefcase, Calendar, DollarSign, Building } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface GrantApplicationModalProps {
  grant: Grant;
  contact?: Contact;
  onClose: () => void;
  onUpdate: (grant: Grant) => void;
}

const GrantApplicationModal: React.FC<GrantApplicationModalProps> = ({ grant, contact, onClose, onUpdate }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [status, setStatus] = useState<Grant['status']>(grant.status);
  
  // Context Data (User can edit this)
  const [contextData, setContextData] = useState({
    company: contact?.company || '',
    industry: contact?.businessProfile?.industry || '',
    revenue: contact?.revenue?.toString() || '',
    founded: contact?.businessProfile?.establishedDate || ''
  });
  
  const [showContext, setShowContext] = useState(false);

  const handleDraft = async () => {
    if (!question) return;
    setIsDrafting(true);
    // Use the context data from the form state, allowing overrides
    const draft = await geminiService.draftGrantAnswer(question, contextData, grant.name);
    setAnswer(draft);
    setIsDrafting(false);
  };

  const handleSave = () => {
    onUpdate({ ...grant, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="bg-emerald-900 p-6 text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-400" /> Application Assistant
            </h2>
            <p className="text-emerald-200 text-sm mt-1">{grant.name}</p>
          </div>
          <button onClick={onClose} className="relative z-10 text-emerald-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
          
          {/* Header Background Pattern */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Sparkles size={100} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 relative">
           
           {/* Background Image Watermark */}
           <div 
             className="absolute inset-0 pointer-events-none opacity-[0.03] bg-center bg-cover"
             style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop")' }}
           ></div>

           <div className="relative z-10">
               {/* Status */}
               <div className="mb-6 flex items-center gap-4">
                  <label className="text-sm font-bold text-slate-600">Application Status:</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold"
                  >
                     <option value="Identified">Identified</option>
                     <option value="Drafting">Drafting</option>
                     <option value="Submitted">Submitted</option>
                     <option value="Won">Won</option>
                     <option value="Lost">Lost</option>
                  </select>
               </div>

               {/* Business Context Section */}
               <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                  <button 
                    onClick={() => setShowContext(!showContext)}
                    className="flex items-center justify-between w-full text-left"
                  >
                     <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Briefcase size={16} className="text-blue-500" /> Business Context
                     </span>
                     <span className="text-xs text-blue-600 font-medium hover:underline">
                        {showContext ? 'Hide' : 'Edit'}
                     </span>
                  </button>
                  
                  {showContext && (
                     <div className="grid grid-cols-2 gap-4 mt-4 animate-fade-in">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">Company Name</label>
                           <div className="relative">
                              <Building size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text" 
                                className="w-full pl-8 p-2 border border-slate-300 rounded text-sm bg-white"
                                value={contextData.company}
                                onChange={e => setContextData({...contextData, company: e.target.value})}
                                placeholder="Your Company LLC"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">Industry</label>
                           <div className="relative">
                              <Briefcase size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text" 
                                className="w-full pl-8 p-2 border border-slate-300 rounded text-sm bg-white"
                                value={contextData.industry}
                                onChange={e => setContextData({...contextData, industry: e.target.value})}
                                placeholder="e.g. Technology"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">Annual Revenue</label>
                           <div className="relative">
                              <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text" 
                                className="w-full pl-8 p-2 border border-slate-300 rounded text-sm bg-white"
                                value={contextData.revenue}
                                onChange={e => setContextData({...contextData, revenue: e.target.value})}
                                placeholder="0"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">Year Founded</label>
                           <div className="relative">
                              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text" 
                                className="w-full pl-8 p-2 border border-slate-300 rounded text-sm bg-white"
                                value={contextData.founded}
                                onChange={e => setContextData({...contextData, founded: e.target.value})}
                                placeholder="YYYY"
                              />
                           </div>
                        </div>
                     </div>
                  )}
                  {!showContext && (
                     <p className="text-xs text-slate-500 mt-2 truncate">
                        Using info for: <strong>{contextData.company || 'New Applicant'}</strong> ({contextData.industry || 'Unknown Industry'})
                     </p>
                  )}
               </div>

               {/* AI Writer */}
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800">AI Writer</h3>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Application Question</label>
                     <textarea 
                       value={question}
                       onChange={(e) => setQuestion(e.target.value)}
                       placeholder="Paste the grant question here (e.g., 'Describe how you will use the funds to impact your community')..."
                       className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                     />
                  </div>
                  <div className="flex justify-end">
                     <button 
                       onClick={handleDraft}
                       disabled={isDrafting || !question}
                       className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
                     >
                        {isDrafting ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        Draft Answer
                     </button>
                  </div>
               </div>

               {/* Result */}
               {answer && (
                 <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs font-bold text-slate-500 uppercase">Generated Draft</label>
                       <button 
                         onClick={() => navigator.clipboard.writeText(answer)}
                         className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1"
                       >
                          <Copy size={12}/> Copy
                       </button>
                    </div>
                    <div className="w-full p-6 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 leading-relaxed whitespace-pre-wrap shadow-inner">
                       {answer}
                    </div>
                 </div>
               )}
           </div>

        </div>

        <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3 relative z-20">
           <button onClick={onClose} className="px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
           <button onClick={handleSave} className="px-8 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2">
              <CheckCircle size={18} /> Save Progress
           </button>
        </div>

      </div>
    </div>
  );
};

export default GrantApplicationModal;
