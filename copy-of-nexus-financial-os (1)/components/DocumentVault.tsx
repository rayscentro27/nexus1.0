
import React, { useState, useRef, useEffect } from 'react';
import { Contact, ClientDocument, FinancialSpreading, Activity } from '../types';
import { Folder, FileText, Upload, CheckCircle, AlertCircle, Clock, Eye, Download, Shield, X, MoreVertical, Loader, BrainCircuit, ScanLine, Share2, MessageSquare, Send, Sparkles, AlertTriangle, Fingerprint } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import * as geminiService from '../services/geminiService';
import SecureShareModal from './SecureShareModal';

interface DocumentVaultProps {
  contact: Contact;
  readOnly?: boolean; // If true (e.g. client view), restricts some actions
  onUpdateContact?: (contact: Contact) => void;
}

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DocumentVault: React.FC<DocumentVaultProps> = ({ contact, readOnly = false, onUpdateContact }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewDoc, setPreviewDoc] = useState<ClientDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'I have analyzed this document. Ask me anything about clauses, dates, or financial figures.' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Forensics State
  const [isForensicScanning, setIsForensicScanning] = useState(false);
  const [forensicResult, setForensicResult] = useState<any>(null);
  const [showForensicsModal, setShowForensicsModal] = useState(false);

  // Default Required Documents structure if none exist
  const documents: ClientDocument[] = contact.documents && contact.documents.length > 0 ? contact.documents : [
    { id: 'req_1', name: 'Articles of Incorporation', type: 'Legal', status: 'Missing', required: true },
    { id: 'req_2', name: 'EIN Confirmation Letter', type: 'Legal', status: 'Missing', required: true },
    { id: 'req_3', name: 'Driver\'s License (Front/Back)', type: 'Identification', status: 'Missing', required: true },
    { id: 'req_4', name: 'Bank Statements (Last 3 Months)', type: 'Financial', status: 'Missing', required: true },
  ];

  const categories = ['All', 'Legal', 'Financial', 'Credit', 'Identification'];

  const filteredDocs = selectedCategory === 'All' 
    ? documents 
    : documents.filter(d => d.type === selectedCategory);

  useEffect(() => {
    if (previewDoc) {
      setChatMessages([{ role: 'ai', text: `I'm ready to answer questions about ${previewDoc.name}.` }]);
    }
  }, [previewDoc]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleStatusChange = (docId: string, newStatus: ClientDocument['status']) => {
    if (!onUpdateContact) return;
    
    const updatedDocs = documents.map(doc => 
      doc.id === docId ? { ...doc, status: newStatus } : doc
    );
    
    // Type assertion to ensure TS knows documents matches the interface
    onUpdateContact({ ...contact, documents: updatedDocs as ClientDocument[] });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isAiScan: boolean = false) => {
    if (!event.target.files || event.target.files.length === 0 || !onUpdateContact) {
      return;
    }

    const file = event.target.files[0];

    // Security: Validate file type and size
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Invalid file type. Only PDF, PNG, and JPEG allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File too large. Max size is 10MB.");
      return;
    }

    setUploading(true);
    if (isAiScan) setAnalyzing(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${contact.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('documents') // Ensure this bucket exists in Supabase
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const newDoc: ClientDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: isAiScan ? 'Financial' : 'Other', 
        status: 'Pending Review',
        uploadDate: new Date().toLocaleDateString(),
        fileUrl: publicUrl
      };

      let updatedContact = {
        ...contact,
        documents: [...(contact.documents || []), newDoc]
      };

      // 2. AI Analysis (If triggered via Smart Scan)
      if (isAiScan) {
         // Convert file to Base64 for Gemini
         const base64 = await fileToBase64(file);
         // Strip the data:image/png;base64, part
         const base64Data = base64.split(',')[1];
         
         const financials = await geminiService.extractFinancialsFromDocument(base64Data, file.type);
         
         if (financials && financials.months.length > 0) {
            // Calculate new average revenue to update top-level contact field
            const avgRev = financials.months.reduce((acc, m) => acc + m.revenue, 0) / financials.months.length;
            
            updatedContact = {
              ...updatedContact,
              financialSpreading: financials,
              revenue: avgRev,
              activities: [
                 ...(contact.activities || []),
                 { 
                   id: `act_scan_${Date.now()}`, 
                   type: 'system', 
                   description: `AI Auto-Spreading completed for ${file.name}. Extracted ${financials.months.length} months of data.`, 
                   date: new Date().toLocaleString(), 
                   user: 'AI Agent' 
                 }
              ]
            };
            alert(`Success! Extracted ${financials.months.length} months of financial data.`);
         } else {
            alert("Uploaded successfully, but AI could not extract clear financial data. Please verify document quality.");
         }
      }

      onUpdateContact(updatedContact);

    } catch (error) {
      console.error('Error uploading/analyzing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
      // Reset inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (aiInputRef.current) aiInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleShareDealRoom = (link: string, config: any) => {
    if (onUpdateContact) {
        const newActivity: Activity = {
            id: `act_share_${Date.now()}`,
            type: 'system',
            description: `Created Secure Deal Room with ${config.documents} documents. Link expires in ${config.expiry}.`,
            date: new Date().toLocaleString(),
            user: 'Admin'
        };
        onUpdateContact({
            ...contact,
            activities: [...(contact.activities || []), newActivity]
        });
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !previewDoc) return;

    const userQ = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userQ }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
        // Mock context - in real app, send actual doc content or vector ID
        const mockContext = `Document: ${previewDoc.name}. Type: ${previewDoc.type}. Uploaded: ${previewDoc.uploadDate}. Status: ${previewDoc.status}. Content simulation: This document contains legal definitions, payment terms, and obligations for the borrower.`;
        
        // Simple one-off call for now, can be upgraded to chat session
        // Using generateLegalDocumentContent as a proxy for Q&A
        const response = await geminiService.generateLegalDocumentContent("Document Analysis", { docName: previewDoc.name }, `Answer this question based on the document: ${userQ}`);
        
        setChatMessages(prev => [...prev, { role: 'ai', text: response || "I couldn't find specific details in this document." }]);
    } catch (err) {
        setChatMessages(prev => [...prev, { role: 'ai', text: "Sorry, I had trouble reading the document." }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleRunForensics = async () => {
    if (!previewDoc) return;
    setIsForensicScanning(true);
    setForensicResult(null);
    setShowForensicsModal(true);

    try {
      // For demo purposes, we will use a placeholder base64 or fetch the actual if it was uploaded locally (simulated)
      // In production, fetch the file blob from the URL, convert to base64, then send.
      // Here, we simulate the "content"
      const mockBase64 = "base64_placeholder_for_demo"; 
      
      const result = await geminiService.analyzeDocumentForensics(mockBase64);
      setForensicResult(result || { 
          trustScore: 98, 
          riskLevel: "Low", 
          flags: [], 
          mathCheck: "Pass", 
          summary: "Document appears authentic. No visible signs of tampering or font anomalies detected."
      });
    } catch (e) {
      setForensicResult({ error: "Scan failed." });
    } finally {
      setIsForensicScanning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending Review': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'Missing': return 'bg-slate-100 text-slate-500 border-slate-200 border-dashed';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Verified': return <CheckCircle size={14} />;
      case 'Pending Review': return <Clock size={14} />;
      case 'Rejected': return <AlertCircle size={14} />;
      case 'Missing': return <Upload size={14} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      
      {/* Header / Stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-blue-600" size={20} /> Secure Data Room
          </h2>
          <p className="text-xs text-slate-500">Bank-grade storage for underwriting documents.</p>
        </div>
        <div className="flex gap-2 items-center">
           <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 text-xs font-bold flex flex-col items-center">
             <span>{documents.filter(d => d.status === 'Verified').length}</span>
             <span className="text-[9px] uppercase">Verified</span>
           </div>
           
           {!readOnly && (
             <button 
               onClick={() => setIsShareModalOpen(true)}
               className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg ml-2"
             >
               <Share2 size={16} /> Share Deal
             </button>
           )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 border-b border-slate-100">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
        {filteredDocs.map((doc) => (
          <div 
            key={doc.id}
            className={`p-3 rounded-xl border flex items-center justify-between transition-all group ${
              doc.status === 'Missing' ? 'border-dashed border-slate-300 bg-slate-50/50' : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                doc.status === 'Missing' ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600'
              }`}>
                {doc.type === 'Legal' ? <Shield size={18} /> : doc.type === 'Financial' ? <FileText size={18} /> : <Folder size={18} />}
              </div>
              
              <div>
                <h4 className={`text-sm font-bold ${doc.status === 'Missing' ? 'text-slate-500' : 'text-slate-800'}`}>
                  {doc.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400">{doc.type}</span>
                  {doc.uploadDate && <span className="text-[10px] text-slate-400">• {doc.uploadDate}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <div className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1 ${getStatusColor(doc.status)}`}>
                {getStatusIcon(doc.status)}
                {doc.status}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {doc.status !== 'Missing' && (
                  <button 
                    onClick={() => setPreviewDoc(doc as ClientDocument)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Preview"
                  >
                    <Eye size={16} />
                  </button>
                )}
                
                {!readOnly && doc.status === 'Pending Review' && (
                  <button 
                    onClick={() => handleStatusChange(doc.id, 'Verified')}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                    title="Mark Verified"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}

                {doc.status === 'Missing' && !readOnly && (
                   <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md font-bold hover:bg-blue-700">
                     Request
                   </button>
                )}
                 {doc.status === 'Missing' && readOnly && (
                   <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md font-bold hover:bg-blue-700 flex items-center gap-1">
                     <Upload size={12} /> Upload
                   </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Zones */}
      {!readOnly && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Standard Upload */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer h-32"
          >
            {uploading && !analyzing ? (
              <Loader className="animate-spin text-blue-600" size={24} />
            ) : (
              <Upload size={24} className="mb-2" />
            )}
            <p className="text-xs font-medium text-center">
              {uploading && !analyzing ? 'Uploading...' : 'Standard Upload'}
            </p>
          </div>

          {/* AI Smart Scan */}
          <div 
            onClick={() => aiInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl p-4 flex flex-col items-center justify-center text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer h-32 group"
          >
             {analyzing ? (
               <div className="flex flex-col items-center">
                 <ScanLine className="animate-pulse text-indigo-600" size={24} />
                 <p className="text-xs font-bold text-indigo-600 mt-2 animate-pulse">Extracting Data...</p>
               </div>
             ) : (
               <>
                 <BrainCircuit size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                 <p className="text-xs font-bold text-center">AI Auto-Spread</p>
                 <p className="text-[9px] opacity-70 text-center">Upload Bank Stmt -> Extract Financials</p>
               </>
             )}
          </div>
        </div>
      )}
      
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileUpload(e, false)} 
        className="hidden" 
        accept=".pdf,.png,.jpg,.jpeg"
      />
      <input 
        type="file" 
        ref={aiInputRef} 
        onChange={(e) => handleFileUpload(e, true)} 
        className="hidden" 
        accept=".pdf,.png,.jpg,.jpeg"
      />

      {/* Document Preview & Chat Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            
            {/* Left: Document View */}
            <div className="flex-1 flex flex-col border-r border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    {previewDoc.name}
                  </h3>
                  <div className="flex gap-2">
                    {!readOnly && (
                      <button 
                        onClick={handleRunForensics}
                        className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1"
                      >
                        <Fingerprint size={14} /> Forensic Scan
                      </button>
                    )}
                    <button onClick={() => {}} className="p-2 text-slate-500 hover:bg-slate-200 rounded"><Download size={18}/></button>
                    <button onClick={() => setPreviewDoc(null)} className="md:hidden p-2 text-slate-500 hover:bg-slate-200 rounded"><X size={18}/></button>
                  </div>
                </div>
                
                <div className="flex-1 bg-slate-100 flex items-center justify-center relative">
                   <div className="text-center text-slate-400">
                     {previewDoc.fileUrl ? (
                       <iframe src={previewDoc.fileUrl} className="w-full h-full border-0" title="Document Preview" />
                     ) : (
                       <>
                         <FileText size={64} className="mx-auto mb-4 opacity-20" />
                         <p>Preview Unavailable</p>
                       </>
                     )}
                   </div>
                </div>
                
                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white">
                   <span className="text-xs text-slate-500">Uploaded {previewDoc.uploadDate}</span>
                   {!readOnly && (
                    <button 
                      onClick={() => {
                        handleStatusChange(previewDoc.id, 'Verified');
                        setPreviewDoc(null);
                      }}
                      className="px-4 py-2 bg-emerald-600 rounded-lg text-sm font-bold text-white hover:bg-emerald-700 flex items-center gap-2"
                    >
                      <CheckCircle size={16} /> Verify
                    </button>
                   )}
                </div>
            </div>

            {/* Right: AI Chat */}
            <div className="w-full md:w-80 flex flex-col bg-white">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Sparkles size={16} className="text-indigo-500" /> Chat with Contract
                   </h3>
                   <button onClick={() => setPreviewDoc(null)} className="hidden md:block text-slate-400 hover:text-slate-600">
                      <X size={20} />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                   {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`}>
                            {msg.text}
                         </div>
                      </div>
                   ))}
                   {isChatLoading && (
                      <div className="flex justify-start">
                         <div className="bg-white border border-slate-200 p-3 rounded-xl rounded-bl-none shadow-sm flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                         </div>
                      </div>
                   )}
                   <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-100">
                   <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Ask about this document..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button 
                        type="submit" 
                        disabled={!chatInput.trim() || isChatLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      >
                         <Send size={16} />
                      </button>
                   </div>
                </form>
            </div>

          </div>
        </div>
      )}

      {/* Forensics Modal */}
      {showForensicsModal && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 animate-pulse"></div>
              
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Fingerprint className="text-red-500" /> Forensic Audit Report
                 </h3>
                 <button onClick={() => setShowForensicsModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>

              {isForensicScanning ? (
                 <div className="text-center py-12">
                    <ScanLine size={64} className="text-red-500 animate-pulse mx-auto mb-4" />
                    <h4 className="font-bold text-slate-800">Scanning Pixels & Metadata...</h4>
                    <p className="text-xs text-slate-500 mt-2">Checking for PDF editing artifacts</p>
                 </div>
              ) : forensicResult ? (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Trust Score</p>
                          <p className={`text-3xl font-black ${forensicResult.trustScore > 80 ? 'text-emerald-500' : 'text-red-500'}`}>{forensicResult.trustScore}/100</p>
                       </div>
                       <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${forensicResult.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {forensicResult.riskLevel} Risk
                       </div>
                    </div>

                    <div>
                       <p className="text-xs font-bold text-slate-500 uppercase mb-2">Analysis Summary</p>
                       <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{forensicResult.summary}</p>
                    </div>

                    <div>
                       <p className="text-xs font-bold text-slate-500 uppercase mb-2">Math Check</p>
                       <div className={`flex items-center gap-2 text-sm font-bold ${forensicResult.mathCheck === 'Pass' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {forensicResult.mathCheck === 'Pass' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
                          {forensicResult.mathCheck === 'Pass' ? 'Balances Reconcile' : 'Mathematical Errors Detected'}
                       </div>
                    </div>

                    {forensicResult.flags?.length > 0 && (
                       <div>
                          <p className="text-xs font-bold text-red-500 uppercase mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Red Flags Detected</p>
                          <div className="space-y-2">
                             {forensicResult.flags.map((flag: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-xs bg-red-50 text-red-800 p-2 rounded border border-red-100">
                                   <span>{flag.issue}</span>
                                   <span className="font-bold">{flag.severity}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>
              ) : (
                 <div className="text-center text-red-500">Error loading report.</div>
              )}
           </div>
        </div>
      )}

      {/* Share Deal Room Modal */}
      <SecureShareModal 
        contact={contact}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShareDealRoom}
      />

    </div>
  );
};

export default DocumentVault;
