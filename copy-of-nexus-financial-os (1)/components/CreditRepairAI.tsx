
import React, { useState } from 'react';
import { Contact, NegativeItem, ClientDocument } from '../types';
import { ShieldAlert, FileText, RefreshCw, Download, CheckCircle, Upload, Scan, ArrowRight, Gavel, ListChecks, Zap, Clock, Search, AlertTriangle, ChevronRight, Save } from 'lucide-react';
import * as geminiService from '../services/geminiService';
import { supabase } from '../lib/supabaseClient';

interface CreditRepairAIProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
}

const CreditRepairAI: React.FC<CreditRepairAIProps> = ({ contact, onUpdateContact }) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'strategy' | 'selection' | 'result'>('upload');
  const [selectedBureau, setSelectedBureau] = useState('Experian');
  const [letterContent, setLetterContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [attackMethod, setAttackMethod] = useState<'factual' | 'metro2' | 'late_removal' | 'validation'>('metro2');

  // Mock data simulation
  const defaultItems: NegativeItem[] = [
    { id: 'ni_1', creditor: 'JPMCB CARD', accountNumber: 'xxxx4321', bureau: 'Experian', status: 'Late Payment', dateReported: '2023-09-01', reasonForDispute: 'Payment was made on time but not recorded correctly.', isSelected: false },
    { id: 'ni_2', creditor: 'MIDLAND FUNDING', accountNumber: 'xxxx9988', bureau: 'Experian', status: 'Collection', dateReported: '2022-04-15', reasonForDispute: 'No contract with this debt collector.', isSelected: false },
    { id: 'ni_3', creditor: 'CAPITAL ONE', accountNumber: 'xxxx1122', bureau: 'TransUnion', status: 'Charge-Off', dateReported: '2023-01-10', reasonForDispute: 'Balance history is inaccurate.', isSelected: false },
    { id: 'ni_4', creditor: 'PORTFOLIO RCVERY', accountNumber: 'xxxx7744', bureau: 'Equifax', status: 'Collection', dateReported: '2021-11-20', reasonForDispute: 'Obsolete debt, past statute of limitations.', isSelected: false },
  ];

  const [items, setItems] = useState<NegativeItem[]>(contact.negativeItems || []);

  // STEP 1: MOCK SCANNING PROCESS
  const handleSimulateScan = () => {
    setStep('scanning');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2; // Slower, smoother scan
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        // If no items exist, populate mock items to simulate finding them
        if (items.length === 0) {
           setItems(defaultItems);
           onUpdateContact({ ...contact, negativeItems: defaultItems });
        }
        setStep('strategy'); 
      }
    }, 50);
  };

  const toggleItem = (id: string) => {
    const updatedItems = items.map(i => i.id === id ? { ...i, isSelected: !i.isSelected } : i);
    setItems(updatedItems);
    onUpdateContact({ ...contact, negativeItems: updatedItems });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const content = await geminiService.generateDisputeLetter(contact, selectedBureau, items, attackMethod);
    setLetterContent(content);
    setIsGenerating(false);
    setStep('result');
  };

  const handleSaveToVault = async () => {
    setIsSaving(true);
    const fileName = `Dispute_${selectedBureau}_${new Date().toISOString().split('T')[0]}_${Date.now()}.txt`;
    const filePath = `${contact.id}/${fileName}`;
    let publicUrl = '';

    try {
      // 1. Attempt to upload to Supabase Storage
      const blob = new Blob([letterContent], { type: 'text/plain' });
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, blob);

      if (!uploadError) {
        const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      } else {
        console.warn('Storage upload failed (using mock URL):', uploadError);
        // Fallback: Create a blob URL for immediate session use (not persistent across reloads without DB)
        publicUrl = URL.createObjectURL(blob);
      }

      // 2. Create Document Record
      const newDoc: ClientDocument = {
        id: `doc_disp_${Date.now()}`,
        name: fileName,
        type: 'Legal',
        status: 'Pending Review', // Set to pending so admin can review the AI output
        uploadDate: new Date().toLocaleDateString(),
        fileUrl: publicUrl,
        required: false,
        isEsed: false
      };

      // 3. Log Activity
      const newActivity = {
        id: `act_disp_${Date.now()}`,
        type: 'system' as const,
        description: `Generated AI Dispute Letter for ${selectedBureau} (${attackMethod})`,
        date: new Date().toLocaleString(),
        user: 'AI Agent'
      };

      // 4. Update Contact
      onUpdateContact({
        ...contact,
        documents: [...(contact.documents || []), newDoc],
        activities: [...(contact.activities || []), newActivity]
      });

      alert("Letter successfully saved to Document Vault!");

    } catch (err) {
      console.error("Error saving letter:", err);
      alert("Failed to save letter. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStrategyInfo = (method: string) => {
    switch (method) {
      case 'metro2': return { title: 'Metro 2 Compliance', desc: 'Challenges the raw data format sent to bureaus. Highly effective for removing collections and charge-offs by finding technical reporting errors.' };
      case 'factual': return { title: 'Factual Dispute', desc: 'Standard dispute challenging accuracy of dates, balances, or status. Good for mixed files with simple errors.' };
      case 'late_removal': return { title: 'Goodwill Adjustment', desc: 'Requests removal of late payments based on good standing. Best for open accounts you want to keep.' };
      case 'validation': return { title: 'Debt Validation (1692g)', desc: 'Demands the collector prove they legally own the debt with original contracts. Best for 3rd party collections.' };
      default: return { title: '', desc: '' };
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
           <h3 className="text-xl font-bold flex items-center gap-2">
             <Zap size={24} className="text-yellow-400 fill-yellow-400"/> Credit Rehab AI
           </h3>
           <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide uppercase">Powered by Gemini 1.5 Pro</p>
        </div>
        
        {/* Progress Steps */}
        <div className="relative z-10 hidden md:flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider bg-white/10 px-4 py-2 rounded-full border border-white/10">
          <span className={step === 'upload' ? 'text-white' : 'text-slate-500'}>1. Import</span> <ChevronRight size={12} className="text-slate-600"/>
          <span className={step === 'scanning' ? 'text-white' : 'text-slate-500'}>2. Scan</span> <ChevronRight size={12} className="text-slate-600"/>
          <span className={step === 'strategy' ? 'text-white' : 'text-slate-500'}>3. Strategy</span> <ChevronRight size={12} className="text-slate-600"/>
          <span className={step === 'selection' ? 'text-white' : 'text-slate-500'}>4. Select</span> <ChevronRight size={12} className="text-slate-600"/>
          <span className={step === 'result' ? 'text-emerald-400' : 'text-slate-500'}>5. Letter</span>
        </div>

        {/* Background FX */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Gavel size={120} />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-8 flex flex-col overflow-y-auto custom-scrollbar">

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-8 animate-bounce-slow border-4 border-slate-100">
              <Upload size={48} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Import Credit Report</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Upload a 3-bureau report (PDF/HTML) from IdentityIQ, SmartCredit, or PrivacyGuard. 
              <br/><span className="text-xs text-slate-400 mt-2 block">Our AI will parse thousands of data points to find actionable errors.</span>
            </p>
            
            <div 
              onClick={handleSimulateScan}
              className="w-full border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-10 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group"
            >
               <p className="font-bold text-blue-600 mb-1 group-hover:scale-105 transition-transform">Click to Upload Report</p>
               <p className="text-xs text-blue-400">or drag and drop file here</p>
            </div>
          </div>
        )}

        {/* STEP 2: SCANNING */}
        {step === 'scanning' && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
             <div className="mb-8 relative">
               <RefreshCw size={80} className="text-blue-500 animate-spin opacity-20" />
               <Scan size={32} className="text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
             </div>
             
             <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Credit Data</h3>
             <p className="text-slate-500 mb-8 font-mono text-sm h-6">
                {scanProgress < 30 ? 'Parsing Identity Header...' : 
                 scanProgress < 60 ? 'Cross-referencing Experian vs Equifax...' : 
                 scanProgress < 90 ? 'Detecting Metro 2 format errors...' : 
                 'Finalizing negative item list...'}
             </p>

             <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner border border-slate-300 relative">
               <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-full transition-all duration-100 ease-out relative" style={{ width: `${scanProgress}%` }}>
                 <div className="absolute inset-0 bg-white/30 animate-[shimmer_1.5s_infinite]"></div>
               </div>
             </div>
             
             <div className="grid grid-cols-3 gap-4 w-full mt-8">
                <div className={`flex flex-col items-center p-4 rounded-xl border transition-all ${scanProgress > 30 ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-100 border-transparent opacity-50'}`}>
                  <div className={`w-3 h-3 rounded-full mb-2 ${scanProgress > 30 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className="font-bold text-sm text-slate-700">Experian</span>
                </div>
                <div className={`flex flex-col items-center p-4 rounded-xl border transition-all ${scanProgress > 60 ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-100 border-transparent opacity-50'}`}>
                  <div className={`w-3 h-3 rounded-full mb-2 ${scanProgress > 60 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className="font-bold text-sm text-slate-700">Equifax</span>
                </div>
                <div className={`flex flex-col items-center p-4 rounded-xl border transition-all ${scanProgress > 90 ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-100 border-transparent opacity-50'}`}>
                  <div className={`w-3 h-3 rounded-full mb-2 ${scanProgress > 90 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className="font-bold text-sm text-slate-700">TransUnion</span>
                </div>
             </div>
          </div>
        )}

        {/* STEP 3: STRATEGY SELECTION */}
        {step === 'strategy' && (
          <div className="max-w-4xl mx-auto w-full">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Select Attack Strategy</h3>
            <p className="text-slate-500 mb-8">How do you want the AI to challenge these negative items?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'metro2', label: 'Metro 2 Compliance', icon: <Zap size={24} className="text-purple-500" /> },
                { id: 'factual', label: 'Factual Dispute', icon: <ListChecks size={24} className="text-blue-500" /> },
                { id: 'validation', label: 'Debt Validation', icon: <ShieldAlert size={24} className="text-red-500" /> },
                { id: 'late_removal', label: 'Goodwill Adjustment', icon: <Clock size={24} className="text-emerald-500" /> },
              ].map((method) => {
                const info = getStrategyInfo(method.id);
                return (
                  <div 
                    key={method.id}
                    onClick={() => setAttackMethod(method.id as any)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-3 relative overflow-hidden group ${
                      attackMethod === method.id 
                        ? 'border-blue-600 bg-blue-50 shadow-md' 
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-white rounded-lg shadow-sm">{method.icon}</div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        attackMethod === method.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {attackMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg ${attackMethod === method.id ? 'text-blue-900' : 'text-slate-800'}`}>{method.label}</h4>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">{info.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setStep('selection')}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg"
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ITEM SELECTION */}
        {step === 'selection' && (
          <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                 <h3 className="text-2xl font-bold text-slate-800">Select Items to Dispute</h3>
                 <p className="text-slate-500 text-sm mt-1">
                   Strategy: <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">{getStrategyInfo(attackMethod).title}</span>
                 </p>
              </div>
              <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                 {['Experian', 'Equifax', 'TransUnion'].map(bureau => (
                   <button
                    key={bureau}
                    onClick={() => setSelectedBureau(bureau)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      selectedBureau === bureau 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                   >
                     {bureau}
                   </button>
                 ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-6">
              {items.filter(i => i.bureau === selectedBureau).length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                   <CheckCircle size={40} className="text-emerald-400 mb-2 opacity-50" />
                   <p className="text-slate-400 font-medium">No negative items found for {selectedBureau}.</p>
                   <p className="text-xs text-slate-400">That's good news!</p>
                 </div>
              ) : (
                 items.filter(i => i.bureau === selectedBureau).map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItem(item.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group relative overflow-hidden ${
                      item.isSelected 
                        ? 'border-blue-500 bg-white shadow-md' 
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    {item.isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>}
                    
                    <div className="flex items-center gap-4 pl-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                        item.isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-50 border-slate-300 group-hover:border-blue-400'
                      }`}>
                        {item.isSelected && <CheckCircle size={14} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{item.creditor}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Acct #{item.accountNumber}</span>
                          <span>Reported: {item.dateReported}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${
                        item.status === 'Collection' ? 'bg-red-100 text-red-700' : 
                        item.status === 'Charge-Off' ? 'bg-orange-100 text-orange-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                      {item.reasonForDispute && (
                        <p className="text-xs text-slate-400 mt-2 max-w-[250px] truncate">{item.reasonForDispute}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <button onClick={() => setStep('strategy')} className="text-slate-500 hover:text-slate-800 text-sm font-medium">Back to Strategy</button>
              <button 
                 onClick={handleGenerate}
                 disabled={isGenerating || !items.some(i => i.isSelected)}
                 className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg transition-transform active:scale-95"
               >
                 {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Gavel size={18} />}
                 {isGenerating ? 'AI Drafting Letter...' : 'Generate Legal Dispute'}
               </button>
            </div>
          </div>
        )}

        {/* STEP 5: RESULT */}
        {step === 'result' && (
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
             <div className="p-4 border-b border-slate-100 bg-emerald-50 flex justify-between items-center">
               <div className="flex items-center gap-2 text-emerald-800 font-bold">
                 <CheckCircle size={20} /> Dispute Letter Generated
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => setStep('selection')}
                    className="px-4 py-2 text-slate-600 text-sm font-bold hover:bg-white/50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={handleSaveToVault}
                    disabled={isSaving}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : 'Save to Vault'}
                  </button>
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-colors">
                    <Download size={16} /> Download PDF
                  </button>
               </div>
             </div>
             <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
               <div className="bg-white p-8 md:p-16 rounded-xl shadow-lg max-w-3xl mx-auto border border-slate-200 min-h-[800px] relative">
                 {/* Paper watermark effect */}
                 <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-transparent"></div>
                 
                 <pre className="whitespace-pre-wrap font-serif text-sm text-slate-800 leading-relaxed">
                   {letterContent}
                 </pre>
                 
                 <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-sans">
                   <span>Generated by Nexus AI</span>
                   <span>Strategy: {getStrategyInfo(attackMethod).title}</span>
                 </div>
               </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreditRepairAI;
