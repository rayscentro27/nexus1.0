
import React, { useState } from 'react';
import { Contact, FundedDeal } from '../types';
import { RefreshCw, DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle, ArrowRight, Mail } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface RenewalTrackerProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
}

const RenewalTracker: React.FC<RenewalTrackerProps> = ({ contacts, onUpdateContact }) => {
  const [pitchDraft, setPitchDraft] = useState<string>('');
  const [selectedDeal, setSelectedDeal] = useState<FundedDeal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock funded deals if none exist
  const getFundedDeals = (contact: Contact): FundedDeal[] => {
    if (contact.fundedDeals && contact.fundedDeals.length > 0) return contact.fundedDeals;
    
    // Create mock for demo if status is closed
    if (contact.status === 'Closed') {
       return [{
         id: `fd_${contact.id}`,
         lenderName: 'Bluevine',
         fundedDate: '2023-11-15',
         originalAmount: 50000,
         currentBalance: 22000, // < 50% means eligible
         termLengthMonths: 12,
         paymentFrequency: 'Weekly',
         paymentAmount: 1250,
         totalPayback: 65000,
         status: 'Active',
         renewalEligibleDate: '2024-03-15',
         paymentsMade: 24
       }];
    }
    return [];
  };

  const fundedContacts = contacts.filter(c => c.status === 'Closed' || (c.fundedDeals && c.fundedDeals.length > 0));

  const handleGeneratePitch = async (contact: Contact, deal: FundedDeal) => {
    setIsGenerating(true);
    setSelectedDeal(deal);
    const pitch = await geminiService.generateRenewalPitch(deal, contact);
    setPitchDraft(pitch);
    setIsGenerating(false);
  };

  const calculateProgress = (deal: FundedDeal) => {
    const paid = deal.totalPayback - deal.currentBalance;
    return (paid / deal.totalPayback) * 100;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <RefreshCw className="text-emerald-600" size={32} /> Renewal Prediction Engine
          </h1>
          <p className="text-slate-500 mt-2">Monitor repayment progress and trigger automated refinancing offers.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Active Portfolio */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Active Portfolio</h3>
           
           {fundedContacts.length === 0 ? (
             <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <DollarSign size={48} className="mx-auto mb-4 opacity-20" />
                <p>No funded deals yet.</p>
             </div>
           ) : (
             fundedContacts.map(contact => {
               const deals = getFundedDeals(contact);
               return deals.map(deal => {
                 const progress = calculateProgress(deal);
                 const isEligible = progress >= 50;
                 
                 return (
                   <div key={deal.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h4 className="font-bold text-slate-900 text-lg">{contact.company}</h4>
                            <p className="text-sm text-slate-500">{deal.lenderName} • ${deal.originalAmount.toLocaleString()}</p>
                         </div>
                         {isEligible ? (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                               <CheckCircle size={12} /> Renewal Eligible
                            </span>
                         ) : (
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                               <Clock size={12} /> Maturing
                            </span>
                         )}
                      </div>

                      <div className="mb-4">
                         <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                            <span>Repayment Progress</span>
                            <span>{Math.round(progress)}% Paid</span>
                         </div>
                         <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${isEligible ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                              style={{ width: `${progress}%` }}
                            ></div>
                         </div>
                         <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Bal: ${deal.currentBalance.toLocaleString()}</span>
                            <span>Target: 50%</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Payment</p>
                            <p className="font-bold text-slate-800">${deal.paymentAmount}</p>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Freq</p>
                            <p className="font-bold text-slate-800">{deal.paymentFrequency}</p>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Net Cash Out</p>
                            <p className="font-bold text-emerald-600">${(deal.originalAmount * 1.2 - deal.currentBalance).toLocaleString()}</p>
                         </div>
                      </div>

                      <div className="flex justify-end">
                         <button 
                           onClick={() => handleGeneratePitch(contact, deal)}
                           className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2"
                         >
                            <Mail size={16} /> Generate Renewal Offer
                         </button>
                      </div>
                   </div>
                 );
               });
             })
           )}
        </div>

        {/* Right: AI Pitch Generator */}
        <div className="lg:col-span-1">
           <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white h-full shadow-lg border border-slate-700">
              <h3 className="font-bold flex items-center gap-2 mb-4"><TrendingUp className="text-yellow-400" /> Smart Refinance</h3>
              <p className="text-sm text-slate-300 mb-6">
                 When a client pays down 50%, they qualify for more capital. Use AI to draft the perfect upsell email.
              </p>

              {isGenerating ? (
                 <div className="flex items-center justify-center py-20 text-indigo-300">
                    <RefreshCw className="animate-spin mr-2" /> Analyzing payment history...
                 </div>
              ) : pitchDraft ? (
                 <div className="animate-fade-in">
                    <div className="bg-white/10 rounded-lg p-4 mb-4 text-sm leading-relaxed text-slate-200 border border-white/10">
                       {pitchDraft}
                    </div>
                    <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                       <CheckCircle size={18} /> Send Offer
                    </button>
                 </div>
              ) : (
                 <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-xl text-slate-500">
                    <p className="text-sm">Select a deal to generate a pitch.</p>
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default RenewalTracker;
