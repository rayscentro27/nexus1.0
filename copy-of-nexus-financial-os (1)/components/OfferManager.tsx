import React, { useState, useRef } from 'react';
import { Contact, FundingOffer, Invoice, ClientDocument } from '../types';
import { DollarSign, Calendar, Percent, CheckCircle, Send, FileText, PenTool, Loader, Shield, AlertTriangle, Scale, Upload, X, PartyPopper, BarChart3, ArrowRight, CheckSquare, Square, Sparkles } from 'lucide-react';
import * as geminiService from '../services/geminiService';
import SmartContractSigner from './SmartContractSigner';

interface OfferManagerProps {
  contact: Contact;
  onUpdateContact?: (contact: Contact) => void;
  isAdmin?: boolean;
}

const OfferManager: React.FC<OfferManagerProps> = ({ contact, onUpdateContact, isAdmin = false }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newOffer, setNewOffer] = useState<Partial<FundingOffer>>({ lenderName: '', amount: 0, term: '', rate: '', payment: 'Monthly', paymentAmount: 0, stips: '' });
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [signingOffer, setSigningOffer] = useState<FundingOffer | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Comparison State
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedOfferIdForUpload, setSelectedOfferIdForUpload] = useState<string | null>(null);

  const handleCreateOffer = () => {
    if (!onUpdateContact || !newOffer.amount) return;
    const offer: FundingOffer = { id: `off_${Date.now()}`, lenderName: newOffer.lenderName || 'Unknown', amount: newOffer.amount || 0, term: newOffer.term || '', rate: newOffer.rate || '', payment: newOffer.payment || 'Monthly', paymentAmount: newOffer.paymentAmount || 0, status: 'Sent', dateSent: new Date().toLocaleDateString(), stips: newOffer.stips };
    const newActivity = { id: `act_off_${Date.now()}`, type: 'system' as const, description: `Funding Offer Sent: $${offer.amount.toLocaleString()} from ${offer.lenderName}`, date: new Date().toLocaleString(), user: 'Admin' };
    onUpdateContact({ ...contact, offers: [...(contact.offers || []), offer], activities: [...(contact.activities || []), newActivity], status: 'Negotiation' });
    setIsCreating(false);
  };

  const handleSignComplete = (signature: string) => {
    if (!onUpdateContact || !signingOffer) return;
    
    // 1. Close Modal
    const signedOfferId = signingOffer.id;
    setSigningOffer(null);

    // 2. Trigger Celebration
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);

    // 3. Update Offer (Status + Signature)
    const updatedOffers = contact.offers?.map(o => o.id === signedOfferId ? { 
        ...o, 
        status: 'Accepted' as const,
        signature: signature,
        signedDate: new Date().toLocaleDateString()
    } : o);

    // 4. Create Success Fee Invoice
    const acceptedOffer = contact.offers?.find(o => o.id === signedOfferId);
    const newInvoice: Invoice = { 
        id: `inv_fee_${Date.now()}`, 
        amount: (acceptedOffer?.amount || 0) * 0.10, 
        date: new Date().toISOString().split('T')[0], 
        dueDate: new Date().toISOString().split('T')[0], 
        status: 'Pending', 
        description: `Success Fee - ${signingOffer.lenderName} Funding` 
    };

    // 5. Auto-Vault the "Signed Contract" (Simulated)
    const signedDoc: ClientDocument = {
        id: `doc_sign_${Date.now()}`,
        name: `Executed_Contract_${signingOffer.lenderName}.pdf`,
        type: 'Contract',
        status: 'Signed',
        uploadDate: new Date().toLocaleDateString(),
        fileUrl: '#', // In real app, this would be the generated PDF URL
        isEsed: true
    };

    // 6. Push Update
    onUpdateContact({ 
        ...contact, 
        offers: updatedOffers, 
        invoices: [...(contact.invoices || []), newInvoice], 
        documents: [...(contact.documents || []), signedDoc],
        status: 'Closed', 
        notifications: [...(contact.notifications || []), { id: `notif_fund_${Date.now()}`, title: 'Deal Funded! 🎉', message: `Congratulations! Your contract with ${signingOffer.lenderName} is signed and vaulted.`, date: 'Just now', read: false, type: 'success' }],
        activities: [...(contact.activities || []), { id: `act_sign_${Date.now()}`, type: 'system', description: `Client electronically signed offer from ${signingOffer.lenderName}. Contract auto-vaulted.`, date: new Date().toLocaleString(), user: 'System' }]
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !selectedOfferIdForUpload || !onUpdateContact) return;
    
    const file = event.target.files[0];
    const offerId = selectedOfferIdForUpload;
    setIsAnalyzing(offerId);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const analysis = await geminiService.analyzeContract(base64);
        
        if (analysis) {
           const updatedOffers = contact.offers?.map(o => o.id === offerId ? { ...o, aiAnalysis: analysis } : o);
           onUpdateContact({ ...contact, offers: updatedOffers });
        } else {
           alert("Contract analysis failed. Please ensure the PDF is readable.");
        }
        setIsAnalyzing(null);
        setSelectedOfferIdForUpload(null);
      };
    } catch (e) {
      console.error(e);
      setIsAnalyzing(null);
    }
  };

  const toggleComparisonSelection = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(oid => oid !== id));
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, id]);
      } else {
        alert("You can compare up to 3 offers at a time.");
      }
    }
  };

  const activeOffers = contact.offers || [];
  const comparisonOffers = activeOffers.filter(o => selectedForCompare.includes(o.id));

  // --- COMPARISON LOGIC ---
  const getBestOffer = () => {
    if (comparisonOffers.length === 0) return null;
    // Simple logic: Lowest Cost of Capital
    return comparisonOffers.reduce((prev, curr) => {
       const prevCost = (prev.amount * Number(prev.rate)) - prev.amount; // Simplified cost calc
       const currCost = (curr.amount * Number(curr.rate)) - curr.amount;
       return prevCost < currCost ? prev : curr;
    });
  };

  const getLowestPayment = () => {
    if (comparisonOffers.length === 0) return null;
    return comparisonOffers.reduce((prev, curr) => prev.paymentAmount < curr.paymentAmount ? prev : curr);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm animate-pulse"></div>
            <div className="z-10 text-center animate-bounce-slow">
                <PartyPopper size={120} className="text-emerald-500 mx-auto mb-4" />
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">DEAL SECURED!</h2>
                <p className="text-xl text-slate-600 mt-2">Contract signed & vaulted successfully.</p>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 bg-slate-50/95 backdrop-blur z-20 py-2 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText size={20} className="text-blue-600" /> {isAdmin ? 'Manage Funding Offers' : 'Your Funding Offers'}</h3>
            {selectedForCompare.length > 0 && <p className="text-xs text-blue-600 font-bold">{selectedForCompare.length} selected for comparison</p>}
          </div>
          <div className="flex gap-2">
            {selectedForCompare.length > 1 && (
              <button onClick={() => setShowComparison(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-2 animate-fade-in">
                <Scale size={14} /> Compare Selected
              </button>
            )}
            {isAdmin && !isCreating && (<button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2"><PenTool size={14} /> Create Offer</button>)}
          </div>
      </div>
      
      {isCreating && isAdmin && (
        <div className="bg-slate-50 p-6 rounded-xl border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Lender Name</label><input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={newOffer.lenderName} onChange={e => setNewOffer({...newOffer, lenderName: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Amount</label><input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={newOffer.amount} onChange={e => setNewOffer({...newOffer, amount: Number(e.target.value)})} /></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Term</label><input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={newOffer.term} onChange={e => setNewOffer({...newOffer, term: e.target.value})} placeholder="e.g. 12 Months" /></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Rate / Factor</label><input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={newOffer.rate} onChange={e => setNewOffer({...newOffer, rate: e.target.value})} placeholder="e.g. 1.25" /></div>
            </div>
            <button onClick={handleCreateOffer} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"><Send size={16} /> Send Offer</button>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {activeOffers.map(offer => (
          <div key={offer.id} className={`rounded-xl border shadow-sm p-6 relative overflow-hidden transition-all hover:shadow-md ${offer.status === 'Accepted' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
            
            {/* Selection Checkbox */}
            {offer.status !== 'Accepted' && (
              <div className="absolute top-4 right-4">
                 <button onClick={() => toggleComparisonSelection(offer.id)} className="text-slate-400 hover:text-blue-600 transition-colors">
                    {selectedForCompare.includes(offer.id) ? <CheckSquare size={24} className="text-blue-600" /> : <Square size={24} />}
                 </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 pr-10">
               <div>
                  <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      {offer.lenderName}
                      {offer.status === 'Accepted' && <CheckCircle size={20} className="text-emerald-500" />}
                  </h4>
                  <div className="flex gap-3 text-sm text-slate-500 mt-1">
                     <span className="flex items-center gap-1"><Calendar size={14}/> {offer.term || 'Unknown Term'}</span>
                     <span className="flex items-center gap-1"><Percent size={14}/> {offer.rate || 'Unknown Rate'}</span>
                  </div>
               </div>
               <div className="text-right">
                  <h4 className="text-3xl font-bold text-blue-600">${offer.amount.toLocaleString()}</h4>
                  <p className={`text-xs font-bold uppercase mt-1 ${offer.status === 'Accepted' ? 'text-emerald-600' : 'text-slate-400'}`}>Status: {offer.status}</p>
               </div>
            </div>

            {/* Signed State */}
            {offer.status === 'Accepted' && offer.signature && (
                <div className="bg-white border border-emerald-200 rounded-lg p-4 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><PenTool size={16}/></div>
                        <div>
                            <p className="text-sm font-bold text-emerald-800">Digitally Signed</p>
                            <p className="text-xs text-emerald-600">Executed on {offer.signedDate}</p>
                        </div>
                    </div>
                    {offer.signature.startsWith('typed:') ? (
                        <span className="font-handwriting text-xl text-slate-700">{offer.signature.replace('typed:', '')}</span>
                    ) : (
                        <img src={offer.signature} alt="Signature" className="h-10 opacity-80" />
                    )}
                </div>
            )}

            {/* AI CONTRACT SENTINEL REPORT */}
            {offer.aiAnalysis && (
               <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                     <h5 className="font-bold text-slate-800 flex items-center gap-2">
                        <Shield className={offer.aiAnalysis.safetyScore > 75 ? 'text-emerald-500' : offer.aiAnalysis.safetyScore > 50 ? 'text-amber-500' : 'text-red-500'} size={18} />
                        AI Contract Sentinel Report
                     </h5>
                     <div className={`px-3 py-1 rounded-full text-xs font-bold border ${offer.aiAnalysis.recommendation === 'Sign' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : offer.aiAnalysis.recommendation === 'Negotiate' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        AI Advice: {offer.aiAnalysis.recommendation}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                     {/* Score Gauge */}
                     <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg ${offer.aiAnalysis.safetyScore > 75 ? 'border-emerald-500 text-emerald-700' : offer.aiAnalysis.safetyScore > 50 ? 'border-amber-500 text-amber-700' : 'border-red-500 text-red-700'}`}>
                           {offer.aiAnalysis.safetyScore}
                        </div>
                        <div>
                           <p className="text-xs font-bold uppercase text-slate-400">Safety Score</p>
                           <p className="text-xs text-slate-500 leading-tight">0-100 Risk Index</p>
                        </div>
                     </div>
                     {/* True APR */}
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <Scale size={24} className="text-blue-500" />
                         </div>
                         <div>
                            <p className="text-xs font-bold uppercase text-slate-400">True APR</p>
                            <p className="font-bold text-lg text-slate-800">{offer.aiAnalysis.trueApr}%</p>
                         </div>
                     </div>
                     {/* Summary */}
                     <div className="text-xs text-slate-600 leading-relaxed border-l-2 border-slate-200 pl-3">
                        {offer.aiAnalysis.summary}
                     </div>
                  </div>

                  {/* Risks List */}
                  {offer.aiAnalysis.risks.length > 0 && (
                     <div className="space-y-2">
                        {offer.aiAnalysis.risks.map((risk, idx) => (
                           <div key={idx} className={`flex gap-2 items-start p-2 rounded text-xs ${risk.type === 'Critical' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>
                              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                              <div>
                                 <strong>{risk.clause}:</strong> {risk.description}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            )}
            
            {/* Logic for Missing Analysis */}
            {!offer.aiAnalysis && !offer.status.includes('Accepted') && (
               <div className="flex items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 mb-6 group">
                  {isAnalyzing === offer.id ? (
                     <div className="flex flex-col items-center text-blue-600">
                        <Loader className="animate-spin mb-2" />
                        <span className="text-xs font-bold">Scanning Legal Contract...</span>
                     </div>
                  ) : (
                     <div 
                        className="text-center cursor-pointer" 
                        onClick={() => { setSelectedOfferIdForUpload(offer.id); fileInputRef.current?.click(); }}
                     >
                        <Shield className="mx-auto text-slate-300 mb-2 group-hover:text-blue-500 transition-colors" size={32} />
                        <p className="text-sm font-bold text-slate-600 group-hover:text-blue-600">Scan Contract with AI Sentinel</p>
                        <p className="text-xs text-slate-400">Upload PDF to detect predatory fees & calculating True APR</p>
                     </div>
                  )}
               </div>
            )}

            {!isAdmin && offer.status === 'Sent' && (
               <div className="flex gap-3 justify-end border-t border-slate-100 pt-4">
                  <button 
                    onClick={() => setSigningOffer(offer)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                  >
                     <PenTool size={16} /> Review & Sign Contract
                  </button>
               </div>
            )}
          </div>
        ))}
      </div>
      
      <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileUpload} />
      
      {signingOffer && (
        <SmartContractSigner 
            offer={signingOffer} 
            onClose={() => setSigningOffer(null)} 
            onSign={handleSignComplete}
        />
      )}

      {/* COMPARISON MODAL */}
      {showComparison && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowComparison(false)}>
           <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-in-right" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BarChart3 size={24} className="text-blue-600"/> Offer Comparison Engine</h2>
                    <p className="text-slate-500 text-sm">AI analysis of your best options.</p>
                 </div>
                 <button onClick={() => setShowComparison(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {comparisonOffers.map(offer => {
                       const isCheapest = getBestOffer()?.id === offer.id;
                       const isLowestPmt = getLowestPayment()?.id === offer.id;
                       // Simplified cost calculation for display
                       const cost = (offer.amount * Number(offer.rate)) - offer.amount;
                       
                       return (
                          <div key={offer.id} className={`bg-white rounded-xl border-2 p-6 shadow-sm flex flex-col relative ${isCheapest ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
                             {isCheapest && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Lowest Cost</div>}
                             {isLowestPmt && <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-br-xl">Lowest Payment</div>}
                             
                             <h3 className="font-bold text-slate-900 text-lg mb-1">{offer.lenderName}</h3>
                             <p className="text-3xl font-black text-slate-800 mb-6">${offer.amount.toLocaleString()}</p>
                             
                             <div className="space-y-4 flex-1">
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                   <span className="text-slate-500 text-sm">Term</span>
                                   <span className="font-bold text-slate-800">{offer.term}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                   <span className="text-slate-500 text-sm">Rate</span>
                                   <span className="font-bold text-slate-800">{offer.rate}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                   <span className="text-slate-500 text-sm">Payment</span>
                                   <span className="font-bold text-slate-800">${offer.paymentAmount}/ {offer.payment === 'Daily' ? 'day' : 'week'}</span>
                                </div>
                                <div className="flex justify-between bg-slate-50 p-2 rounded">
                                   <span className="text-slate-500 text-sm">Total Cost</span>
                                   <span className={`font-bold ${isCheapest ? 'text-emerald-600' : 'text-red-600'}`}>${cost.toLocaleString()}</span>
                                </div>
                             </div>

                             <button 
                                onClick={() => { setShowComparison(false); setSigningOffer(offer); }}
                                className="w-full mt-6 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
                             >
                                Select This Offer <ArrowRight size={16} />
                             </button>
                          </div>
                       );
                    })}
                 </div>

                 {/* AI Recommendation Box */}
                 <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white p-6 rounded-xl shadow-lg flex gap-4 items-start">
                    <div className="bg-white/10 p-3 rounded-lg"><Sparkles className="text-yellow-400" size={24} /></div>
                    <div>
                       <h4 className="font-bold text-lg mb-2">AI Broker Recommendation</h4>
                       <p className="text-indigo-100 leading-relaxed text-sm">
                          Based on your goal of <strong>Cash Flow Optimization</strong>, the offer from <strong>{getLowestPayment()?.lenderName}</strong> is superior. 
                          Although it costs slightly more in total interest than {getBestOffer()?.lenderName}, the lower daily payment reduces strain on your operating account by approx 20%.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OfferManager;