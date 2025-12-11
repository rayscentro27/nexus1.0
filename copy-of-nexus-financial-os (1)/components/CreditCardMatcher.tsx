
import React, { useState } from 'react';
import { Contact, CreditCardProduct, ClientTask } from '../types';
import { CreditCard, Search, ArrowRight } from 'lucide-react';

const CARD_DATABASE: CreditCardProduct[] = [
  { id: 'cc_chase', name: 'Ink Business Preferred', issuer: 'Chase', network: 'Visa', minScore: 700, bureauPulled: 'Experian', annualFee: 95, introOffer: '100k Points', applicationLink: 'https://chase.com', recommendedFor: 'Travel' },
  { id: 'cc_amex', name: 'Business Gold', issuer: 'Amex', network: 'Amex', minScore: 680, bureauPulled: 'Experian', annualFee: 295, introOffer: '70k Points', applicationLink: 'https://amex.com', recommendedFor: 'Rewards' },
  { id: 'cc_cap1', name: 'Spark Cash', issuer: 'Capital One', network: 'Mastercard', minScore: 690, bureauPulled: 'TransUnion', annualFee: 0, introOffer: '0% APR', applicationLink: 'https://capitalone.com', recommendedFor: 'Cash Back' }
];

interface CreditCardMatcherProps { contact: Contact; onAssignTask: (id: string, task: ClientTask) => void; }

const CreditCardMatcher: React.FC<CreditCardMatcherProps> = ({ contact, onAssignTask }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const clientScore = contact.creditAnalysis?.score || 0;
  const getApprovalOdds = (card: CreditCardProduct) => {
    if (clientScore >= card.minScore + 20) return { level: 'High', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    if (clientScore >= card.minScore) return { level: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    return { level: 'Low', color: 'text-red-600 bg-red-50 border-red-100' };
  };

  const handleRecommend = (card: CreditCardProduct) => {
    const newTask: ClientTask = {
      id: `task_cc_${card.id}_${Date.now()}`, title: `Apply for ${card.name}`, description: `Recommended based on score ${clientScore}`, status: 'pending', date: new Date().toISOString().split('T')[0], type: 'action', link: card.applicationLink, linkedToGoal: true
    };
    onAssignTask(contact.id, newTask);
  };

  const filteredCards = CARD_DATABASE.filter(card => card.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
        <div><h3 className="text-lg font-bold flex items-center gap-2"><CreditCard size={24} className="text-indigo-300"/> Credit Card Intelligence</h3><p className="text-indigo-200 text-xs mt-1">Matching based on <strong>{clientScore > 0 ? `FICO ${clientScore}` : 'Unknown Score'}</strong></p></div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={16} /><input type="text" placeholder="Search cards..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-indigo-800/50 border border-indigo-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none text-white" /></div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {filteredCards.map(card => {
          const odds = getApprovalOdds(card);
          return (
            <div key={card.id} className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center">
               <div><h4 className="font-bold text-slate-900">{card.name}</h4><div className="flex gap-3 mt-1 text-xs text-slate-500"><span>{card.issuer}</span><span>Pulled: <strong>{card.bureauPulled}</strong></span><span>Offer: <span className="text-emerald-600">{card.introOffer}</span></span></div></div>
               <div className="flex items-center gap-4"><div className={`text-xs font-bold px-3 py-1 rounded-full border ${odds.color}`}>{odds.level} Odds</div><button onClick={() => handleRecommend(card)} className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">Recommend <ArrowRight size={14} /></button></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CreditCardMatcher;
