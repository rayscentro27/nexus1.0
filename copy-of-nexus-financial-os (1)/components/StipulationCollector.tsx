
import React, { useState, useRef } from 'react';
import { Contact, Stipulation, ClientDocument } from '../types';
import { ClipboardList, Plus, Trash2, Upload, CheckCircle, AlertTriangle, RefreshCw, Send, ScanLine, FileText, Loader } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface StipulationCollectorProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
}

const StipulationCollector: React.FC<StipulationCollectorProps> = ({ contact, onUpdateContact }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stips, setStips] = useState<Stipulation[]>(contact.stipulations || []);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!inputText) return;
    setIsProcessing(true);
    const newStips = await geminiService.extractStipsFromText(inputText);
    const updatedStips = [...stips, ...newStips];
    setStips(updatedStips);
    onUpdateContact({ ...contact, stipulations: updatedStips });
    setIsProcessing(false);
    setInputText('');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !uploadTargetId) return;
    
    const file = e.target.files[0];
    setVerifyingId(uploadTargetId);

    // 1. Simulate Upload
    // In a real app, upload to Supabase Storage here
    const mockUrl = URL.createObjectURL(file);
    
    // 2. AI Verification
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
       const base64 = (reader.result as string).split(',')[1];
       const targetStip = stips.find(s => s.id === uploadTargetId);
       
       const context = { company: contact.company, contact: contact.name };
       const verification = await geminiService.verifyDocumentContent(base64, file.type, targetStip?.name || 'Document', context);
       
       const updatedStips = stips.map(s => {
         if (s.id === uploadTargetId) {
           return {
             ...s,
             status: verification.isMatch ? 'Verified' : 'Uploaded',
             uploadDate: new Date().toLocaleDateString(),
             fileUrl: mockUrl,
             aiVerification: verification
           } as Stipulation;
         }
         return s;
       });

       setStips(updatedStips);
       onUpdateContact({ ...contact, stipulations: updatedStips });
       setVerifyingId(null);
       setUploadTargetId(null);
    };
  };

  const handleDelete = (id: string) => {
    const updated = stips.filter(s => s.id !== id);
    setStips(updated);
    onUpdateContact({ ...contact, stipulations: updated });
  };

  const handleRequestClient = () => {
    // Simulate sending email
    alert(`Email sent to ${contact.email} with secure upload link for ${stips.filter(s => s.status === 'Pending').length} items.`);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      
      {/* Input Area */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ScanLine className="text-blue-600" /> AI Stipulation Extractor
         </h3>
         <div className="flex gap-4">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste lender approval email here (e.g. 'We need voided check, DL, and last 3 bank statements')..."
              className="flex-1 p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
            />
            <button 
              onClick={handleExtract}
              disabled={isProcessing || !inputText}
              className="px-6 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex flex-col items-center justify-center gap-1 min-w-[120px]"
            >
               {isProcessing ? <Loader className="animate-spin" /> : <RefreshCw size={24} />}
               <span className="text-xs">Extract Stips</span>
            </button>
         </div>
      </div>

      {/* Checklist */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
         <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h4 className="font-bold text-slate-700 flex items-center gap-2">
               <ClipboardList size={18} /> Required Documents
            </h4>
            {stips.length > 0 && (
               <button onClick={handleRequestClient} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-200 flex items-center gap-1">
                  <Send size={14} /> Request from Client
               </button>
            )}
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {stips.length === 0 ? (
               <div className="text-center py-10 text-slate-400">
                  <FileText size={48} className="mx-auto mb-2 opacity-20" />
                  <p>No stipulations added yet.</p>
               </div>
            ) : (
               stips.map(stip => (
                  <div key={stip.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                           stip.status === 'Verified' ? 'bg-emerald-100 text-emerald-600' :
                           stip.status === 'Uploaded' ? 'bg-blue-100 text-blue-600' :
                           'bg-slate-100 text-slate-400'
                        }`}>
                           {verifyingId === stip.id ? <Loader className="animate-spin" size={20}/> : 
                            stip.status === 'Verified' ? <CheckCircle size={20}/> : 
                            stip.status === 'Uploaded' ? <FileText size={20}/> : <AlertTriangle size={20}/>}
                        </div>
                        <div>
                           <h5 className="font-bold text-slate-800">{stip.name}</h5>
                           <p className="text-xs text-slate-500">{stip.description || 'No description'}</p>
                           {stip.aiVerification && (
                              <div className={`mt-1 text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1 ${stip.aiVerification.isMatch ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                 {stip.aiVerification.isMatch ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                                 AI Confidence: {stip.aiVerification.confidence}% • {stip.aiVerification.reason}
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        {stip.status === 'Pending' && (
                           <button 
                             onClick={() => { setUploadTargetId(stip.id); fileInputRef.current?.click(); }}
                             className="text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium flex items-center gap-2"
                           >
                              <Upload size={14} /> Upload
                           </button>
                        )}
                        <button onClick={() => handleDelete(stip.id)} className="text-slate-300 hover:text-red-500">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleUpload} />
    </div>
  );
};

export default StipulationCollector;
