
import React, { useState, useEffect } from 'react';
import { Contact, CreditMemo } from '../types';
import { FileText, Sparkles, Printer, RefreshCw, AlertTriangle, CheckCircle, ShieldCheck, Download, Users } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface CreditMemoBuilderProps {
  contacts: Contact[];
  onUpdateContact?: (contact: Contact) => void;
}

const CreditMemoBuilder: React.FC<CreditMemoBuilderProps> = ({ contacts, onUpdateContact }) => {
  const [selectedContactId, setSelectedContactId] = useState('');
  const [memo, setMemo] = useState<CreditMemo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  useEffect(() => {
    if (selectedContact && selectedContact.creditMemo) {
      setMemo(selectedContact.creditMemo);
    } else {
      setMemo(null);
    }
  }, [selectedContactId, selectedContact]);

  const handleGenerate = async () => {
    if (!selectedContact) return;
    setIsGenerating(true);
    const generatedMemo = await geminiService.generateCreditMemo(selectedContact);
    if (generatedMemo) {
      setMemo(generatedMemo);
      if (onUpdateContact) {
        onUpdateContact({ ...selectedContact, creditMemo: generatedMemo });
      }
    }
    setIsGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="text-blue-600" size={32} /> Credit Memo Builder
          </h1>
          <p className="text-slate-500 mt-2">Generate formal underwriting packets for lenders.</p>
        </div>
        <div className="flex gap-4 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
           <Users size={18} className="text-slate-400" />
           <select 
             className="bg-transparent font-bold text-slate-700 outline-none min-w-[200px]"
             value={selectedContactId}
             onChange={(e) => setSelectedContactId(e.target.value)}
           >
             <option value="">-- Select Applicant --</option>
             {contacts.map(c => <option key={c.id} value={c.id}>{c.company} ({c.name})</option>)}
           </select>
        </div>
      </div>

      {!selectedContact ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-xl">
           <FileText size={48} className="text-slate-300 mb-4" />
           <p className="text-slate-500">Select an applicant to generate a Credit Memo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           
           {/* Sidebar Actions */}
           <div className="lg:col-span-1 space-y-4 no-print">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4">Actions</h3>
                 <button 
                   onClick={handleGenerate}
                   disabled={isGenerating}
                   className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2 mb-3 disabled:opacity-70"
                 >
                    {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                    {memo ? 'Regenerate AI Memo' : 'Generate Memo'}
                 </button>
                 {memo && (
                   <button 
                     onClick={handlePrint}
                     className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 flex items-center justify-center gap-2"
                   >
                      <Printer size={18}/> Print / PDF
                   </button>
                 )}
              </div>

              {memo && (
                 <div className={`p-6 rounded-xl border-2 ${memo.recommendation === 'Approve' ? 'bg-emerald-50 border-emerald-200' : memo.recommendation === 'Decline' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">AI Recommendation</p>
                    <h3 className={`text-2xl font-black ${memo.recommendation === 'Approve' ? 'text-emerald-700' : memo.recommendation === 'Decline' ? 'text-red-700' : 'text-amber-700'}`}>
                       {memo.recommendation}
                    </h3>
                 </div>
              )}
           </div>

           {/* Document View */}
           <div className="lg:col-span-3">
              {memo ? (
                 <div className="bg-white shadow-xl border border-slate-200 p-12 min-h-[800px] print:shadow-none print:border-none print:w-full">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                       <div>
                          <h1 className="text-3xl font-serif font-bold text-slate-900">Credit Approval Memo</h1>
                          <p className="text-slate-500 mt-1">Confidential Underwriting Report</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">Date: {memo.dateCreated}</p>
                          <p className="text-sm text-slate-500">ID: {memo.id}</p>
                       </div>
                    </div>

                    {/* Applicant Info */}
                    <div className="mb-8">
                       <h3 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-200 pb-1 mb-3">Applicant Profile</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div><span className="font-bold text-slate-700">Business Name:</span> {selectedContact.company}</div>
                          <div><span className="font-bold text-slate-700">Industry:</span> {selectedContact.businessProfile?.industry}</div>
                          <div><span className="font-bold text-slate-700">Contact:</span> {selectedContact.name}</div>
                          <div><span className="font-bold text-slate-700">Time in Business:</span> {selectedContact.timeInBusiness} Months</div>
                       </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="mb-8">
                       <h3 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-200 pb-1 mb-3">Executive Summary</h3>
                       <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{memo.summary}</p>
                    </div>

                    {/* Financials */}
                    <div className="mb-8">
                       <h3 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-200 pb-1 mb-3">Financial Overview</h3>
                       <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-slate-50 p-3 border border-slate-200">
                             <p className="text-xs text-slate-500 uppercase">Avg Revenue</p>
                             <p className="font-bold text-lg">${selectedContact.revenue?.toLocaleString()}</p>
                          </div>
                          <div className="bg-slate-50 p-3 border border-slate-200">
                             <p className="text-xs text-slate-500 uppercase">DSCR</p>
                             <p className="font-bold text-lg">{memo.metrics.dscr.toFixed(2)}x</p>
                          </div>
                          <div className="bg-slate-50 p-3 border border-slate-200">
                             <p className="text-xs text-slate-500 uppercase">Free Cash Flow</p>
                             <p className="font-bold text-lg">${memo.metrics.monthlyFreeCashFlow.toLocaleString()}</p>
                          </div>
                       </div>
                    </div>

                    {/* Risk Analysis */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                       <div>
                          <h3 className="text-xs font-bold text-green-600 uppercase border-b border-green-200 pb-1 mb-3 flex items-center gap-2"><CheckCircle size={14}/> Strengths</h3>
                          <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                             {memo.strengths.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                       </div>
                       <div>
                          <h3 className="text-xs font-bold text-amber-600 uppercase border-b border-amber-200 pb-1 mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Risks & Mitigants</h3>
                          <ul className="list-disc pl-4 text-sm text-slate-700 space-y-2">
                             {memo.weaknesses.map((w, i) => (
                                <li key={i}>
                                   <span className="font-medium text-red-700">{w}</span>
                                   <br/>
                                   <span className="text-xs text-slate-500 italic">Mitigant: {memo.mitigants[i] || 'N/A'}</span>
                                </li>
                             ))}
                          </ul>
                       </div>
                    </div>

                    {/* Recommendation */}
                    <div className="border-t-2 border-slate-900 pt-6">
                       <h3 className="text-lg font-bold text-slate-900 mb-2">Final Recommendation: <span className="uppercase">{memo.recommendation}</span></h3>
                       {memo.conditions && (
                          <div className="bg-slate-50 p-4 border-l-4 border-blue-500 text-sm text-slate-700">
                             <strong>Conditions / Stipulations:</strong> {memo.conditions}
                          </div>
                       )}
                       <div className="mt-12 flex justify-between items-end">
                          <div className="text-center w-48">
                             <div className="border-b border-slate-400 mb-2"></div>
                             <p className="text-xs uppercase text-slate-500">Underwriter Signature</p>
                          </div>
                          <div className="text-center w-48">
                             <div className="border-b border-slate-400 mb-2"></div>
                             <p className="text-xs uppercase text-slate-500">Credit Officer Approval</p>
                          </div>
                       </div>
                    </div>

                 </div>
              ) : (
                 <div className="h-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
                    <p>Click "Generate Memo" to create the document.</p>
                 </div>
              )}
           </div>

        </div>
      )}

    </div>
  );
};

export default CreditMemoBuilder;
